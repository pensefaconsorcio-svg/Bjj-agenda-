

import { type User, type ClassSession, type Announcement, type Product, type Booking, type TatameArea, type PromotionPlan, type SiteSettings, type TransactionCategory, type FinancialTransaction } from './types';

// Fix: Corrected the type of initialUsers to include the 'id' property from the User type, as the seed data contains it.
export const initialUsers: (User & { pass: string })[] = [
  { id: 1, email: 'admin@bjj.com', name: 'Admin Geral', role: 'admin', paymentDueDate: null, belt: 'preta', pass: 'admin123' },
  { id: 2, email: 'mestre@bjj.com', name: 'Mestre Helio', role: 'mestre', paymentDueDate: null, belt: 'preta', pass: 'mestre123' },
  { id: 3, email: 'user@bjj.com', name: 'Carlos Gracie', role: 'user', paymentDueDate: '2024-08-15', belt: 'roxa', pass: 'user123' },
  { id: 4, email: 'vencido@bjj.com', name: 'John Vencido', role: 'user', paymentDueDate: '2024-06-01', belt: 'azul', pass: 'user123' },
];

export const initialSiteSettings: SiteSettings = {
  id: 1,
  academyName: 'Academia Gracie',
  instagramUrl: 'https://instagram.com',
  facebookUrl: 'https://facebook.com',
  xUrl: 'https://x.com',
  whatsappUrl: 'https://whatsapp.com',
  pixKey: 'seuemail@dominio.com',
  paymentInstructions: 'Após o pagamento, por favor envie o comprovante para o nosso WhatsApp para confirmarmos sua matrícula.',
  logoUrl: null,
  loginImageUrl: null,
  paymentGateway: 'manual',
  mercadoPagoApiKey: '',
  asaasApiKey: '',
};

export const initialClasses: Omit<ClassSession, 'id'>[] = [
  { day: 'Segunda', time: '18:00 - 19:30', name: 'Gi Fundamentos', instructor: 'Mestre Helio', level: 'Iniciante' },
  { day: 'Segunda', time: '20:00 - 21:30', name: 'No-Gi Avançado', instructor: 'Professor Carlos', level: 'Avançado' },
  { day: 'Terça', time: '07:00 - 08:30', name: 'Drills & Repetições', instructor: 'Professor Rorion', level: 'Todos' },
  { day: 'Quarta', time: '18:00 - 19:30', name: 'Gi Intermediário', instructor: 'Mestre Helio', level: 'Intermediário' },
  { day: 'Quinta', time: '20:00 - 21:30', name: 'Sparring (Livre)', instructor: 'Supervisionado', level: 'Todos' },
  { day: 'Sexta', time: '19:00 - 20:30', name: 'Técnicas de Defesa', instructor: 'Mestre Helio', level: 'Todos' },
];

export const initialAnnouncements: Omit<Announcement, 'id'>[] = [
  { title: 'Graduação de Faixa', date: '20/07/2024', content: 'Nossa cerimônia de graduação será no próximo sábado! Preparem-se para celebrar o progresso de todos.' },
  { title: 'Feriado Nacional', date: '15/07/2024', content: 'A academia estará fechada na próxima segunda-feira devido ao feriado. As aulas retornam na terça.' },
];

export const initialProducts: Omit<Product, 'id'>[] = [
  { name: 'Kimono Gracie Branco', price: 450.00, imageUrl: 'https://via.placeholder.com/300x300.png/FFFFFF/000000?text=Kimono+Branco', category: 'Vestuário' },
  { name: 'Faixa Roxa Oficial', price: 80.00, imageUrl: 'https://via.placeholder.com/300x300.png/8B5CF6/FFFFFF?text=Faixa+Roxa', category: 'Acessórios' },
  { name: 'Rashguard Preta', price: 150.00, imageUrl: 'https://via.placeholder.com/300x300.png/1F2937/FFFFFF?text=Rashguard', category: 'Vestuário' },
];

export const initialPromotions: Omit<PromotionPlan, 'id'>[] = [
  { name: 'Plano Mensal', price: 200, duration: 'mês', total: null, features: ['Acesso a todas as aulas', 'Uso livre do tatame'], isBestValue: false },
  { name: 'Plano Trimestral', price: 180, duration: 'mês', total: 540, features: ['Acesso a todas as aulas', 'Uso livre do tatame', '10% de desconto na loja'], isBestValue: true },
  { name: 'Plano Anual', price: 160, duration: 'mês', total: 1920, features: ['Acesso a todas as aulas', 'Uso livre do tatame', '15% de desconto na loja', 'Kimono grátis'], isBestValue: false },
];

export const initialTatameAreas: TatameArea[] = [
  { id: 'tatame-principal', name: 'Tatame Principal', timeSlots: ['09:00 - 10:00', '10:00 - 11:00', '14:00 - 15:00'] },
  { id: 'tatame-secundario', name: 'Área de Drills', timeSlots: ['09:00 - 10:00', '10:00 - 11:00'] },
];

export const initialFinancialCategories: Omit<TransactionCategory, 'id'>[] = [
  { name: 'Mensalidade', type: 'income', emoji: '💳' },
  { name: 'Venda de Produtos', type: 'income', emoji: '🥋' },
  { name: 'Aluguel', type: 'expense', emoji: '🏢' },
  { name: 'Marketing', type: 'expense', emoji: '📢' },
];

export const initialFinancialTransactions: Omit<FinancialTransaction, 'id'>[] = [
  { description: 'Mensalidade Carlos Gracie', amount: 200, date: '2024-07-15', type: 'income', categoryId: 1 },
  { description: 'Venda de Kimono', amount: 450, date: '2024-07-16', type: 'income', categoryId: 2 },
  { description: 'Pagamento Aluguel', amount: 1500, date: '2024-07-05', type: 'expense', categoryId: 3 },
  { description: 'Impulsionamento Instagram', amount: 100, date: '2024-07-10', type: 'expense', categoryId: 4 },
];

export const initialBookings: Booking[] = [
  { id: 'tatame-principal-2024-07-25-10:00 - 11:00', tatameId: 'tatame-principal', tatameName: 'Tatame Principal', userId: 3, userEmail: 'user@bjj.com', date: '2024-07-25', timeSlot: '10:00 - 11:00', status: 'confirmed' },
];