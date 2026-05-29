import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  type User as FirebaseUser,
} from "firebase/auth";
import { auth, isConfigured } from "@/lib/firebase";
import { getUserProfile, createUserProfile, updateDocument, COLLECTIONS, type FirestoreUser } from "@/lib/firestore";
import type { User, AuthState, UserRole } from "@/types";

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (name: string, email: string, password: string, role?: UserRole, company?: string, phone?: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (data: Partial<Pick<User, "name" | "company" | "avatar" | "phone">>) => Promise<void>;
  sendVerificationEmail: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapFirestoreUser(fbUser: FirebaseUser, profile: FirestoreUser | null): User {
  return {
    id: fbUser.uid,
    name: profile?.name ?? fbUser.displayName ?? "User",
    email: fbUser.email ?? "",
    phone: profile?.phone,
    role: profile?.role ?? "client",
    company: profile?.company,
    avatar: profile?.avatar ?? fbUser.photoURL ?? undefined,
    isVerified: profile?.isVerified ?? fbUser.emailVerified ?? false,
    createdAt: fbUser.metadata.creationTime ?? new Date().toISOString(),
  };
}

// ─── Mock fallback (used when Firebase is not configured) ─────────────────────

const MOCK_USER: User = {
  id: "demo_usr_001",
  name: "Ahmed Karim",
  email: "ahmed@delta-industries.com",
  role: "client",
  company: "Delta Industries",
  isVerified: true,
  createdAt: "2024-01-15",
};

function useMockAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("akp_demo_user");
    if (stored) {
      try {
        setState({ user: JSON.parse(stored) as User, isAuthenticated: true, isLoading: false });
      } catch {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      setState((s) => ({ ...s, isLoading: false }));
    }
  }, []);

  const login = async (email: string, _password: string) => {
    await new Promise((r) => setTimeout(r, 800));
    const user = { ...MOCK_USER, email };
    localStorage.setItem("akp_demo_user", JSON.stringify(user));
    setState({ user, isAuthenticated: true, isLoading: false });
  };

  const logout = async () => {
    localStorage.removeItem("akp_demo_user");
    setState({ user: null, isAuthenticated: false, isLoading: false });
  };

  const register = async (name: string, email: string, _password: string, role: UserRole = "client", company?: string, phone?: string) => {
    await new Promise((r) => setTimeout(r, 1000));
    const user: User = { id: `demo_${Date.now()}`, name, email, phone, role, company, isVerified: true, createdAt: new Date().toISOString() };
    localStorage.setItem("akp_demo_user", JSON.stringify(user));
    setState({ user, isAuthenticated: true, isLoading: false });
  };

  const resetPassword = async (_email: string) => {
    await new Promise((r) => setTimeout(r, 800));
  };

  const updateUserProfileFn = async (data: Partial<Pick<User, "name" | "company" | "avatar" | "phone">>) => {
    setState((prev) => {
      if (!prev.user) return prev;
      const updated = { ...prev.user, ...data };
      localStorage.setItem("akp_demo_user", JSON.stringify(updated));
      return { ...prev, user: updated };
    });
  };

  const sendVerificationEmail = async () => { /* no-op in demo mode */ };
  const refreshUser = async () => { /* no-op in demo mode */ };

  return { ...state, login, logout, register, resetPassword, updateUserProfile: updateUserProfileFn, sendVerificationEmail, refreshUser };
}

// ─── Real Firebase auth ────────────────────────────────────────────────────────

function useFirebaseAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        try {
          const profile = await getUserProfile(fbUser.uid);
          const user = mapFirestoreUser(fbUser, profile);
          setState({ user, isAuthenticated: true, isLoading: false });
        } catch {
          const user = mapFirestoreUser(fbUser, null);
          setState({ user, isAuthenticated: true, isLoading: false });
        }
      } else {
        setState({ user: null, isAuthenticated: false, isLoading: false });
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const { user: fbUser } = await signInWithEmailAndPassword(auth, email, password);
    try {
      await updateDocument(COLLECTIONS.USERS, fbUser.uid, { lastLoginAt: new Date().toISOString() });
    } catch {
      // Firestore profile may not exist yet — not a login failure
    }
  };

  const logout = async () => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    await signOut(auth);
  };

  const register = async (name: string, email: string, password: string, role: UserRole = "client", company?: string, phone?: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    const { user: fbUser } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(fbUser, { displayName: name });
    await createUserProfile(fbUser.uid, {
      name,
      email,
      role,
      isVerified: fbUser.emailVerified,
      ...(company ? { company } : {}),
      ...(phone ? { phone } : {}),
    });
    if (!fbUser.emailVerified) {
      await sendEmailVerification(fbUser);
    }
  };

  const resetPassword = async (email: string) => {
    if (!auth) throw new Error("Firebase Auth not initialized");
    await sendPasswordResetEmail(auth, email);
  };

  const sendVerificationEmailFn = async () => {
    if (!auth?.currentUser) throw new Error("No authenticated user");
    await sendEmailVerification(auth.currentUser);
  };

  const refreshUser = async () => {
    if (!auth?.currentUser) return;
    await auth.currentUser.reload();
    const fbUser = auth.currentUser;
    try {
      const profile = await getUserProfile(fbUser.uid);
      const user = mapFirestoreUser(fbUser, profile);
      setState((prev) => ({ ...prev, user }));
    } catch {
      const user = mapFirestoreUser(fbUser, null);
      setState((prev) => ({ ...prev, user }));
    }
  };

  const updateUserProfileFn = async (data: Partial<Pick<User, "name" | "company" | "avatar" | "phone">>) => {
    if (!auth?.currentUser) throw new Error("No authenticated user");
    const { name, avatar } = data;
    if (name || avatar) {
      await updateProfile(auth.currentUser, {
        ...(name && { displayName: name }),
        ...(avatar && { photoURL: avatar }),
      });
    }
    await updateDocument(COLLECTIONS.USERS, auth.currentUser.uid, data);
    const profile = await getUserProfile(auth.currentUser.uid);
    const user = mapFirestoreUser(auth.currentUser, profile);
    setState((prev) => ({ ...prev, user }));
  };

  return {
    ...state,
    login,
    logout,
    register,
    resetPassword,
    updateUserProfile: updateUserProfileFn,
    sendVerificationEmail: sendVerificationEmailFn,
    refreshUser,
  };
}

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const firebaseAuth = useFirebaseAuth();
  const mockAuth = useMockAuth();

  const value = isConfigured ? firebaseAuth : mockAuth;

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
