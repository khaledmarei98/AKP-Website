import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, ChevronDown, LogOut, LayoutDashboard, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

const publicNavLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Services", href: "/services" },
  {
    label: "Solutions",
    href: "#",
    children: [
      { label: "Online Courses", href: "/courses" },
      { label: "Resource Library", href: "/library" },
      { label: "Articles & Insights", href: "/articles" },
      { label: "Financial Tools", href: "/tools" },
      { label: "Pricing", href: "/pricing" },
    ],
  },
  { label: "Partner Portal", href: "/partner-portal" },
  { label: "Contact", href: "/contact" },
];

export default function Navbar() {
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const { lang, setLang } = useLanguage();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenDropdown(null);
    setUserMenuOpen(false);
  }, [location]);

  const isActive = (href: string) =>
    href === "/" ? location === "/" : href !== "#" && location.startsWith(href);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-[#0A1628]/95 backdrop-blur-md shadow-lg" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0">
              <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                <span className="text-[#0A1628] font-bold text-lg">AKP</span>
              </div>
              <div className="hidden sm:block">
                <div className="text-white font-bold text-lg leading-tight">AKP</div>
                <div className="text-[#C9A84C] text-xs font-medium tracking-wider">CONSULTING</div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {publicNavLinks.map((link) =>
                link.children ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => setOpenDropdown(link.label)}
                    onMouseLeave={() => setOpenDropdown(null)}
                  >
                    <button
                      className="flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
                      data-testid={`button-dropdown-${link.label.toLowerCase()}`}
                    >
                      {link.label}
                      <ChevronDown className={`w-3.5 h-3.5 transition-transform ${openDropdown === link.label ? "rotate-180" : ""}`} />
                    </button>
                    <AnimatePresence>
                      {openDropdown === link.label && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.97 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 mt-1 w-52 bg-[#0A1628]/98 backdrop-blur-md border border-white/10 rounded-xl shadow-xl py-2 z-50"
                        >
                          {link.children.map((child) => (
                            <Link
                              key={child.href}
                              href={child.href}
                              className={`block px-4 py-2.5 text-sm transition-colors ${isActive(child.href) ? "text-[#C9A84C]" : "text-white/70 hover:text-white hover:bg-white/8"}`}
                            >
                              {child.label}
                            </Link>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive(link.href)
                        ? "text-[#C9A84C] bg-white/10"
                        : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    {link.label}
                  </Link>
                )
              )}
            </nav>

            {/* Right controls */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Language toggle */}
              <button
                onClick={() => setLang(lang === "EN" ? "AR" : "EN")}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 text-xs font-semibold transition-all"
                data-testid="button-language"
              >
                {lang} <ChevronDown className="w-3 h-3" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg border border-white/20 text-white/80 hover:text-white hover:border-white/40 transition-all"
                data-testid="button-theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>

              {/* Auth state */}
              {isAuthenticated ? (
                <div className="relative hidden sm:block">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-white/20 hover:border-white/40 transition-all"
                    data-testid="button-user-menu"
                  >
                    <div className="w-7 h-7 rounded-full gold-gradient flex items-center justify-center text-[#0A1628] font-bold text-sm">
                      {user?.name?.charAt(0) ?? "A"}
                    </div>
                    <span className="text-white/80 text-sm font-medium">{user?.name?.split(" ")[0]}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-white/60 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full right-0 mt-2 w-52 bg-[#0A1628]/98 backdrop-blur-md border border-white/10 rounded-xl shadow-xl py-2"
                      >
                        <div className="px-4 py-2.5 border-b border-white/10 mb-1">
                          <div className="text-white font-medium text-sm">{user?.name}</div>
                          <div className="text-white/50 text-xs">{user?.email}</div>
                        </div>
                        <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/8 transition-colors">
                          <LayoutDashboard className="w-4 h-4" /> Dashboard
                        </Link>
                        <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-white/70 hover:text-white hover:bg-white/8 transition-colors">
                          <User className="w-4 h-4" /> Account Settings
                        </Link>
                        <button
                          onClick={() => logout()}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-400 hover:bg-white/8 transition-colors border-t border-white/10 mt-1"
                          data-testid="button-logout-menu"
                        >
                          <LogOut className="w-4 h-4" /> Sign Out
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg border border-white/25 text-white/80 hover:text-white hover:border-white/50 text-sm font-medium transition-all"
                    data-testid="link-login"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/booking"
                    className="hidden sm:inline-flex px-5 py-2.5 rounded-lg gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity shadow-md"
                    data-testid="link-book-consultation"
                  >
                    Book Consultation
                  </Link>
                </>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 rounded-lg border border-white/20 text-white transition-all"
                data-testid="button-mobile-menu"
              >
                {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 left-0 right-0 z-40 bg-[#0A1628]/98 backdrop-blur-md border-b border-white/10 lg:hidden max-h-[80vh] overflow-y-auto"
          >
            <div className="max-w-7xl mx-auto px-4 py-4 space-y-1">
              {publicNavLinks.map((link) =>
                link.children ? (
                  <div key={link.label}>
                    <div className="px-4 py-2 text-[#C9A84C] text-xs font-semibold uppercase tracking-wider">{link.label}</div>
                    {link.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        className={`block pl-8 pr-4 py-2.5 rounded-lg text-sm font-medium transition-all ${isActive(child.href) ? "text-[#C9A84C] bg-white/10" : "text-white/70 hover:text-white hover:bg-white/8"}`}
                      >
                        {child.label}
                      </Link>
                    ))}
                  </div>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${isActive(link.href) ? "text-[#C9A84C] bg-white/10" : "text-white/80 hover:text-white hover:bg-white/10"}`}
                  >
                    {link.label}
                  </Link>
                )
              )}

              <div className="pt-3 pb-2 border-t border-white/10 space-y-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setLang(lang === "EN" ? "AR" : "EN")}
                    className="px-3 py-1.5 rounded-lg border border-white/20 text-white/80 text-xs font-semibold"
                  >
                    {lang}
                  </button>
                </div>
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-accent/10 text-accent font-semibold text-sm">
                      <LayoutDashboard className="w-4 h-4" /> My Dashboard
                    </Link>
                    <button onClick={() => logout()} className="w-full text-left px-4 py-2.5 rounded-lg text-red-400 text-sm hover:bg-white/5 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Link href="/auth/login" className="flex-1 text-center py-2.5 rounded-lg border border-white/25 text-white text-sm font-medium">
                      Sign In
                    </Link>
                    <Link href="/booking" className="flex-1 text-center py-2.5 rounded-lg gold-gradient text-[#0A1628] font-semibold text-sm">
                      Book Consultation
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
