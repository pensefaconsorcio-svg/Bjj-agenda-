

import create from 'zustand';
import toast from 'react-hot-toast';
import { GoogleGenAI, Type } from "@google/genai";
import { type View, type Product, type User, type ClassSession, type Booking, type Announcement, type PromotionPlan, type SiteSettings, type TatameArea, type CartItem, type FinancialTransaction, type TransactionCategory, type Belt, type AITransactionResult } from './types';
import { db } from './db';
import { initialUsers, initialSiteSettings, initialClasses, initialAnnouncements, initialProducts, initialPromotions, initialTatameAreas, initialFinancialCategories, initialFinancialTransactions, initialBookings } from './seed';

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
  
  // UI State (non-persisted)
  isInitialized: boolean;
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isMobileMenuOpen: boolean;

  // --- ACTIONS ---
  
  // App Initialization
  initializeApp: () => Promise<void>;

  // View & Session
  setCurrentView: (view: View) => void;
  setSelectedUserId: (userId: number | null) => void;
  login: (userCredentials: { email: string; pass: string }) => boolean;
  logout: () => void;
  resetPassword: (email: string, newPass: string) => Promise<boolean>;
  
  // UI Actions
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleSidebarCollapse: () => void;

  // User Management
  createUser: (newUserData: { email: string; pass: string; role: 'admin' | 'user' | 'mestre'; name: string; paymentDueDate: string | null; belt: Belt; }) => Promise<{ success: boolean; message?: string }>;
  updateUser: (updatedUserData: User & { pass?: string }) => Promise<void>;
  deleteUser: (userId: number) => Promise<boolean>;

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
  bookTatame: (bookingDetails: Omit<Booking, 'id' | 'userId' | 'userEmail' | 'status'>) => Promise<boolean>;
  cancelBooking: (bookingId: string) => Promise<void>;
  updateBookingStatus: (bookingId: string, action: 'confirm' | 'deny') => Promise<void>;
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
  deleteCategory: (categoryId: number) => Promise<boolean>;
  processAiCommand: (command: string) => Promise<AITransactionResult>;
  
  // Integrated Payments
  processPlanPayment: (planId: number) => Promise<void>;
  processCartCheckout: () => Promise<void>;
}

const seedData = async () => {
    const userCount = await db.users.count();
    if (userCount === 0) {
        console.log("Database is empty, seeding initial data...");
        await db.transaction('rw', db.tables, async () => {
            await db.users.bulkAdd(initialUsers as any);
            await db.siteSettings.put(initialSiteSettings);
            await db.classes.bulkAdd(initialClasses as any);
            await db.announcements.bulkAdd(initialAnnouncements as any);
            await db.products.bulkAdd(initialProducts as any);
            await db.promotions.bulkAdd(initialPromotions as any);
            await db.tatameAreas.bulkAdd(initialTatameAreas as any);
            await db.financialCategories.bulkAdd(initialFinancialCategories as any);
            await db.financialTransactions.bulkAdd(initialFinancialTransactions as any);
            await db.bookings.bulkAdd(initialBookings as any);
        });
        console.log("Seeding complete.");
    }
};

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
      siteSettings: {} as SiteSettings,
      tatameAreas: [],
      cart: [],
      isSidebarCollapsed: false,
      financialTransactions: [],
      financialCategories: [],
      selectedUserId: null,
      isInitialized: false,
      isCartOpen: false,
      isCheckoutOpen: false,
      isMobileMenuOpen: false,

      // --- ACTIONS IMPLEMENTATION ---
      
      initializeApp: async () => {
        if (get().isInitialized) return;
        try {
          await db.open();
          await seedData();
          
          const [
              users, classes, products, announcements, bookings,
              promotions, siteSettings, tatameAreas,
              financialTransactions, financialCategories
          ] = await Promise.all([
              db.users.toArray(), db.classes.toArray(), db.products.toArray(),
              db.announcements.toArray(), db.bookings.toArray(), db.promotions.toArray(),
              db.siteSettings.get(1), db.tatameAreas.toArray(),
              db.financialTransactions.toArray(), db.financialCategories.toArray()
          ]);
          
          set({
              users, classes, products: products.sort((a,b) => a.id - b.id), 
              announcements: announcements.sort((a,b) => b.id - a.id),
              bookings, promotions, siteSettings: siteSettings!, tatameAreas,
              financialTransactions, financialCategories, isInitialized: true,
              isSidebarCollapsed: localStorage.getItem('sidebarCollapsed') === 'true'
          });
        } catch (error) {
            console.error("Failed to initialize app:", error);
            toast.error("Não foi possível carregar os dados da academia.");
            set({ isInitialized: true });
        }
      },

      setCurrentView: (view) => set({ currentView: view, isMobileMenuOpen: false }),
      setSelectedUserId: (userId) => set({ selectedUserId: userId }),

      login: (userCredentials) => {
          const user = get().users.find(u => u.email === userCredentials.email && (window as any).passwords[u.id] === userCredentials.pass);
          if (user) {
              set({ currentUser: user, currentView: 'dashboard' });
              return true;
          }
          return false;
      },
      
      logout: () => set({ currentUser: null }),
      
      resetPassword: async (email, newPass) => {
        try {
            const user = await db.users.where('email').equals(email).first();
            if (user) {
              (window as any).passwords[user.id] = newPass;
              return true;
            }
            return false;
        } catch (error) {
            toast.error("Erro ao redefinir a senha.");
            return false;
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

      createUser: async (newUserData) => {
        try {
          const existing = await db.users.where('email').equals(newUserData.email).first();
          if (existing) return { success: false, message: 'E-mail já cadastrado.' };
          
          const newId = await db.users.add({ ...newUserData, id: 0 }); // id is auto-incremented
          (window as any).passwords[newId] = newUserData.pass;
          const newUser = await db.users.get(newId);
          if(newUser) set(state => ({ users: [...state.users, newUser] }));
          return { success: true };
        } catch (error) {
            toast.error("Erro ao criar usuário.");
            return { success: false, message: 'Erro desconhecido.' };
        }
      },
      
      updateUser: async (updatedUserData) => {
        try {
          await db.users.update(updatedUserData.id, updatedUserData);
          if (updatedUserData.pass) (window as any).passwords[updatedUserData.id] = updatedUserData.pass;
            set(state => ({
                users: state.users.map(u => u.id === updatedUserData.id ? updatedUserData : u),
                currentUser: state.currentUser?.id === updatedUserData.id ? updatedUserData : state.currentUser
            }));
        } catch (error) {
            toast.error("Erro ao atualizar usuário.");
        }
      },
      
      deleteUser: async (userId) => {
        if (userId === get().currentUser?.id) {
            toast.error('Você não pode excluir sua própria conta.');
            return false;
        }
        try {
            await db.users.delete(userId);
            set(state => ({ users: state.users.filter(u => u.id !== userId) }));
            return true;
        } catch (error) {
            toast.error("Erro ao excluir usuário.");
            return false;
        }
      },

      addClass: async (newClass) => {
        try {
          const newId = await db.classes.add({ ...newClass, id: 0 });
          const addedClass = await db.classes.get(newId);
          if (addedClass) set(state => ({ classes: [...state.classes, addedClass] }));
          toast.success('Aula adicionada com sucesso!');
        } catch (error) {
          toast.error("Erro ao adicionar aula.");
        }
      },
      updateClass: async (updatedClass) => {
        try {
          await db.classes.update(updatedClass.id, updatedClass);
          set(state => ({ classes: state.classes.map(c => c.id === updatedClass.id ? updatedClass : c) }));
          toast.success('Aula atualizada com sucesso!');
        } catch (error) {
          toast.error("Erro ao atualizar aula.");
        }
      },
      deleteClass: async (classId) => {
        try {
          await db.classes.delete(classId);
          set(state => ({ classes: state.classes.filter(c => c.id !== classId) }));
          toast.success('Aula excluída com sucesso!');
        } catch (error) {
          toast.error("Erro ao excluir aula.");
        }
      },

      addProduct: async (newProduct) => {
          try {
            const newId = await db.products.add({ ...newProduct, id: 0 });
            const addedProduct = await db.products.get(newId);
            if (addedProduct) set(state => ({ products: [...state.products, addedProduct] }));
            toast.success('Produto adicionado com sucesso!');
          } catch (error) {
            toast.error("Erro ao adicionar produto.");
          }
      },
      updateProduct: async (updatedProduct) => {
          try {
            await db.products.update(updatedProduct.id, updatedProduct);
            set(state => ({ products: state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p) }));
            toast.success('Produto atualizado com sucesso!');
          } catch (error) {
            toast.error("Erro ao atualizar produto.");
          }
      },
      deleteProduct: async (productId) => {
          try {
            await db.products.delete(productId);
            set(state => ({ products: state.products.filter(p => p.id !== productId) }));
            toast.success('Produto excluído com sucesso!');
          } catch (error) {
            toast.error("Erro ao excluir produto.");
          }
      },

      addToCart: (product) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.id === product.id);
        let newCart: CartItem[];
        if (existingItem) {
          newCart = cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        } else {
          newCart = [...cart, { ...product, quantity: 1 }];
        }
        set({ cart: newCart });
        toast.success(`${product.name} adicionado ao carrinho!`);
      },
      updateCartQuantity: (productId, newQuantity) => {
        let newCart: CartItem[];
        if (newQuantity <= 0) {
          newCart = get().cart.filter(item => item.id !== productId);
        } else {
          newCart = get().cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
        }
        set({ cart: newCart });
      },
      removeFromCart: (productId) => {
        const newCart = get().cart.filter(item => item.id !== productId);
        set({ cart: newCart });
      },
      clearCart: () => {
        set({ cart: [] });
      },

      addAnnouncement: async (newAnnouncementData) => {
        try {
          const newAnnouncement = {
            ...newAnnouncementData,
            id: 0,
            date: new Date().toLocaleDateString('pt-BR')
          };
          const newId = await db.announcements.add(newAnnouncement);
          const addedAnn = await db.announcements.get(newId);
          if (addedAnn) set(state => ({ announcements: [addedAnn, ...state.announcements].sort((a,b) => b.id - a.id) }));
          toast.success('Aviso publicado com sucesso!');
        } catch (error) {
          toast.error("Erro ao publicar aviso.");
        }
      },
      deleteAnnouncement: async (announcementId) => {
          try {
            await db.announcements.delete(announcementId);
            set(state => ({ announcements: state.announcements.filter(a => a.id !== announcementId) }));
            toast.success('Aviso excluído com sucesso!');
          } catch (error) {
            toast.error("Erro ao excluir aviso.");
          }
      },

      bookTatame: async (bookingDetails) => {
        const currentUser = get().currentUser;
        if (!currentUser) return false;
        try {
          const newBooking: Booking = {
            ...bookingDetails,
            id: `${bookingDetails.tatameId}-${bookingDetails.date}-${bookingDetails.timeSlot}`,
            userId: currentUser.id,
            userEmail: currentUser.email,
            status: 'pending'
          };
          await db.bookings.add(newBooking);
          set(state => ({ bookings: [...state.bookings, newBooking] }));
          toast.success('Sua solicitação de reserva foi enviada para aprovação.');
          return true;
        } catch (error) {
          toast.error("Erro ao solicitar reserva. Horário já pode estar em processo de reserva.");
          return false;
        }
      },
      cancelBooking: async (bookingId) => {
        try {
          await db.bookings.delete(bookingId);
          set(state => ({ bookings: state.bookings.filter(b => b.id !== bookingId) }));
          toast.success('Reserva cancelada.');
        } catch (error) {
          toast.error("Erro ao cancelar reserva.");
        }
      },
      updateBookingStatus: async (bookingId, action) => {
        try {
            if (action === 'deny') {
                await db.bookings.delete(bookingId);
                set(state => ({ bookings: state.bookings.filter(b => b.id !== bookingId) }));
                toast.error('Solicitação de reserva negada.');
            } else {
                await db.bookings.update(bookingId, { status: 'confirmed' });
                const updatedBooking = await db.bookings.get(bookingId);
                if (updatedBooking) set(state => ({ bookings: state.bookings.map(b => (b.id === bookingId ? updatedBooking : b)) }));
                toast.success('Reserva confirmada com sucesso!');
            }
        } catch (error) {
          toast.error("Erro ao atualizar reserva.");
        }
      },
      updateTatameAreas: async (updatedAreas) => {
        try {
          await db.tatameAreas.bulkPut(updatedAreas);
          set({ tatameAreas: updatedAreas });
          toast.success('Áreas de tatame salvas!');
        } catch (error) {
          toast.error("Erro ao salvar áreas de tatame.");
        }
      },
      addTatameArea: async (areaData) => {
        try {
          const newArea: TatameArea = { ...areaData, id: `tatame-${Date.now()}`};
          await db.tatameAreas.add(newArea);
          set(state => ({ tatameAreas: [...state.tatameAreas, newArea] }));
          toast.success('Área de tatame adicionada!');
        } catch (error) {
          toast.error("Erro ao adicionar área de tatame.");
        }
      },

      addPromotion: async (newPlan) => {
        try {
          const newId = await db.promotions.add({ ...newPlan, id: 0 });
          const addedPlan = await db.promotions.get(newId);
          if (addedPlan) set(state => ({ promotions: [...state.promotions, addedPlan] }));
          toast.success('Plano adicionado com sucesso!');
        } catch (error) {
          toast.error("Erro ao adicionar plano.");
        }
      },
      updatePromotion: async (updatedPlan) => {
          try {
            await db.promotions.update(updatedPlan.id, updatedPlan);
            set(state => ({ promotions: state.promotions.map(p => p.id === updatedPlan.id ? updatedPlan : p) }));
            toast.success('Plano atualizado com sucesso!');
          } catch (error) {
            toast.error("Erro ao atualizar plano.");
          }
      },
      deletePromotion: async (planId) => {
          try {
            await db.promotions.delete(planId);
            set(state => ({ promotions: state.promotions.filter(p => p.id !== planId) }));
            toast.success('Plano excluído com sucesso!');
          } catch (error) {
            toast.error("Erro ao excluir plano.");
          }
      },

      updateSiteSettings: async (newSettings) => {
        try {
          await db.siteSettings.put(newSettings);
          set({ siteSettings: newSettings });
          toast.success('Configurações salvas com sucesso!');
        } catch (error) {
          toast.error("Erro ao salvar configurações.");
        }
      },

      addTransaction: async (newTransaction) => {
          try {
            const newId = await db.financialTransactions.add({ ...newTransaction, id: 0 });
            const addedTransaction = await db.financialTransactions.get(newId);
            if (addedTransaction) set(state => ({ financialTransactions: [...state.financialTransactions, addedTransaction] }));
            toast.success('Transação adicionada com sucesso!');
          } catch (error) {
            toast.error("Erro ao adicionar transação.");
          }
      },
      deleteTransaction: async (transactionId) => {
          try {
            await db.financialTransactions.delete(transactionId);
            set(state => ({ financialTransactions: state.financialTransactions.filter(t => t.id !== transactionId) }));
            toast.success('Transação removida com sucesso!');
          } catch (error) {
            toast.error("Erro ao remover transação.");
          }
      },
      addCategory: async (newCategory) => {
          try {
            const newId = await db.financialCategories.add({ ...newCategory, id: 0 });
            const addedCategory = await db.financialCategories.get(newId);
            if(addedCategory) set(state => ({ financialCategories: [...state.financialCategories, addedCategory] }));
            toast.success('Categoria adicionada com sucesso!');
          } catch (error) {
            toast.error("Erro ao adicionar categoria.");
          }
      },
      updateCategory: async (updatedCategory) => {
          try {
            await db.financialCategories.update(updatedCategory.id, updatedCategory);
            set(state => ({ financialCategories: state.financialCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c) }));
            toast.success('Categoria atualizada!');
          } catch (error) {
            toast.error("Erro ao atualizar categoria.");
          }
      },
      deleteCategory: async (categoryId) => {
        if (get().financialTransactions.some(t => t.categoryId === categoryId)) {
            toast.error('Não é possível excluir uma categoria em uso.');
            return false;
        }
        try {
          await db.financialCategories.delete(categoryId);
          set(state => ({ financialCategories: state.financialCategories.filter(c => c.id !== categoryId) }));
          toast.success('Categoria removida com sucesso!');
          return true;
        } catch (error) {
          toast.error("Erro ao remover categoria.");
          return false;
        }
      },

      processAiCommand: async (command) => {
          try {
            if (!process.env.API_KEY) {
                return { success: false, message: "API Key do Gemini não configurada." };
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const categories = get().financialCategories;
            const today = new Date().toISOString().split('T')[0];

            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: `Analise o seguinte comando de voz: "${command}". Extraia uma descrição, valor, e o tipo ('income' ou 'expense'). Baseado na descrição e na lista de categorias a seguir, determine o categoryId mais apropriado: ${JSON.stringify(categories)}. A data da transação é hoje: ${today}.`,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING, description: "Descrição da transação." },
                            amount: { type: Type.NUMBER, description: "Valor numérico da transação." },
                            type: { type: Type.STRING, enum: ['income', 'expense'], description: "Tipo: 'income' para entrada, 'expense' para saída." },
                            categoryId: { type: Type.NUMBER, description: "ID da categoria correspondente." },
                        },
                        required: ["description", "amount", "type", "categoryId"]
                    },
                },
            });

            const jsonStr = response.text.trim();
            const parsed = JSON.parse(jsonStr) as Omit<FinancialTransaction, 'id' | 'date'>;
            
            if (!parsed.description || !parsed.amount || !parsed.categoryId) {
                return { success: false, message: "Não entendi todos os detalhes. Tente novamente." };
            }

            const newTransactionData: Omit<FinancialTransaction, 'id'> = { ...parsed, date: today };
            const newId = await db.financialTransactions.add(newTransactionData as any);
            const newTransaction = await db.financialTransactions.get(newId);

            if (newTransaction) {
              set(state => ({ financialTransactions: [...state.financialTransactions, newTransaction] }));
              return { success: true, message: "Transação adicionada via IA!", transaction: newTransaction };
            }
            throw new Error("Falha ao salvar a transação no banco de dados.");

          } catch (error) {
            console.error("AI Command Error:", error);
            return { success: false, message: "Erro ao processar comando com IA." };
          }
      },
      
      processPlanPayment: async (planId) => {
        const currentUser = get().currentUser;
        const plan = get().promotions.find(p => p.id === planId);
        if (!currentUser || !plan) {
            toast.error("Usuário ou plano não encontrado.");
            return;
        }

        try {
            const today = new Date();
            const dueDate = new Date(today.setMonth(today.getMonth() + 1)).toISOString().split('T')[0];
            const updatedUser = { ...currentUser, paymentDueDate: dueDate };

            await get().updateUser(updatedUser);

            const transaction: Omit<FinancialTransaction, 'id'> = {
                description: `Pagamento plano ${plan.name} - ${currentUser.name}`,
                amount: plan.total ?? plan.price,
                date: new Date().toISOString().split('T')[0],
                type: 'income',
                categoryId: 1 // Assuming 1 is 'Mensalidade'
            };
            await get().addTransaction(transaction);
        } catch (error) {
            toast.error("Erro ao processar o pagamento do plano.");
            throw error;
        }
      },

      processCartCheckout: async () => {
        const { cart, currentUser } = get();
        if (cart.length === 0 || !currentUser) {
            toast.error("Carrinho vazio ou usuário não logado.");
            return;
        }

        try {
            const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const description = `Compra na loja - ${currentUser.name}: ` + cart.map(i => `${i.quantity}x ${i.name}`).join(', ');

            const transaction: Omit<FinancialTransaction, 'id'> = {
                description: description.substring(0, 100), // Truncate if needed
                amount: total,
                date: new Date().toISOString().split('T')[0],
                type: 'income',
                categoryId: 2 // Assuming 2 is 'Venda de Produtos'
            };

            await get().addTransaction(transaction);
            set({ cart: [] }); // Clear cart after checkout
        } catch (error) {
            toast.error("Erro ao processar a compra.");
            throw error;
        }
      },
    })
);

// This is a workaround for storing passwords without a backend.
// In a real application, NEVER do this.
(window as any).passwords = {};
initialUsers.forEach(u => {
  (window as any).passwords[u.id] = (u as any).pass;
});