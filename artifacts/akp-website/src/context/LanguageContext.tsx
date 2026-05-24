import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import type { Language, Direction } from "@/types";

interface LanguageContextValue {
  lang: Language;
  dir: Direction;
  setLang: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  EN: {
    "nav.home": "Home",
    "nav.about": "About",
    "nav.services": "Services",
    "nav.courses": "Courses",
    "nav.articles": "Articles",
    "nav.library": "Library",
    "nav.contact": "Contact",
    "nav.book": "Book Consultation",
    "nav.login": "Sign In",
    "nav.register": "Get Started",
    "nav.dashboard": "Dashboard",
    "nav.logout": "Sign Out",
    "hero.badge": "Egypt's Premier Consulting Firm",
    "hero.title": "Your Trusted Partner in Accounting, Finance & HR Excellence",
    "hero.cta.primary": "Book Consultation",
    "hero.cta.secondary": "Explore Resources",
    "footer.rights": "All rights reserved.",
  },
  AR: {
    "nav.home": "الرئيسية",
    "nav.about": "عن الشركة",
    "nav.services": "الخدمات",
    "nav.courses": "الدورات",
    "nav.articles": "المقالات",
    "nav.library": "المكتبة",
    "nav.contact": "تواصل معنا",
    "nav.book": "احجز استشارة",
    "nav.login": "تسجيل الدخول",
    "nav.register": "ابدأ الآن",
    "nav.dashboard": "لوحة التحكم",
    "nav.logout": "تسجيل الخروج",
    "hero.badge": "شركة الاستشارات الرائدة في مصر",
    "hero.title": "شريكك الموثوق في المحاسبة والمالية والموارد البشرية",
    "hero.cta.primary": "احجز استشارة",
    "hero.cta.secondary": "استكشف الموارد",
    "footer.rights": "جميع الحقوق محفوظة.",
  },
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>("EN");

  useEffect(() => {
    const stored = localStorage.getItem("akp_lang") as Language | null;
    if (stored && (stored === "EN" || stored === "AR")) {
      setLangState(stored);
      document.documentElement.dir = stored === "AR" ? "rtl" : "ltr";
      document.documentElement.lang = stored === "AR" ? "ar" : "en";
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem("akp_lang", newLang);
    document.documentElement.dir = newLang === "AR" ? "rtl" : "ltr";
    document.documentElement.lang = newLang === "AR" ? "ar" : "en";
  };

  const t = (key: string): string => {
    return translations[lang][key] ?? translations["EN"][key] ?? key;
  };

  const dir: Direction = lang === "AR" ? "rtl" : "ltr";

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
