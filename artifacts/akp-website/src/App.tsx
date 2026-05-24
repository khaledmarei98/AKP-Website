import { Switch, Route, Router as WouterRouter, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { LanguageProvider } from "@/context/LanguageContext";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import About from "@/pages/about";
import Services from "@/pages/services";
import Library from "@/pages/library";
import Courses from "@/pages/courses";
import Articles from "@/pages/articles";
import ArticleDetail from "@/pages/article-detail";
import Contact from "@/pages/contact";
import Pricing from "@/pages/pricing";
import Tools from "@/pages/tools";
import Booking from "@/pages/booking";
import PartnerPortal from "@/pages/partner-portal";

import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import ForgotPassword from "@/pages/auth/forgot-password";
import VerifyEmail from "@/pages/auth/verify-email";

import Dashboard from "@/pages/dashboard/index";
import CourseDetail from "@/pages/course-detail";
import Learn from "@/pages/learn";

import ChatWidget from "@/components/ChatWidget";

const queryClient = new QueryClient();

function LoadingScreen({ dark = false }: { dark?: boolean }) {
  return (
    <div className={`min-h-screen flex items-center justify-center ${dark ? "bg-[#060E1E]" : "bg-background"}`}>
      <div className={`w-8 h-8 border-2 rounded-full animate-spin ${dark ? "border-[#C9A84C]/30 border-t-[#C9A84C]" : "border-accent/30 border-t-accent"}`} />
    </div>
  );
}

/** Requires authenticated + email verified. Unverified → /auth/verify-email, unauthenticated → /auth/login */
function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Redirect to="/auth/login" />;
  if (!user?.isVerified) return <Redirect to="/auth/verify-email" />;
  return <Component />;
}

/** Only for authenticated-but-unverified users. Verified → /dashboard, unauthenticated → /auth/login */
function VerifyEmailRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen dark />;
  if (!isAuthenticated) return <Redirect to="/auth/login" />;
  if (user?.isVerified) return <Redirect to="/dashboard" />;
  return <Component />;
}

/** Only for unauthenticated users. Verified → /dashboard, unverified → /auth/verify-email */
function PublicOnlyRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <LoadingScreen dark />;
  if (isAuthenticated && user?.isVerified) return <Redirect to="/dashboard" />;
  if (isAuthenticated && !user?.isVerified) return <Redirect to="/auth/verify-email" />;
  return <Component />;
}

function Router() {
  return (
    <Switch>
      {/* Public routes */}
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/services" component={Services} />
      <Route path="/library" component={Library} />
      <Route path="/courses/:slug" component={CourseDetail} />
      <Route path="/courses" component={Courses} />
      <Route path="/articles/:slug" component={ArticleDetail} />
      <Route path="/articles" component={Articles} />
      <Route path="/contact" component={Contact} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/tools" component={Tools} />
      <Route path="/booking" component={Booking} />
      <Route path="/partner-portal" component={PartnerPortal} />

      {/* Auth routes */}
      <Route path="/auth/login">
        {() => <PublicOnlyRoute component={Login} />}
      </Route>
      <Route path="/auth/register">
        {() => <PublicOnlyRoute component={Register} />}
      </Route>
      <Route path="/auth/forgot-password" component={ForgotPassword} />
      <Route path="/auth/verify-email">
        {() => <VerifyEmailRoute component={VerifyEmail} />}
      </Route>

      {/* Protected routes */}
      <Route path="/learn/:courseSlug">
        {() => <ProtectedRoute component={Learn} />}
      </Route>

      {/* Protected dashboard routes */}
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>

      {/* Legacy portal redirect */}
      <Route path="/portal">
        {() => <Redirect to="/dashboard" />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <LanguageProvider>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                <Router />
                <ChatWidget />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </LanguageProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
