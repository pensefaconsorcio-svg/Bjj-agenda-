
export interface User {
  id: number;
  email: string;
  name: string;
  role: 'admin' | 'user';
  paymentDueDate: string | null; // YYYY-MM-DD format
}

export interface ClassSession {
  id: number;
  day: string;
  time: string;
  name: string;
  instructor: string;
  level: string;
}

export interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Booking {
  id: string; // Composite key: `${tatameId}-${date}-${timeSlot}`
  tatameId: string;
  tatameName: string; // For display purposes
  userId: number;
  userEmail: string;
  date: string; // YYYY-MM-DD
  timeSlot: string;
  status: 'pending' | 'confirmed';
}

export interface TatameArea {
  id: string;
  name: string;
  timeSlots: string[];
}

export interface PromotionPlan {
  id: number;
  name: string;
  price: number;
  duration: string;
  total: number | null;
  features: string[];
  isBestValue: boolean;
}

export interface SiteSettings {
  academyName: string;
  instagramUrl: string;
  facebookUrl: string;
  xUrl: string;
  whatsappUrl: string;
  pixKey: string;
  paymentInstructions: string;
  logoUrl: string | null;
  loginImageUrl: string | null;
}

export type View = 'dashboard' | 'schedule' | 'announcements' | 'store' | 'booking' | 'promotions' | 'settings' | 'userManagement';