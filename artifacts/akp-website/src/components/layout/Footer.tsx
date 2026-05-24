import { Link } from "wouter";
import { Mail, Phone, MapPin, Linkedin, Facebook, Twitter, Instagram, ArrowRight } from "lucide-react";

const serviceLinks = [
  "Financial Accounting",
  "Tax Consulting",
  "ERP & Accounting Systems",
  "Payroll Management",
  "HR Management",
  "Feasibility Studies",
];

const quickLinks = [
  { label: "About AKP", href: "/about" },
  { label: "Services", href: "/services" },
  { label: "Pricing", href: "/pricing" },
  { label: "Courses", href: "/courses" },
  { label: "Digital Library", href: "/library" },
  { label: "Articles", href: "/articles" },
  { label: "Financial Tools", href: "/tools" },
  { label: "Book Consultation", href: "/booking" },
  { label: "Partner Portal", href: "/partner-portal" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Contact Us", href: "/contact" },
];

export default function Footer() {
  return (
    <footer className="bg-[#060E1E] dark:bg-[#030810] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-lg gold-gradient flex items-center justify-center">
                <span className="text-[#0A1628] font-bold text-lg">AKP</span>
              </div>
              <div>
                <div className="font-bold text-lg">AKP Consulting</div>
                <div className="text-[#C9A84C] text-xs font-medium tracking-wider">EGYPT</div>
              </div>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-6">
              Egypt's premier accounting, finance, tax, and HR consulting ecosystem. Trusted by 500+ businesses across Egypt.
            </p>
            <div className="flex items-center gap-3">
              {[Linkedin, Facebook, Twitter, Instagram].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#C9A84C]/20 hover:text-[#C9A84C] flex items-center justify-center transition-all"
                  data-testid={`link-social-${i}`}
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wider mb-5">Quick Links</h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm flex items-center gap-2 group transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wider mb-5">Services</h4>
            <ul className="space-y-2.5">
              {serviceLinks.map((service) => (
                <li key={service}>
                  <Link
                    href="/services"
                    className="text-white/60 hover:text-white text-sm flex items-center gap-2 group transition-colors"
                  >
                    <ArrowRight className="w-3 h-3 text-[#C9A84C] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact + Newsletter */}
          <div>
            <h4 className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wider mb-5">Contact</h4>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-3 text-sm text-white/60">
                <MapPin className="w-4 h-4 text-[#C9A84C] mt-0.5 shrink-0" />
                <span>15 Tahrir Square, Downtown Cairo, Egypt</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Phone className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <span>+20 2 1234 5678</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-white/60">
                <Mail className="w-4 h-4 text-[#C9A84C] shrink-0" />
                <span>info@akp-consulting.com</span>
              </li>
            </ul>
            <h4 className="text-[#C9A84C] font-semibold text-sm uppercase tracking-wider mb-3">Newsletter</h4>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-[#C9A84C]"
                data-testid="input-newsletter"
              />
              <button className="px-3 py-2 rounded-lg gold-gradient text-[#0A1628] font-semibold text-sm hover:opacity-90 transition-opacity" data-testid="button-subscribe">
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            &copy; {new Date().getFullYear()} AKP Consulting. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-white/40 text-sm">
            <a href="#" className="hover:text-white/70 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white/70 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white/70 transition-colors">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
