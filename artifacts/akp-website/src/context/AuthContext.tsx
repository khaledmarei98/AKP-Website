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
import { auth } from "@/lib/firebase";
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

// ─── Firebase auth ────────────────────────────────────────────────────────────────

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

  return <AuthContext.Provider value={firebaseAuth}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
