

import { type User, type ClassSession, type Announcement, type Product, type CartItem, type Booking, type TatameArea, type PromotionPlan, type SiteSettings, type TransactionCategory, type FinancialTransaction } from './types';

// --- INITIAL DATA ---

const initialClasses: ClassSession[] = [
  { id: 1, day: 'Segunda', time: '18:00 - 19:00', name: 'Gi Fundamentos', instructor: 'Professor Helio', level: 'Iniciante' },
  { id: 2, day: 'Segunda', time: '19:00 - 20:30', name: 'Gi Avançado', instructor: 'Professor Rickson', level: 'Avançado' },
  { id: 3, day: 'Terça', time: '07:00 - 08:00', name: 'No-Gi Todos os Níveis', instructor: 'Professor Royce', level: 'Todos' },
  { id: 4, day: 'Terça', time: '19:00 - 20:30', name: 'Drills & Sparring', instructor: 'Professor Carlos', level: 'Todos' },
  { id: 5, day: 'Quarta', time: '18:00 - 19:00', name: 'Gi Fundamentos', instructor: 'Professor Helio', level: 'Iniciante' },
  { id: 6, day: 'Quarta', time: '19:00 - 20:30', name: 'No-Gi Avançado', instructor: 'Professor Rickson', level: 'Avançado' },
  { id: 7, day: 'Quinta', time: '07:00 - 08:00', name: 'Gi Todos os Níveis', instructor: 'Professor Royce', level: 'Todos' },
  { id: 8, day: 'Quinta', time: '19:00 - 20:30', name: 'Drills & Sparring', instructor: 'Professor Carlos', level: 'Todos' },
  { id: 9, day: 'Sexta', time: '18:00 - 19:30', name: 'Open Mat', instructor: 'Geral', level: 'Todos' },
  { id: 10, day: 'Sábado', time: '10:00 - 11:30', name: 'Gi Competição', instructor: 'Professor Rickson', level: 'Avançado' },
];

const initialProducts: Product[] = [
  { id: 1, name: 'Gi Azul Royal', price: 450.00, imageUrl: 'https://picsum.photos/seed/bjj-gi-blue/400/400', category: 'Gis' },
  { id: 2, name: 'Gi Preto Competição', price: 550.00, imageUrl: 'https://picsum.photos/seed/bjj-gi-black/400/400', category: 'Gis' },
  { id: 8, name: 'Gi Branco Clássico', price: 420.00, imageUrl: 'https://picsum.photos/seed/bjj-gi-white/400/400', category: 'Gis' },
  { id: 3, name: 'Rashguard "Arte Suave"', price: 180.00, imageUrl: 'https://picsum.photos/seed/bjj-rashguard-art/400/400', category: 'Rashguards' },
  { id: 4, name: 'Rashguard Logo Academia', price: 150.00, imageUrl: 'https://picsum.photos/seed/bjj-rashguard-logo/400/400', category: 'Rashguards' },
  { id: 7, name: 'Bermuda No-Gi Preta', price: 120.00, imageUrl: 'https://picsum.photos/seed/bjj-shorts-black/400/400', category: 'Vestuário' },
  { id: 9, name: 'Camiseta "Estilo BJJ"', price: 90.00, imageUrl: 'https://picsum.photos/seed/bjj-tshirt-style/400/400', category: 'Vestuário' },
  { id: 5, name: 'Faixa Preta Padrão', price: 80.00, imageUrl: 'https://picsum.photos/seed/bjj-belt-black/400/400', category: 'Acessórios' },
  { id: 6, name: 'Mochila de Treino Grande', price: 250.00, imageUrl: 'https://picsum.photos/seed/bjj-gym-bag/400/400', category: 'Acessórios' },
];

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: 'Novo Horário de Open Mat aos Domingos',
    date: '15 de Julho, 204',
    content: 'A partir deste mês, teremos um novo horário de Open Mat todos os domingos, das 10h às 12h. Aberto para todos os alunos e convidados de outras academias. Oss!',
  },
  {
    id: 2,
    title: 'Seminário com a Lenda do BJJ',
    date: '10 de Julho, 2024',
    content: 'No próximo dia 25 de Agosto, teremos a honra de receber uma lenda do esporte para um seminário exclusivo. As vagas são limitadas! Garanta a sua na recepção.',
  },
];

const initialPromotions: PromotionPlan[] = [
  { id: 1, name: 'Plano Mensal', price: 150, duration: 'mês', total: null, features: ['Acesso ilimitado às aulas', 'Todas as modalidades inclusas', 'Sem taxa de matrícula'], isBestValue: false },
  { id: 2, name: 'Plano Trimestral', price: 135, duration: 'mês', total: 405, features: ['Acesso ilimitado às aulas', 'Todas as modalidades inclusas', 'Sem taxa de matrícula', 'Desconto de 10%'], isBestValue: false },
  { id: 3, name: 'Plano Semestral', price: 120, duration: 'mês', total: 720, features: ['Acesso ilimitado às aulas', 'Todas as modalidades inclusas', 'Sem taxa de matrícula', 'Desconto de 20%'], isBestValue: true },
];

const initialTatameAreas: TatameArea[] = [
  { id: 'tatame-principal', name: 'Tatame Principal', timeSlots: ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '13:00 - 14:00', '14:00 - 15:00'] },
  { id: 'area-sparring', name: 'Área de Sparring', timeSlots: ['08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00', '13:00 - 14:00', '14:00 - 15:00'] },
];

const initialSiteSettings: SiteSettings = {
  academyName: 'BJJAgenda',
  instagramUrl: '#',
  facebookUrl: '#',
  xUrl: '#',
  whatsappUrl: '#',
  pixKey: 'chave-pix-aleatoria-exemplo@banco.com',
  paymentInstructions: 'Após o pagamento, por favor envie o comprovante para o nosso WhatsApp: (XX) 9XXXX-XXXX para confirmarmos seu pedido.',
  logoUrl: null,
  loginImageUrl: null,
};

const initialUsers: User[] = [
    { id: 1, email: 'admin@bjj.com', name: 'Administrador', role: 'admin', paymentDueDate: null },
    { id: 2, email: 'user@bjj.com', name: 'Aluno Exemplo', role: 'user', paymentDueDate: '2024-08-15' },
    { id: 3, email: 'mestre@bjj.com', name: 'Mestre Academia', role: 'mestre', paymentDueDate: null },
];

const initialCredentials: { [email: string]: string } = {
    'admin@bjj.com': 'admin123',
    'user@bjj.com': 'user123',
    'mestre@bjj.com': 'mestre123',
};

const initialFinancialCategories: TransactionCategory[] = [
  { id: 1, name: 'Mensalidades', type: 'income', emoji: '💪' },
  { id: 2, name: 'Venda de Produtos', type: 'income', emoji: '🥋' },
  { id: 3, name: 'Aluguel', type: 'expense', emoji: '🏠' },
  { id: 4, name: 'Salários', type: 'expense', emoji: '💰' },
  { id: 5, name: 'Equipamentos', type: 'expense', emoji: '🏋️' },
];

const initialFinancialTransactions: FinancialTransaction[] = [
    { id: 1, description: 'Mensalidade Aluno Exemplo', amount: 150, date: new Date().toISOString().split('T')[0], type: 'income', categoryId: 1 },
    { id: 2, description: 'Venda de Gi Azul', amount: 450, date: '2024-07-20', type: 'income', categoryId: 2 },
    { id: 3, description: 'Aluguel do Espaço', amount: 2000, date: '2024-07-05', type: 'expense', categoryId: 3 },
];

// --- DATABASE SERVICE ---

const KEYS = {
  USERS: 'bjjagenda-users',
  CREDENTIALS: 'bjjagenda-credentials',
  CLASSES: 'bjjagenda-classes',
  PRODUCTS: 'bjjagenda-products',
  ANNOUNCEMENTS: 'bjjagenda-announcements',
  BOOKINGS: 'bjjagenda-bookings',
  PROMOTIONS: 'bjjagenda-promotions',
  SITE_SETTINGS: 'bjjagenda-siteSettings',
  TATAME_AREAS: 'bjjagenda-tatameAreas',
  CART: 'bjjagenda-cart',
  SIDEBAR_COLLAPSED: 'bjjagenda-sidebarCollapsed',
  FINANCIAL_TRANSACTIONS: 'bjjagenda-financialTransactions',
  FINANCIAL_CATEGORIES: 'bjjagenda-financialCategories',
};

const get = <T extends object | boolean | string | number>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            let parsed = JSON.parse(storedValue);
            
            if (typeof parsed !== 'object' || parsed === null) {
                if (typeof parsed === typeof defaultValue) {
                    return parsed;
                }
                return defaultValue;
            }

            if (key === KEYS.SITE_SETTINGS) {
              if (parsed.paymentLink) {
                delete parsed.paymentLink;
              }
              if (parsed.logoUrl && typeof parsed.logoUrl === 'string' && !parsed.logoUrl.startsWith('data:')) {
                  parsed.logoUrl = null;
              }
              if (parsed.loginImageUrl && typeof parsed.loginImageUrl === 'string' && !parsed.loginImageUrl.startsWith('data:')) {
                  parsed.loginImageUrl = null;
              }
            }

            if (Array.isArray(defaultValue)) {
                return Array.isArray(parsed) ? (parsed as T) : defaultValue;
            }
            
            if (typeof defaultValue === 'object' && defaultValue !== null) {
                 return { ...defaultValue, ...parsed };
            }

            return defaultValue;
        }
        return defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage for key ${key}:`, error);
        return defaultValue;
    }
};

const save = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving to localStorage for key ${key}:`, error);
  }
};

export const db = {
  users: {
    getAll: (): User[] => get(KEYS.USERS, initialUsers),
    saveAll: (data: User[]) => save(KEYS.USERS, data),
  },
  credentials: {
    getAll: (): { [email: string]: string } => get(KEYS.CREDENTIALS, initialCredentials),
    saveAll: (data: { [email: string]: string }) => save(KEYS.CREDENTIALS, data),
  },
  classes: {
    getAll: (): ClassSession[] => get(KEYS.CLASSES, initialClasses),
    saveAll: (data: ClassSession[]) => save(KEYS.CLASSES, data),
  },
  products: {
    getAll: (): Product[] => get(KEYS.PRODUCTS, initialProducts),
    saveAll: (data: Product[]) => save(KEYS.PRODUCTS, data),
  },
  announcements: {
    getAll: (): Announcement[] => get(KEYS.ANNOUNCEMENTS, mockAnnouncements),
    saveAll: (data: Announcement[]) => save(KEYS.ANNOUNCEMENTS, data),
  },
  bookings: {
    getAll: (): Booking[] => get(KEYS.BOOKINGS, []),
    saveAll: (data: Booking[]) => save(KEYS.BOOKINGS, data),
  },
  promotions: {
    getAll: (): PromotionPlan[] => get(KEYS.PROMOTIONS, initialPromotions),
    saveAll: (data: PromotionPlan[]) => save(KEYS.PROMOTIONS, data),
  },
  siteSettings: {
    getAll: (): SiteSettings => get(KEYS.SITE_SETTINGS, initialSiteSettings),
    saveAll: (data: SiteSettings) => save(KEYS.SITE_SETTINGS, data),
  },
  tatameAreas: {
    getAll: (): TatameArea[] => get(KEYS.TATAME_AREAS, initialTatameAreas),
    saveAll: (data: TatameArea[]) => save(KEYS.TATAME_AREAS, data),
  },
  cart: {
    getAll: (): CartItem[] => get(KEYS.CART, []),
    saveAll: (data: CartItem[]) => save(KEYS.CART, data),
  },
  sidebar: {
    isCollapsed: (): boolean => get(KEYS.SIDEBAR_COLLAPSED, false),
    saveCollapsed: (data: boolean) => save(KEYS.SIDEBAR_COLLAPSED, data),
  },
  financialTransactions: {
    getAll: (): FinancialTransaction[] => get(KEYS.FINANCIAL_TRANSACTIONS, initialFinancialTransactions),
    saveAll: (data: FinancialTransaction[]) => save(KEYS.FINANCIAL_TRANSACTIONS, data),
  },
  financialCategories: {
    getAll: (): TransactionCategory[] => get(KEYS.FINANCIAL_CATEGORIES, initialFinancialCategories),
    saveAll: (data: TransactionCategory[]) => save(KEYS.FINANCIAL_CATEGORIES, data),
  },
};