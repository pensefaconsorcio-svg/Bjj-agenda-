export type Belt = 'branca' | 'azul' | 'roxa' | 'marrom' | 'preta';

export interface User {
  id: string; // Changed from number to string for Supabase UUID
  email: string;
  name: string;
  role: 'admin' | 'user' | 'mestre';
  payment_due_date: string | null;
  belt: Belt;
}

export interface ClassSession {
  id?: number;
  day: string;
  time: string;
  name: string;
  instructor: string;
  level: string;
}

export interface Announcement {
  id?: number;
  title: string;
  date: string;
  content: string;
}

export interface Product {
  id?: number;
  name: string;
  price: number;
  image_url: string; // Changed from imageUrl
  category: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Booking {
  id?: number;
  booking_key: string; // date-tatame_id-time_slot
  tatame_id: string;
  tatame_name: string;
  user_id: string;
  user_email: string;
  date: string; // YYYY-MM-DD
  time_slot: string;
  status: 'pending' | 'confirmed';
}

export interface TatameArea {
  id: string;
  name: string;
  time_slots: string[];
}

export interface PromotionPlan {
  id?: number;
  name: string;
  price: number;
  duration: string;
  total: number | null;
  features: string[];
  is_best_value: boolean;
}

export interface SiteSettings {
  id: number;
  academy_name: string;
  instagram_url: string;
  facebook_url: string;
  x_url: string;
  whatsapp_url: string;
  pix_key: string;
  payment_instructions: string;
  logo_url: string | null;
  login_image_url: string | null;
  payment_gateway: 'manual' | 'mercadopago' | 'asaas';
  mercado_pago_api_key: string;
  asaas_api_key: string;
}

export interface TransactionCategory {
  id?: number;
  name: string;
  type: 'income' | 'expense';
  emoji: string;
}

export interface FinancialTransaction {
  id?: number;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  type: 'income' | 'expense';
  category_id: number;
}

export interface AITransactionResult {
    success: boolean;
    message: string;
    transaction?: FinancialTransaction;
}


export type View = 'dashboard' | 'schedule' | 'announcements' | 'store' | 'booking' | 'promotions' | 'settings' | 'userManagement' | 'financial' | 'userDetail';
