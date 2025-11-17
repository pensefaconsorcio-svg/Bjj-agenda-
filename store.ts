import create from 'zustand';
import toast from 'react-hot-toast';
import { type View, type Product, type User, type ClassSession, type Booking, type Announcement, type PromotionPlan, type SiteSettings, type TatameArea, type CartItem, type FinancialTransaction, type TransactionCategory, type Belt } from './types';
import { db } from './db';

interface AppState {
  // --- STATE ---
  currentUser: User | null;
  currentView: View;
  users: User[];
  credentials: { [email: string]: string };
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
  toggleSidebarCollapse: () => Promise<void>;

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
  addToCart: (product: Product) => Promise<void>;
  updateCartQuantity: (productId: number, newQuantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  
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
      credentials: {},
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
        await db.init();
        const [
            users, credentials, classes, products, announcements, bookings,
            promotions, siteSettings, tatameAreas, cart, isSidebarCollapsed,
            financialTransactions, financialCategories
        ] = await Promise.all([
            db.users.getAll(), db.credentials.getAll(), db.classes.getAll(),
            db.products.getAll(), db.announcements.getAll(), db.bookings.getAll(),
            db.promotions.getAll(), db.siteSettings.get(), db.tatameAreas.getAll(),
            db.cart.getAll(), db.sidebar.isCollapsed(), db.financialTransactions.getAll(),
            db.financialCategories.getAll()
        ]);
        
        const credentialsMap = credentials.reduce((acc, cred) => {
            acc[cred.email] = cred.pass;
            return acc;
        }, {} as { [email: string]: string });

        set({
            users, credentials: credentialsMap, classes, products, announcements,
            bookings, promotions, siteSettings, tatameAreas, cart, isSidebarCollapsed,
            financialTransactions, financialCategories, isInitialized: true
        });
      },

      setCurrentView: (view) => set({ currentView: view, isMobileMenuOpen: false }),
      setSelectedUserId: (userId) => set({ selectedUserId: userId }),

      login: (userCredentials) => {
        const { users, credentials } = get();
        const user = users.find(u => u.email === userCredentials.email);
        const correctPassword = credentials[userCredentials.email];

        if (user && userCredentials.pass === correctPassword) {
          set({ currentUser: user, currentView: 'dashboard' });
          return true;
        }
        return false;
      },
      
      logout: () => set({ currentUser: null }),
      
      resetPassword: async (email, newPass) => {
        const { users, credentials } = get();
        const userExists = users.some(u => u.email === email);
        if (userExists && credentials[email]) {
          await db.credentials.update({ email, pass: newPass });
          set({ credentials: { ...credentials, [email]: newPass } });
          return true;
        }
        return false;
      },
      
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      openCheckout: () => set({ isCartOpen: false, isCheckoutOpen: true }),
      closeCheckout: () => set({ isCheckoutOpen: false }),
      openMobileMenu: () => set({ isMobileMenuOpen: true }),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      toggleSidebarCollapse: async () => {
        const newCollapsedState = !get().isSidebarCollapsed;
        await db.sidebar.saveCollapsed(newCollapsedState);
        set({ isSidebarCollapsed: newCollapsedState });
      },

      createUser: async (newUserData) => {
        if (get().users.some(u => u.email === newUserData.email)) {
          return { success: false, message: 'Este e-mail já está cadastrado.' };
        }
        const newUser: User = {
          id: Date.now(),
          email: newUserData.email,
          name: newUserData.name,
          role: newUserData.role,
          belt: newUserData.belt,
          paymentDueDate: newUserData.role === 'user' ? newUserData.paymentDueDate : null,
        };
        const newCredential = { email: newUserData.email, pass: newUserData.pass };
        await db.users.add(newUser);
        await db.credentials.add(newCredential);
        set(state => ({
          users: [...state.users, newUser],
          credentials: { ...state.credentials, [newUserData.email]: newUserData.pass }
        }));
        return { success: true };
      },
      
      updateUser: async (updatedUserData) => {
        const { pass, ...userToUpdate } = updatedUserData;
        await db.users.update(userToUpdate);
        set(state => ({
          users: state.users.map(u => u.id === userToUpdate.id ? userToUpdate : u),
          // Also update currentUser if it's the one being changed
          currentUser: state.currentUser?.id === userToUpdate.id ? userToUpdate : state.currentUser
        }));
        
        if (pass && pass.length > 0) {
          await db.credentials.update({ email: userToUpdate.email, pass });
          set(state => ({
            credentials: { ...state.credentials, [userToUpdate.email]: pass }
          }));
        }
      },
      
      deleteUser: async (userId) => {
        if (userId === get().currentUser?.id) {
            toast.error('Você não pode excluir sua própria conta.');
            return false;
        }
        const userToDelete = get().users.find(u => u.id === userId);
        if (userToDelete) {
          await db.users.delete(userId);
          await db.credentials.delete(userToDelete.email);
          set(state => {
            const newCreds = { ...state.credentials };
            delete newCreds[userToDelete.email];
            return {
              users: state.users.filter(u => u.id !== userId),
              credentials: newCreds
            };
          });
          return true;
        }
        return false;
      },

      addClass: async (newClass) => {
        const classToAdd = { ...newClass, id: Date.now() };
        await db.classes.add(classToAdd);
        set(state => ({ classes: [...state.classes, classToAdd] }))
      },
      updateClass: async (updatedClass) => {
        await db.classes.update(updatedClass);
        set(state => ({ classes: state.classes.map(c => c.id === updatedClass.id ? updatedClass : c) }))
      },
      deleteClass: async (classId) => {
        await db.classes.delete(classId);
        set(state => ({ classes: state.classes.filter(c => c.id !== classId) }));
      },

      addProduct: async (newProduct) => {
          const productToAdd = { ...newProduct, id: Date.now() };
          await db.products.add(productToAdd);
          set(state => ({ products: [...state.products, productToAdd] }))
      },
      updateProduct: async (updatedProduct) => {
          await db.products.update(updatedProduct);
          set(state => ({ products: state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p) }))
      },
      deleteProduct: async (productId) => {
          await db.products.delete(productId);
          set(state => ({ products: state.products.filter(p => p.id !== productId) }))
      },

      addToCart: async (product) => {
        const { cart } = get();
        const existingItem = cart.find(item => item.id === product.id);
        let newCart: CartItem[];
        if (existingItem) {
          newCart = cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
        } else {
          newCart = [...cart, { ...product, quantity: 1 }];
        }
        await db.cart.saveAll(newCart);
        set({ cart: newCart });
        toast.success(`${product.name} adicionado ao carrinho!`);
      },
      updateCartQuantity: async (productId, newQuantity) => {
        let newCart: CartItem[];
        if (newQuantity <= 0) {
          newCart = get().cart.filter(item => item.id !== productId);
        } else {
          newCart = get().cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
        }
        await db.cart.saveAll(newCart);
        set({ cart: newCart });
      },
      removeFromCart: async (productId) => {
          const newCart = get().cart.filter(item => item.id !== productId);
          await db.cart.saveAll(newCart);
          set({ cart: newCart });
      },
      clearCart: async () => {
          await db.cart.saveAll([]);
          set({ cart: [] });
      },

      addAnnouncement: async (newAnnouncementData) => {
        const date = new Date();
        const day = date.getDate();
        const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
        const month = monthNames[date.getMonth()];
        const year = date.getFullYear();
        const newAnnouncement: Announcement = {
          id: Date.now(),
          ...newAnnouncementData,
          date: `${day} de ${month}, ${year}`
        };
        await db.announcements.add(newAnnouncement);
        set(state => ({ announcements: [newAnnouncement, ...state.announcements].sort((a,b) => b.id - a.id) }));
      },
      deleteAnnouncement: async (announcementId) => {
          await db.announcements.delete(announcementId);
          set(state => ({ announcements: state.announcements.filter(a => a.id !== announcementId) }))
      },

      bookTatame: async (bookingDetails) => {
        const currentUser = get().currentUser;
        if (!currentUser) return false;
        
        const newBooking: Booking = {
            ...bookingDetails,
            id: `${bookingDetails.tatameId}-${bookingDetails.date}-${bookingDetails.timeSlot}`,
            userId: currentUser.id,
            userEmail: currentUser.email,
            status: 'pending',
        };

        if (get().bookings.some(b => b.id === newBooking.id)) {
            toast.error('Este horário já foi solicitado ou reservado.');
            return false;
        }
        await db.bookings.add(newBooking);
        set(state => ({ bookings: [...state.bookings, newBooking] }));
        toast.success('Sua solicitação de reserva foi enviada para aprovação.');
        return true;
      },
      cancelBooking: async (bookingId) => {
        await db.bookings.delete(bookingId);
        set(state => ({ bookings: state.bookings.filter(b => b.id !== bookingId) }));
      },
      updateBookingStatus: async (bookingId, action) => {
        if (action === 'deny') {
          await db.bookings.delete(bookingId);
          set(state => ({ bookings: state.bookings.filter(b => b.id !== bookingId) }));
        } else {
          const bookingToUpdate = get().bookings.find(b => b.id === bookingId);
          if(bookingToUpdate) {
              const updatedBooking = { ...bookingToUpdate, status: 'confirmed' as 'confirmed' };
              await db.bookings.update(updatedBooking);
              set(state => ({ bookings: state.bookings.map(b => (b.id === bookingId ? updatedBooking : b)) }));
          }
        }
      },
      updateTatameAreas: async (updatedAreas) => {
        await db.tatameAreas.saveAll(updatedAreas);
        set({ tatameAreas: updatedAreas });
      },
      addTatameArea: async (areaData) => {
        const newArea: TatameArea = {
          ...areaData,
          id: `${areaData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
        };
        const currentAreas = get().tatameAreas;
        await db.tatameAreas.saveAll([...currentAreas, newArea]);
        set(state => ({ tatameAreas: [...state.tatameAreas, newArea] }));
      },

      addPromotion: async (newPlan) => {
        const planToAdd = { ...newPlan, id: Date.now() };
        await db.promotions.add(planToAdd);
        set(state => ({ promotions: [...state.promotions, planToAdd] }))
      },
      updatePromotion: async (updatedPlan) => {
          await db.promotions.update(updatedPlan);
          set(state => ({ promotions: state.promotions.map(p => p.id === updatedPlan.id ? updatedPlan : p) }))
      },
      deletePromotion: async (planId) => {
          await db.promotions.delete(planId);
          set(state => ({ promotions: state.promotions.filter(p => p.id !== planId) }))
      },

      updateSiteSettings: async (newSettings) => {
        await db.siteSettings.save(newSettings);
        set({ siteSettings: newSettings });
      },

      addTransaction: async (newTransaction) => {
          const transactionToAdd = { ...newTransaction, id: Date.now() };
          await db.financialTransactions.add(transactionToAdd);
          set(state => ({ financialTransactions: [...state.financialTransactions, transactionToAdd] }));
      },
      deleteTransaction: async (transactionId) => {
          await db.financialTransactions.delete(transactionId);
          set(state => ({ financialTransactions: state.financialTransactions.filter(t => t.id !== transactionId) }))
      },
      addCategory: async (newCategory) => {
          const categoryToAdd = { ...newCategory, id: Date.now() };
          await db.financialCategories.add(categoryToAdd);
          set(state => ({ financialCategories: [...state.financialCategories, categoryToAdd] }));
      },
      updateCategory: async (updatedCategory) => {
          // Dexie doesn't have an update method, use put
          await db.financialCategories.add(updatedCategory); // Assuming add handles update on primary key conflict
          set(state => ({ financialCategories: state.financialCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c) }));
      },
      deleteCategory: async (categoryId) => {
        if (get().financialTransactions.some(t => t.categoryId === categoryId)) {
            toast.error('Não é possível excluir uma categoria em uso.');
            return false;
        }
        await db.financialCategories.delete(categoryId);
        set(state => ({ financialCategories: state.financialCategories.filter(c => c.id !== categoryId) }));
        return true;
      },
      
      processPlanPayment: async (planId) => {
        const { promotions, currentUser, addTransaction, updateUser } = get();
        if (!currentUser) return;

        const plan = promotions.find(p => p.id === planId);
        if (!plan) {
            toast.error("Plano não encontrado.");
            return;
        }

        const total = plan.total ?? plan.price;
        await addTransaction({
            description: `Pagamento Plano ${plan.name} - ${currentUser.name}`,
            amount: total,
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            categoryId: 1, // Assumes 'Mensalidades' is always ID 1
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const currentDueDate = currentUser.paymentDueDate ? new Date(currentUser.paymentDueDate + 'T00:00:00') : today;
        const baseDate = currentDueDate > today ? currentDueDate : today;
        const newDueDate = new Date(baseDate);
        newDueDate.setMonth(newDueDate.getMonth() + 1);

        const updatedUser = {
            ...currentUser,
            paymentDueDate: newDueDate.toISOString().split('T')[0],
        };
        await updateUser(updatedUser);
        
        toast.success(`Plano ${plan.name} assinado com sucesso!`);
      },

      processCartCheckout: async () => {
        const { cart, currentUser, addTransaction, clearCart, closeCheckout } = get();
        if (!currentUser || cart.length === 0) return;

        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
        await addTransaction({
            description: `Compra na Loja - ${currentUser.name}`,
            amount: total,
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            categoryId: 2, // Assumes 'Venda de Produtos' is always ID 2
        });

        await clearCart();
        closeCheckout();
        toast.success('Compra finalizada com sucesso!');
      },
    })
);