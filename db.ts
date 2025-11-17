// Fix: Switched to a default import for Dexie to resolve class extension issues.
import { Dexie, type Table } from 'dexie';
import { type User, type ClassSession, type Announcement, type Product, type CartItem, type Booking, type TatameArea, type PromotionPlan, type SiteSettings, type TransactionCategory, type FinancialTransaction, type Belt } from './types';

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
  paymentGateway: 'manual',
  mercadoPagoApiKey: '',
  asaasApiKey: '',
  pixKey: 'chave-pix-aleatoria-exemplo@banco.com',
  paymentInstructions: 'Após o pagamento, por favor envie o comprovante para o nosso WhatsApp: (XX) 9XXXX-XXXX para confirmarmos seu pedido.',
  logoUrl: null,
  loginImageUrl: null,
};

const initialUsers: User[] = [
    { id: 1, email: 'admin@bjj.com', name: 'Administrador', role: 'admin', paymentDueDate: null, belt: 'branca' },
    { id: 2, email: 'user@bjj.com', name: 'Aluno Exemplo', role: 'user', paymentDueDate: '2024-08-15', belt: 'azul' },
    { id: 3, email: 'mestre@bjj.com', name: 'Mestre Academia', role: 'mestre', paymentDueDate: null, belt: 'preta' },
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

// --- DATABASE SERVICE (DEXIE) ---

interface Credential {
  email: string;
  pass: string;
}

interface AppState {
  key: string;
  value: any;
}

class BJJAgendaDB extends Dexie {
  // Fix: Replaced `Dexie.Table` with the imported `Table` type to correctly type the table properties.
  users!: Table<User, number>;
  credentials!: Table<Credential, string>;
  classes!: Table<ClassSession, number>;
  products!: Table<Product, number>;
  announcements!: Table<Announcement, number>;
  bookings!: Table<Booking, string>;
  promotions!: Table<PromotionPlan, number>;
  siteSettings!: Table<SiteSettings & { id: number }, number>;
  tatameAreas!: Table<TatameArea, string>;
  cart!: Table<CartItem, number>;
  financialTransactions!: Table<FinancialTransaction, number>;
  financialCategories!: Table<TransactionCategory, number>;
  appState!: Table<AppState, string>;

  constructor() {
    super('BJJAgendaDB');
    this.version(1).stores({
      users: '++id, &email',
      credentials: 'email',
      classes: '++id',
      products: '++id',
      announcements: '++id',
      bookings: 'id',
      promotions: '++id',
      siteSettings: 'id',
      tatameAreas: 'id',
      cart: '++id',
      financialTransactions: '++id',
      financialCategories: '++id',
      appState: 'key',
    });
  }
}

const dexieDB = new BJJAgendaDB();

dexieDB.on('populate', async () => {
  await dexieDB.users.bulkAdd(initialUsers);
  const creds = Object.entries(initialCredentials).map(([email, pass]) => ({ email, pass }));
  await dexieDB.credentials.bulkAdd(creds);
  await dexieDB.classes.bulkAdd(initialClasses);
  await dexieDB.products.bulkAdd(initialProducts);
  await dexieDB.announcements.bulkAdd(mockAnnouncements);
  await dexieDB.promotions.bulkAdd(initialPromotions);
  await dexieDB.tatameAreas.bulkAdd(initialTatameAreas);
  await dexieDB.siteSettings.add({ ...initialSiteSettings, id: 1 });
  await dexieDB.financialTransactions.bulkAdd(initialFinancialTransactions);
  await dexieDB.financialCategories.bulkAdd(initialFinancialCategories);
  await dexieDB.appState.add({ key: 'sidebarCollapsed', value: false });
});

const initDB = async () => {
  try {
    if (!dexieDB.isOpen()) {
        await dexieDB.open();
    }
  } catch (error) {
    console.error("Failed to open db:", error);
  }
};

export const db = {
  init: initDB,
  users: {
    getAll: () => dexieDB.users.toArray(),
    add: (user: User) => dexieDB.users.add(user),
    update: (user: User) => dexieDB.users.put(user),
    delete: (id: number) => dexieDB.users.delete(id),
  },
  credentials: {
    getAll: () => dexieDB.credentials.toArray(),
    add: (cred: Credential) => dexieDB.credentials.add(cred),
    update: (cred: Credential) => dexieDB.credentials.put(cred),
    delete: (email: string) => dexieDB.credentials.delete(email),
  },
  classes: {
    getAll: () => dexieDB.classes.toArray(),
    add: (data: ClassSession) => dexieDB.classes.add(data),
    update: (data: ClassSession) => dexieDB.classes.put(data),
    delete: (id: number) => dexieDB.classes.delete(id),
  },
  products: {
    getAll: () => dexieDB.products.toArray(),
    add: (data: Product) => dexieDB.products.add(data),
    update: (data: Product) => dexieDB.products.put(data),
    delete: (id: number) => dexieDB.products.delete(id),
  },
  announcements: {
    getAll: () => dexieDB.announcements.toArray(),
    add: (data: Announcement) => dexieDB.announcements.add(data),
    delete: (id: number) => dexieDB.announcements.delete(id),
  },
  bookings: {
    getAll: () => dexieDB.bookings.toArray(),
    add: (data: Booking) => dexieDB.bookings.add(data),
    delete: (id: string) => dexieDB.bookings.delete(id),
    update: (data: Booking) => dexieDB.bookings.put(data),
  },
  promotions: {
    getAll: () => dexieDB.promotions.toArray(),
    add: (data: PromotionPlan) => dexieDB.promotions.add(data),
    update: (data: PromotionPlan) => dexieDB.promotions.put(data),
    delete: (id: number) => dexieDB.promotions.delete(id),
  },
  siteSettings: {
    get: async (): Promise<SiteSettings> => (await dexieDB.siteSettings.get(1)) || initialSiteSettings,
    save: (data: SiteSettings) => dexieDB.siteSettings.put({ ...data, id: 1 }),
  },
  tatameAreas: {
    getAll: () => dexieDB.tatameAreas.toArray(),
    saveAll: (data: TatameArea[]) => dexieDB.tatameAreas.bulkPut(data),
  },
  cart: {
    getAll: () => dexieDB.cart.toArray(),
    saveAll: (data: CartItem[]) => dexieDB.transaction('rw', dexieDB.cart, async () => {
        await dexieDB.cart.clear();
        await dexieDB.cart.bulkAdd(data);
    }),
  },
  sidebar: {
    isCollapsed: async (): Promise<boolean> => {
        const state = await dexieDB.appState.get('sidebarCollapsed');
        return state ? state.value : false;
    },
    saveCollapsed: (isCollapsed: boolean) => dexieDB.appState.put({ key: 'sidebarCollapsed', value: isCollapsed }),
  },
  financialTransactions: {
    getAll: () => dexieDB.financialTransactions.toArray(),
    add: (data: FinancialTransaction) => dexieDB.financialTransactions.add(data),
    delete: (id: number) => dexieDB.financialTransactions.delete(id),
  },
  financialCategories: {
    getAll: () => dexieDB.financialCategories.toArray(),
    add: (data: TransactionCategory) => dexieDB.financialCategories.add(data),
    update: (data: TransactionCategory) => dexieDB.financialCategories.put(data),
    delete: (id: number) => dexieDB.financialCategories.delete(id),
  },
};