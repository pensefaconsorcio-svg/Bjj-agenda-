import { create } from 'zustand';
import toast from 'react-hot-toast';
import { GoogleGenAI, Type } from "@google/genai";
import { db } from './db';
import { initialAnnouncements, initialCategories, initialClasses, initialPlans, initialProducts, initialSiteSettings, initialTatameAreas, initialUsers } from './seed';
import { type View, type Product, type User, type ClassSession, type Booking, type Announcement, type PromotionPlan, type SiteSettings, type TatameArea, type CartItem, type FinancialTransaction, type TransactionCategory, type AITransactionResult } from './types';

// This provides a default, non-null state to prevent render errors on first load.
const defaultSiteSettings: SiteSettings = {
  id: 1,
  academyName: "Carregando...",
  instagramUrl: "",
  facebookUrl: "",
  xUrl: "",
  whatsappUrl: "",
  pixKey: "",
  paymentInstructions: "",
  logoUrl: null,
  loginImageUrl: null,
  paymentGateway: 'manual',
  mercadoPagoApiKey: '',
  asaasApiKey: '',
};

interface AppState {
  // --- STATE ---
  currentUser: User | null;
  currentView: View;
  users: User[];
  classes: ClassSession[];
  products: Product[];
  announcements: Announcement[];
  bookings: Booking[];
  promotions: PromotionPlan[];
  siteSettings: SiteSettings;
  tatameAreas: TatameArea[];
  cart: CartItem[];
  isSidebarCollapsed: boolean;
  financialTransactions: FinancialTransaction[];
  financialCategories: TransactionCategory[];
  selectedUserId: number | null;
  
  // UI State
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isMobileMenuOpen: boolean;

  // --- ACTIONS ---
  
  // App Initialization
  initializeApp: () => Promise<void>;

  // View & Session
  setCurrentView: (view: View) => void;
  setSelectedUserId: (userId: number | null) => void;
  login: (userCredentials: { email: string; pass: string }) => Promise<string | null>;
  logout: () => void;
  resetPassword: (email: string) => Promise<void>;
  
  // UI Actions
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleSidebarCollapse: () => void;

  // User Management
  createUser: (newUserData: Omit<User, 'id' | 'created_at'>, pass: string) => Promise<{ success: boolean, message?: string }>;
  updateUser: (updatedUserData: User) => Promise<void>;
  deleteUser: (userId: number) => Promise<void>;

  // Class Management
  addClass: (newClass: Omit<ClassSession, 'id'>) => Promise<void>;
  updateClass: (updatedClass: ClassSession) => Promise<void>;
  deleteClass: (classId: number) => Promise<void>;

  // Product Management
  addProduct: (newProduct: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;

  // Cart Management
  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: number, newQuantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  
  // Announcement Management
  addAnnouncement: (newAnnouncementData: { title: string; content: string }) => Promise<void>;
  deleteAnnouncement: (announcementId: number) => Promise<void>;
  
  // Booking Management
  bookTatame: (bookingDetails: Omit<Booking, 'id' | 'userId' | 'userEmail' | 'status' | 'bookingKey'>) => Promise<void>;
  cancelBooking: (bookingId: number) => Promise<void>;
  updateBookingStatus: (bookingId: number, action: 'confirm' | 'deny') => Promise<void>;
  updateTatameAreas: (updatedAreas: TatameArea[]) => Promise<void>;
  addTatameArea: (areaData: Omit<TatameArea, 'id'>) => Promise<void>;

  // Promotions Management
  addPromotion: (newPlan: Omit<PromotionPlan, 'id'>) => Promise<void>;
  updatePromotion: (updatedPlan: PromotionPlan) => Promise<void>;
  deletePromotion: (planId: number) => Promise<void>;
  
  // Settings Management
  updateSiteSettings: (newSettings: SiteSettings) => Promise<void>;

  // Financial Management
  addTransaction: (newTransaction: Omit<FinancialTransaction, 'id'>) => Promise<void>;
  deleteTransaction: (transactionId: number) => Promise<void>;
  addCategory: (newCategory: Omit<TransactionCategory, 'id'>) => Promise<void>;
  updateCategory: (updatedCategory: TransactionCategory) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
  processAiCommand: (command: string) => Promise<AITransactionResult>;
  
  // Integrated Payments
  processPlanPayment: (planId: number) => Promise<void>;
  processCartCheckout: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
    (set, get) => ({
      // --- INITIAL STATE ---
      currentUser: null,
      currentView: 'dashboard',
      users: [],
      classes: [],
      products: [],
      announcements: [],
      bookings: [],
      promotions: [],
      siteSettings: defaultSiteSettings,
      tatameAreas: [],
      cart: [],
      isSidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true',
      financialTransactions: [],
      financialCategories: [],
      selectedUserId: null,
      isCartOpen: false,
      isCheckoutOpen: false,
      isMobileMenuOpen: false,

      // --- ACTIONS IMPLEMENTATION ---
      
      initializeApp: async () => {
        // This function now handles seeding robustly.
        try {
          const settingsCount = await db.siteSettings.count();
          if (settingsCount === 0) {
            console.log("Database is empty, seeding initial data...");
            await db.transaction('rw', db.tables, async () => {
              await db.siteSettings.bulkPut([initialSiteSettings]);
              await db.users.bulkPut(initialUsers as any);
              await db.classes.bulkPut(initialClasses);
              await db.announcements.bulkPut(initialAnnouncements);
              await db.products.bulkPut(initialProducts);
              await db.tatameAreas.bulkPut(initialTatameAreas);
              await db.promotions.bulkPut(initialPlans);
              await db.financialCategories.bulkPut(initialCategories);
            });
            console.log("Seeding complete.");
          }

          const [
              users, 
              classes, 
              products, 
              announcements, 
              bookings, 
              promotions, 
              siteSettings, 
              tatameAreas, 
              financialTransactions, 
              financialCategories 
          ] = await Promise.all([
              db.users.toArray(),
              db.classes.toArray(),
              db.products.toArray(),
              db.announcements.orderBy('id').reverse().toArray(),
              db.bookings.toArray(),
              db.promotions.toArray(),
              db.siteSettings.get(1),
              db.tatameAreas.toArray(),
              db.financialTransactions.toArray(),
              db.financialCategories.toArray(),
          ]);

          set({ 
              users,
              classes, 
              products, 
              announcements,
              bookings, 
              promotions, 
              siteSettings: siteSettings || defaultSiteSettings, 
              tatameAreas, 
              financialTransactions,
              financialCategories,
              currentUser: null, // Always start logged out
          });
        } catch (error) {
            console.error("Failed to initialize app:", error);
            // Optionally set an error state here
        }
      },

      setCurrentView: (view) => set({ currentView: view, isMobileMenuOpen: false }),
      setSelectedUserId: (userId) => set({ selectedUserId: userId }),

      login: async ({ email, pass }) => {
          const testPasswords: { [key: string]: string } = {
            'admin@bjj.com': 'admin123',
            'mestre@bjj.com': 'mestre123',
            'user@bjj.com': 'user123',
            'joana@bjj.com': 'user123',
          };
          const user = await db.users.where('email').equals(email).first();
          if (!user) {
              return 'Usuário ou senha incorretos.';
          }
          if (testPasswords[email] === pass) {
              set({ currentUser: user });
              return null;
          }
          return 'Usuário ou senha incorretos.';
      },
      
      logout: () => {
        set({ currentUser: null, currentView: 'dashboard' });
      },
      
      resetPassword: async (email) => {
        const user = await db.users.where('email').equals(email).first();
        if (user) {
            toast.success('Em um app real, um e-mail de redefinição seria enviado.');
        } else {
            toast.success('Se uma conta com este e-mail existir, um link foi enviado.');
        }
      },
      
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      openCheckout: () => set({ isCartOpen: false, isCheckoutOpen: true }),
      closeCheckout: () => set({ isCheckoutOpen: false }),
      openMobileMenu: () => set({ isMobileMenuOpen: true }),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      toggleSidebarCollapse: () => {
        const newCollapsedState = !get().isSidebarCollapsed;
        localStorage.setItem('sidebarCollapsed', String(newCollapsedState));
        set({ isSidebarCollapsed: newCollapsedState });
      },

      createUser: async (newUserData, pass) => {
        const existingUser = await db.users.where('email').equals(newUserData.email).first();
        if (existingUser) {
            return { success: false, message: 'Usuário com este e-mail já existe.' };
        }
        const id = await db.users.add({
            ...newUserData,
            created_at: new Date().toISOString()
        } as any);
        // We don't store passwords, but we'll toast a success message.
        const newUser = await db.users.get(id);
        if (newUser) {
            set(state => ({ users: [...state.users, newUser] }));
        }
        return { success: true };
      },
      
      updateUser: async (updatedUserData) => {
        await db.users.update(updatedUserData.id, updatedUserData);
        set(state => ({
            users: state.users.map(u => u.id === updatedUserData.id ? updatedUserData : u),
            currentUser: state.currentUser?.id === updatedUserData.id ? updatedUserData : state.currentUser
        }));
      },
      
      deleteUser: async (userId: number) => {
        const userToDelete = await db.users.get(userId);
        if (userToDelete) {
            await db.users.delete(userId);
            set(state => ({ users: state.users.filter(u => u.id !== userId) }));
            toast.success(`Usuário excluído.`);
        }
      },
      
      addClass: async (newClass) => {
        const id = await db.classes.add(newClass as any);
        set(state => ({ classes: [...state.classes, { ...newClass, id }] }));
        toast.success('Aula adicionada!');
      },
      updateClass: async (updatedClass) => {
        await db.classes.update(updatedClass.id!, updatedClass);
        set(state => ({ classes: state.classes.map(c => c.id === updatedClass.id ? updatedClass : c) }));
        toast.success('Aula atualizada!');
      },
      deleteClass: async (classId) => {
        await db.classes.delete(classId);
        set(state => ({ classes: state.classes.filter(c => c.id !== classId) }));
        toast.success('Aula excluída!');
      },

      addProduct: async (newProduct) => {
         const id = await db.products.add(newProduct as any);
         set(state => ({ products: [...state.products, { ...newProduct, id }] }));
         toast.success('Produto adicionado!');
      },
      updateProduct: async (updatedProduct) => {
        await db.products.update(updatedProduct.id!, updatedProduct);
        set(state => ({ products: state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p) }));
        toast.success('Produto atualizado!');
      },
      deleteProduct: async (productId) => {
        await db.products.delete(productId);
        set(state => ({ products: state.products.filter(p => p.id !== productId) }));
        toast.success('Produto excluído!');
      },

      addToCart: (product: Product) => {
        set(state => {
            const existingItem = state.cart.find(item => item.id === product.id);
            if (existingItem) {
                toast.success(`${product.name} adicionado ao carrinho.`);
                return { cart: state.cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item) };
            }
            toast.success(`${product.name} adicionado ao carrinho.`);
            return { cart: [...state.cart, { ...product, quantity: 1 }] };
        });
      },
      updateCartQuantity: (productId: number, newQuantity: number) => {
          if (newQuantity <= 0) {
              get().removeFromCart(productId);
          } else {
              set(state => ({
                  cart: state.cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item)
              }));
          }
      },
      removeFromCart: (productId: number) => {
          set(state => ({
              cart: state.cart.filter(item => item.id !== productId)
          }));
          toast.success("Item removido do carrinho.");
      },
      clearCart: () => {
          set({ cart: [] });
          toast.success("Carrinho esvaziado.");
      },

      addAnnouncement: async (newAnnouncementData) => {
        const newAnnouncement = { ...newAnnouncementData, date: new Date().toLocaleDateString('pt-BR') };
        const id = await db.announcements.add(newAnnouncement as any);
        set(state => ({ announcements: [{ ...newAnnouncement, id }, ...state.announcements] }));
        toast.success('Aviso publicado!');
      },
      deleteAnnouncement: async (announcementId: number) => {
        await db.announcements.delete(announcementId);
        set(state => ({ announcements: state.announcements.filter(a => a.id !== announcementId) }));
        toast.success('Aviso excluído!');
      },
      
      bookTatame: async (bookingDetails) => {
        const currentUser = get().currentUser;
        if (!currentUser) {
            toast.error("Você precisa estar logado para reservar.");
            return;
        }
        const bookingKey = `${bookingDetails.tatameId}-${bookingDetails.date}-${bookingDetails.timeSlot}`;
        const newBooking: Omit<Booking, 'id'> = {
            ...bookingDetails,
            bookingKey,
            userId: currentUser.id,
            userEmail: currentUser.email,
            status: 'pending',
        };
        const id = await db.bookings.add(newBooking as any);
        set(state => ({ bookings: [...state.bookings, { ...newBooking, id }] }));
        toast.success("Solicitação de reserva enviada!");
      },
      cancelBooking: async (bookingId: number) => {
        await db.bookings.delete(bookingId);
        set(state => ({ bookings: state.bookings.filter(b => b.id !== bookingId) }));
        toast.success("Reserva cancelada.");
      },
      updateBookingStatus: async (bookingId, action) => {
          if (action === 'deny') {
              await db.bookings.delete(bookingId);
              set(state => ({ bookings: state.bookings.filter(b => b.id !== bookingId) }));
              toast.success("Solicitação de reserva negada.");
          } else {
              await db.bookings.update(bookingId, { status: 'confirmed' });
              set(state => ({
                  bookings: state.bookings.map(b => b.id === bookingId ? { ...b, status: 'confirmed' } : b)
              }));
              toast.success("Reserva confirmada!");
          }
      },
      addTatameArea: async (areaData) => {
        const newArea: TatameArea = {
            id: `tatame-${Date.now()}`,
            ...areaData,
        };
        await db.tatameAreas.add(newArea);
        set(state => ({ tatameAreas: [...state.tatameAreas, newArea] }));
        toast.success("Área de tatame adicionada!");
      },
      updateTatameAreas: async (updatedAreas) => {
        await db.tatameAreas.bulkPut(updatedAreas);
        set({ tatameAreas: updatedAreas });
        toast.success("Área de tatame atualizada!");
      },
      addPromotion: async (newPlan) => {
        const id = await db.promotions.add(newPlan as any);
        set(state => ({ promotions: [...state.promotions, { ...newPlan, id }] }));
        toast.success('Plano adicionado!');
      },
      updatePromotion: async (updatedPlan) => {
        await db.promotions.update(updatedPlan.id!, updatedPlan);
        set(state => ({ promotions: state.promotions.map(p => p.id === updatedPlan.id ? updatedPlan : p) }));
        toast.success('Plano atualizado!');
      },
      deletePromotion: async (planId) => {
        await db.promotions.delete(planId);
        set(state => ({ promotions: state.promotions.filter(p => p.id !== planId) }));
        toast.success('Plano excluído!');
      },
      updateSiteSettings: async (newSettings) => {
        await db.siteSettings.put(newSettings, 1);
        set({ siteSettings: newSettings });
        toast.success('Configurações salvas com sucesso!');
      },
       addTransaction: async (newTransaction) => {
        const id = await db.financialTransactions.add(newTransaction as any);
        set(state => ({ financialTransactions: [{ ...newTransaction, id }, ...state.financialTransactions] }));
        toast.success('Transação adicionada!');
      },
      deleteTransaction: async (transactionId) => {
        await db.financialTransactions.delete(transactionId);
        set(state => ({ financialTransactions: state.financialTransactions.filter(t => t.id !== transactionId) }));
        toast.success('Transação excluída!');
      },
      addCategory: async (newCategory) => {
        const id = await db.financialCategories.add(newCategory as any);
        set(state => ({ financialCategories: [...state.financialCategories, { ...newCategory, id }] }));
        toast.success('Categoria adicionada!');
      },
      updateCategory: async (updatedCategory) => {
        await db.financialCategories.update(updatedCategory.id!, updatedCategory);
        set(state => ({ financialCategories: state.financialCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c) }));
      },
      deleteCategory: async (categoryId) => {
        await db.financialCategories.delete(categoryId);
        set(state => ({ financialCategories: state.financialCategories.filter(c => c.id !== categoryId) }));
        toast.success('Categoria excluída!');
      },
      processAiCommand: async (command) => {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
          return { success: false, message: "Chave de API não configurada." };
        }
        try {
          const ai = new GoogleGenAI({ apiKey });
          const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Analise a seguinte frase para uma transação financeira: "${command}". Extraia a descrição, o valor e o tipo (income ou expense).`,
            config: {
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  description: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  type: { type: Type.STRING, enum: ["income", "expense"] },
                },
              },
            },
          });
          const result = JSON.parse(response.text.trim());
          if (result.description && result.amount && result.type) {
            const categories = get().financialCategories;
            const newTransaction = {
                description: result.description,
                amount: result.amount,
                type: result.type,
                date: new Date().toISOString().split('T')[0],
                categoryId: categories.find(c => c.name.toLowerCase().includes('outros'))?.id || categories[0].id,
            };
            await get().addTransaction(newTransaction);
            return { success: true, message: `Transação "${result.description}" adicionada!`, transaction: newTransaction as FinancialTransaction };
          }
          return { success: false, message: "Não consegui entender o comando." };
        } catch (error) {
          console.error("AI command error:", error);
          return { success: false, message: "Erro ao processar com a IA." };
        }
      },
      processPlanPayment: async (planId) => {
        const plan = get().promotions.find(p => p.id === planId);
        const user = get().currentUser;
        if (!plan || !user) throw new Error("Plano ou usuário não encontrado.");

        const newTransaction: Omit<FinancialTransaction, 'id'> = {
            description: `Pagamento plano ${plan.name} - ${user.name}`,
            amount: plan.total || plan.price,
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            categoryId: get().financialCategories.find(c => c.name === 'Mensalidade')?.id || 1,
        };
        await get().addTransaction(newTransaction);

        const newDueDate = new Date();
        newDueDate.setMonth(newDueDate.getMonth() + (plan.duration === 'mês' ? 1 : 3));
        const updatedUser = { ...user, paymentDueDate: newDueDate.toISOString().split('T')[0] };
        await get().updateUser(updatedUser);
      },
      processCartCheckout: async () => {
        const { cart, currentUser } = get();
        if (cart.length === 0 || !currentUser) throw new Error("Carrinho vazio ou usuário não logado.");

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        const description = `Compra na loja - ${currentUser.name}: ` + cart.map(item => `${item.quantity}x ${item.name}`).join(', ');

        const newTransaction: Omit<FinancialTransaction, 'id'> = {
            description,
            amount: total,
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            categoryId: get().financialCategories.find(c => c.name === 'Venda de Produtos')?.id || 2,
        };

        await get().addTransaction(newTransaction);
        set({ cart: [], isCheckoutOpen: false });
      },
    })
);