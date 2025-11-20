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
        try {
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
        } catch (error) {
            console.error("Failed to initialize app:", error);
            toast.error("Não foi possível carregar os dados da academia.");
            set({ isInitialized: true }); // Mark as initialized to prevent loading loop
        }
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
          try {
            await db.credentials.update({ email, pass: newPass });
            set({ credentials: { ...credentials, [email]: newPass } });
            return true;
          } catch (error) {
            console.error("Failed to reset password:", error);
            toast.error("Erro ao redefinir a senha.");
            return false;
          }
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
        try {
          const newCollapsedState = !get().isSidebarCollapsed;
          await db.sidebar.saveCollapsed(newCollapsedState);
          set({ isSidebarCollapsed: newCollapsedState });
        } catch (error) {
          console.error("Failed to toggle sidebar:", error);
          toast.error("Erro ao salvar preferência do menu.");
        }
      },

      createUser: async (newUserData) => {
        if (get().users.some(u => u.email === newUserData.email)) {
          return { success: false, message: 'Este e-mail já está cadastrado.' };
        }
        try {
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
        } catch (error) {
            console.error("Failed to create user:", error);
            toast.error("Erro ao criar usuário.");
            return { success: false, message: 'Erro no banco de dados.' };
        }
      },
      
      updateUser: async (updatedUserData) => {
        try {
          const { pass, ...userToUpdate } = updatedUserData;
          await db.users.update(userToUpdate);
          set(state => ({
            users: state.users.map(u => u.id === userToUpdate.id ? userToUpdate : u),
            currentUser: state.currentUser?.id === userToUpdate.id ? userToUpdate : state.currentUser
          }));
          
          if (pass && pass.length > 0) {
            await db.credentials.update({ email: userToUpdate.email, pass });
            set(state => ({
              credentials: { ...state.credentials, [userToUpdate.email]: pass }
            }));
          }
        } catch (error) {
            console.error("Failed to update user:", error);
            toast.error("Erro ao atualizar usuário.");
        }
      },
      
      deleteUser: async (userId) => {
        if (userId === get().currentUser?.id) {
            toast.error('Você não pode excluir sua própria conta.');
            return false;
        }
        const userToDelete = get().users.find(u => u.id === userId);
        if (userToDelete) {
          try {
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
          } catch (error) {
            console.error("Failed to delete user:", error);
            toast.error("Erro ao excluir usuário.");
            return false;
          }
        }
        return false;
      },

      addClass: async (newClass) => {
        try {
          const classToAdd = { ...newClass, id: Date.now() };
          await db.classes.add(classToAdd);
          set(state => ({ classes: [...state.classes, classToAdd] }));
          toast.success('Aula adicionada com sucesso!');
        } catch (error) {
          console.error("Failed to add class:", error);
          toast.error("Erro ao adicionar aula.");
        }
      },
      updateClass: async (updatedClass) => {
        try {
          await db.classes.update(updatedClass);
          set(state => ({ classes: state.classes.map(c => c.id === updatedClass.id ? updatedClass : c) }));
          toast.success('Aula atualizada com sucesso!');
        } catch (error) {
          console.error("Failed to update class:", error);
          toast.error("Erro ao atualizar aula.");
        }
      },
      deleteClass: async (classId) => {
        try {
          await db.classes.delete(classId);
          set(state => ({ classes: state.classes.filter(c => c.id !== classId) }));
          toast.success('Aula excluída com sucesso!');
        } catch (error) {
          console.error("Failed to delete class:", error);
          toast.error("Erro ao excluir aula.");
        }
      },

      addProduct: async (newProduct) => {
          try {
            const productToAdd = { ...newProduct, id: Date.now() };
            await db.products.add(productToAdd);
            set(state => ({ products: [...state.products, productToAdd] }));
            toast.success('Produto adicionado com sucesso!');
          } catch (error) {
            console.error("Failed to add product:", error);
            toast.error("Erro ao adicionar produto.");
          }
      },
      updateProduct: async (updatedProduct) => {
          try {
            await db.products.update(updatedProduct);
            set(state => ({ products: state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p) }));
            toast.success('Produto atualizado com sucesso!');
          } catch (error) {
            console.error("Failed to update product:", error);
            toast.error("Erro ao atualizar produto.");
          }
      },
      deleteProduct: async (productId) => {
          try {
            await db.products.delete(productId);
            set(state => ({ products: state.products.filter(p => p.id !== productId) }));
            toast.success('Produto excluído com sucesso!');
          } catch (error) {
            console.error("Failed to delete product:", error);
            toast.error("Erro ao excluir produto.");
          }
      },

      addToCart: async (product) => {
        try {
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
        } catch (error) {
          console.error("Failed to add to cart:", error);
          toast.error("Erro ao adicionar ao carrinho.");
        }
      },
      updateCartQuantity: async (productId, newQuantity) => {
        try {
          let newCart: CartItem[];
          if (newQuantity <= 0) {
            newCart = get().cart.filter(item => item.id !== productId);
          } else {
            newCart = get().cart.map(item => item.id === productId ? { ...item, quantity: newQuantity } : item);
          }
          await db.cart.saveAll(newCart);
          set({ cart: newCart });
        } catch (error) {
          console.error("Failed to update cart quantity:", error);
          toast.error("Erro ao atualizar o carrinho.");
        }
      },
      removeFromCart: async (productId) => {
          try {
            const newCart = get().cart.filter(item => item.id !== productId);
            await db.cart.saveAll(newCart);
            set({ cart: newCart });
          } catch (error) {
            console.error("Failed to remove from cart:", error);
            toast.error("Erro ao remover do carrinho.");
          }
      },
      clearCart: async () => {
          try {
            await db.cart.saveAll([]);
            set({ cart: [] });
          } catch (error) {
            console.error("Failed to clear cart:", error);
            toast.error("Erro ao limpar o carrinho.");
          }
      },

      addAnnouncement: async (newAnnouncementData) => {
        try {
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
          toast.success('Aviso publicado com sucesso!');
        } catch (error) {
          console.error("Failed to add announcement:", error);
          toast.error("Erro ao publicar aviso.");
        }
      },
      deleteAnnouncement: async (announcementId) => {
          try {
            await db.announcements.delete(announcementId);
            set(state => ({ announcements: state.announcements.filter(a => a.id !== announcementId) }));
            toast.success('Aviso excluído com sucesso!');
          } catch (error) {
            console.error("Failed to delete announcement:", error);
            toast.error("Erro ao excluir aviso.");
          }
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
        try {
          await db.bookings.add(newBooking);
          set(state => ({ bookings: [...state.bookings, newBooking] }));
          toast.success('Sua solicitação de reserva foi enviada para aprovação.');
          return true;
        } catch (error) {
          console.error("Failed to book tatame:", error);
          toast.error("Erro ao solicitar reserva.");
          return false;
        }
      },
      cancelBooking: async (bookingId) => {
        try {
          await db.bookings.delete(bookingId);
          set(state => ({ bookings: state.bookings.filter(b => b.id !== bookingId) }));
          toast.success('Reserva cancelada.');
        } catch (error) {
          console.error("Failed to cancel booking:", error);
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
            const bookingToUpdate = get().bookings.find(b => b.id === bookingId);
            if(bookingToUpdate) {
                const updatedBooking = { ...bookingToUpdate, status: 'confirmed' as 'confirmed' };
                await db.bookings.update(updatedBooking);
                set(state => ({ bookings: state.bookings.map(b => (b.id === bookingId ? updatedBooking : b)) }));
                toast.success('Reserva confirmada com sucesso!');
            }
          }
        } catch (error) {
          console.error("Failed to update booking status:", error);
          toast.error("Erro ao atualizar reserva.");
        }
      },
      updateTatameAreas: async (updatedAreas) => {
        try {
          await db.tatameAreas.saveAll(updatedAreas);
          set({ tatameAreas: updatedAreas });
          toast.success('Áreas de tatame salvas!');
        } catch (error) {
          console.error("Failed to update tatame areas:", error);
          toast.error("Erro ao salvar áreas de tatame.");
        }
      },
      addTatameArea: async (areaData) => {
        try {
          const newArea: TatameArea = {
            ...areaData,
            id: `${areaData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
          };
          const currentAreas = get().tatameAreas;
          await db.tatameAreas.saveAll([...currentAreas, newArea]);
          set(state => ({ tatameAreas: [...state.tatameAreas, newArea] }));
          toast.success('Área de tatame adicionada!');
        } catch (error) {
          console.error("Failed to add tatame area:", error);
          toast.error("Erro ao adicionar área de tatame.");
        }
      },

      addPromotion: async (newPlan) => {
        try {
          const planToAdd = { ...newPlan, id: Date.now() };
          await db.promotions.add(planToAdd);
          set(state => ({ promotions: [...state.promotions, planToAdd] }));
          toast.success('Plano adicionado com sucesso!');
        } catch (error) {
          console.error("Failed to add promotion:", error);
          toast.error("Erro ao adicionar plano.");
        }
      },
      updatePromotion: async (updatedPlan) => {
          try {
            await db.promotions.update(updatedPlan);
            set(state => ({ promotions: state.promotions.map(p => p.id === updatedPlan.id ? updatedPlan : p) }));
            toast.success('Plano atualizado com sucesso!');
          } catch (error) {
            console.error("Failed to update promotion:", error);
            toast.error("Erro ao atualizar plano.");
          }
      },
      deletePromotion: async (planId) => {
          try {
            await db.promotions.delete(planId);
            set(state => ({ promotions: state.promotions.filter(p => p.id !== planId) }));
            toast.success('Plano excluído com sucesso!');
          } catch (error) {
            console.error("Failed to delete promotion:", error);
            toast.error("Erro ao excluir plano.");
          }
      },

      updateSiteSettings: async (newSettings) => {
        try {
          await db.siteSettings.save(newSettings);
          set({ siteSettings: newSettings });
          toast.success('Configurações salvas com sucesso!');
        } catch (error) {
          console.error("Failed to update site settings:", error);
          toast.error("Erro ao salvar configurações.");
        }
      },

      addTransaction: async (newTransaction) => {
          try {
            const transactionToAdd = { ...newTransaction, id: Date.now() };
            await db.financialTransactions.add(transactionToAdd);
            set(state => ({ financialTransactions: [...state.financialTransactions, transactionToAdd] }));
            toast.success('Transação adicionada com sucesso!');
          } catch (error) {
            console.error("Failed to add transaction:", error);
            toast.error("Erro ao adicionar transação.");
          }
      },
      deleteTransaction: async (transactionId) => {
          try {
            await db.financialTransactions.delete(transactionId);
            set(state => ({ financialTransactions: state.financialTransactions.filter(t => t.id !== transactionId) }));
            toast.success('Transação removida com sucesso!');
          } catch (error) {
            console.error("Failed to delete transaction:", error);
            toast.error("Erro ao remover transação.");
          }
      },
      addCategory: async (newCategory) => {
          try {
            const categoryToAdd = { ...newCategory, id: Date.now() };
            await db.financialCategories.add(categoryToAdd);
            set(state => ({ financialCategories: [...state.financialCategories, categoryToAdd] }));
            toast.success('Categoria adicionada com sucesso!');
          } catch (error) {
            console.error("Failed to add category:", error);
            toast.error("Erro ao adicionar categoria.");
          }
      },
      updateCategory: async (updatedCategory) => {
          try {
            await db.financialCategories.update(updatedCategory);
            set(state => ({ financialCategories: state.financialCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c) }));
            toast.success('Categoria atualizada!');
          } catch (error) {
            console.error("Failed to update category:", error);
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
          console.error("Failed to delete category:", error);
          toast.error("Erro ao remover categoria.");
          return false;
        }
      },
      
      processPlanPayment: async (planId) => {
        const { promotions, currentUser, addTransaction, updateUser } = get();
        if (!currentUser) return;

        const plan = promotions.find(p => p.id === planId);
        if (!plan) {
            toast.error("Plano não encontrado.");
            return;
        }

        try {
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
        } catch (error) {
            console.error("Failed to process plan payment:", error);
            toast.error("Erro ao processar o pagamento do plano.");
            throw error; // Re-throw to be caught in the UI
        }
      },

      processCartCheckout: async () => {
        const { cart, currentUser, addTransaction, clearCart } = get();
        if (!currentUser || cart.length === 0) return;

        try {
          const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
          await addTransaction({
              description: `Compra na Loja - ${currentUser.name}`,
              amount: total,
              date: new Date().toISOString().split('T')[0],
              type: 'income',
              categoryId: 2, // Assumes 'Venda de Produtos' is always ID 2
          });

          await clearCart();
        } catch (error) {
          console.error("Failed to process cart checkout:", error);
          toast.error("Erro ao processar a compra.");
          throw error; // Re-throw to be caught in the UI
        }
      },
    })
);
