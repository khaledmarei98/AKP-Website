export type UserRole =
  | "super_admin"
  | "admin_staff"
  | "instructor"
  | "client"
  | "student"
  | "accounting_partner";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  company?: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export type Language = "EN" | "AR";
export type Direction = "ltr" | "rtl";

export interface Course {
  id: number;
  title: string;
  category: string;
  instructor: string;
  duration: string;
  students: number;
  rating: number;
  reviews: number;
  level: "Beginner" | "Intermediate" | "Advanced";
  featured?: boolean;
  progress?: number;
  description: string;
  topics: string[];
  enrolled?: boolean;
  price?: number;
  isFree?: boolean;
}

export interface Article {
  id: number;
  title: string;
  category: string;
  excerpt: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  tags: string[];
  featured?: boolean;
  slug?: string;
}

export interface Resource {
  id: number;
  title: string;
  description: string;
  category: string;
  fileType: "PDF" | "Excel" | "Word";
  size: string;
  downloads: number;
  featured?: boolean;
  recent?: boolean;
  pages?: number;
  author: string;
  date: string;
}

export interface Booking {
  id: string;
  service: string;
  date: string;
  time: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  advisor?: string;
  notes?: string;
}

export interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: "paid" | "pending" | "overdue";
  date: string;
  dueDate: string;
  description: string;
}

export interface Notification {
  id: number;
  type: "success" | "info" | "warning" | "error";
  message: string;
  time: string;
  read?: boolean;
}

export interface SupportTicket {
  id: string;
  subject: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high";
  createdAt: string;
  lastUpdate: string;
  messages?: number;
}

export interface ServiceCategory {
  id: string;
  title: string;
  description: string;
  icon: string;
  features: string[];
  slug: string;
}
