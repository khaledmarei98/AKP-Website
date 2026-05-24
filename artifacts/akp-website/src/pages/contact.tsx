import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, useInView } from "framer-motion";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Phone, Mail, Clock, Linkedin, Facebook, Twitter, Instagram, MessageCircle, CheckCircle } from "lucide-react";
import { createContactMessage } from "@/lib/firestore";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(8, "Please enter a valid phone number"),
  service: z.string().min(1, "Please select a service"),
  message: z.string().min(20, "Message must be at least 20 characters"),
});

type FormValues = z.infer<typeof formSchema>;

const services = [
  "Financial Accounting",
  "Tax Consulting",
  "ERP & Accounting Systems",
  "Payroll Management",
  "HR Management",
  "Recruitment Support",
  "Financial Analysis",
  "Cost Accounting",
  "Feasibility Studies",
  "Internal Auditing",
  "Business Consulting",
  "General Inquiry",
];

const hours = [
  { day: "Sunday – Thursday", time: "9:00 AM – 6:00 PM" },
  { day: "Saturday", time: "10:00 AM – 3:00 PM" },
  { day: "Friday", time: "Closed" },
];

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
    >
      {children}
    </motion.div>
  );
}

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      service: "",
      message: "",
    },
  });

  async function onSubmit(data: FormValues) {
    try {
      await createContactMessage({
        name: data.name,
        email: data.email,
        phone: data.phone,
        service: data.service,
        message: data.message,
        source: "contact_form",
      });
      setSubmitted(true);
    } catch {
      toast.error("Failed to send message. Please try again or call us directly.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-16 bg-[#060E1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#C9A84C] text-sm font-medium mb-4">
              Get in Touch
            </div>
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-white mb-4">
              Let's Talk About Your Business
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto">
              Book a free 30-minute consultation or send us a message. Our team responds within 24 hours on business days.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main content */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Form */}
            <div className="lg:col-span-3">
              <FadeIn>
                <div className="bg-card border border-border rounded-3xl p-8">
                  <h2 className="text-2xl font-bold text-foreground mb-2">Book a Consultation</h2>
                  <p className="text-muted-foreground text-sm mb-8">Fill in your details and one of our senior advisors will contact you within 24 hours.</p>

                  {submitted ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                      </div>
                      <h3 className="text-2xl font-bold text-foreground mb-3">Message Sent!</h3>
                      <p className="text-muted-foreground mb-6">
                        Thank you for reaching out. We'll contact you within 24 hours to confirm your consultation.
                      </p>
                      <button
                        onClick={() => { setSubmitted(false); form.reset(); }}
                        className="px-6 py-3 rounded-xl gold-gradient text-[#0A1628] font-semibold"
                        data-testid="button-send-another"
                      >
                        Send Another Message
                      </button>
                    </motion.div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                        <div className="grid sm:grid-cols-2 gap-5">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Ahmed Karim" {...field} data-testid="input-contact-name" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="ahmed@company.com" {...field} data-testid="input-contact-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid sm:grid-cols-2 gap-5">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                  <Input placeholder="+20 10 1234 5678" {...field} data-testid="input-contact-phone" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="service"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Service of Interest</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-contact-service">
                                      <SelectValue placeholder="Select a service" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {services.map((s) => (
                                      <SelectItem key={s} value={s}>{s}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea
                                  placeholder="Tell us about your business and what you need help with..."
                                  rows={5}
                                  {...field}
                                  data-testid="textarea-contact-message"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <button
                          type="submit"
                          disabled={form.formState.isSubmitting}
                          className="w-full py-3.5 rounded-xl gold-gradient text-[#0A1628] font-bold text-base hover:opacity-90 transition-opacity disabled:opacity-60"
                          data-testid="button-contact-submit"
                        >
                          {form.formState.isSubmitting ? "Sending..." : "Send Message"}
                        </button>
                      </form>
                    </Form>
                  )}
                </div>
              </FadeIn>
            </div>

            {/* Info panel */}
            <div className="lg:col-span-2 space-y-6">
              <FadeIn delay={0.1}>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-5">Contact Information</h3>
                  <div className="space-y-4">
                    {[
                      { icon: MapPin, label: "Address", value: "15 Tahrir Square, Downtown Cairo, Egypt 11111" },
                      { icon: Phone, label: "Phone", value: "+20 2 1234 5678" },
                      { icon: Mail, label: "Email", value: "info@akp-consulting.com" },
                    ].map(({ icon: Icon, label, value }) => (
                      <div key={label} className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-0.5">{label}</div>
                          <div className="text-sm text-foreground font-medium">{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* WhatsApp button */}
                  <a
                    href="https://wa.me/201012345678"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#25D366] text-white font-semibold text-sm hover:bg-[#20b858] transition-colors"
                    data-testid="link-whatsapp"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chat on WhatsApp
                  </a>

                  {/* Social icons */}
                  <div className="mt-4 flex items-center gap-2">
                    {[Linkedin, Facebook, Twitter, Instagram].map((Icon, i) => (
                      <a
                        key={i}
                        href="#"
                        className="w-9 h-9 rounded-lg bg-muted hover:bg-accent/10 hover:text-accent flex items-center justify-center transition-all"
                        data-testid={`link-contact-social-${i}`}
                      >
                        <Icon className="w-4 h-4" />
                      </a>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.15}>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-accent" /> Business Hours
                  </h3>
                  <div className="space-y-3">
                    {hours.map((h) => (
                      <div key={h.day} className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{h.day}</span>
                        <span className={`font-medium ${h.time === "Closed" ? "text-red-500" : "text-foreground"}`}>{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </FadeIn>

              <FadeIn delay={0.2}>
                {/* Map placeholder */}
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="h-48 bg-muted flex flex-col items-center justify-center gap-3">
                    <div className="w-12 h-12 rounded-full gold-gradient flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-[#0A1628]" />
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-foreground text-sm">AKP Consulting — Cairo</div>
                      <div className="text-muted-foreground text-xs">15 Tahrir Square, Downtown Cairo</div>
                    </div>
                    <a
                      href="https://maps.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg border border-border text-sm text-foreground hover:border-accent hover:text-accent transition-all"
                      data-testid="link-google-maps"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
