import { create } from 'zustand';
import toast from 'react-hot-toast';
import { GoogleGenAI, Type } from "@google/genai";
import { supabase, getFullUserProfile } from './api';
import { type View, type Product, type User, type ClassSession, type Booking, type Announcement, type PromotionPlan, type SiteSettings, type TatameArea, type CartItem, type FinancialTransaction, type TransactionCategory, type AITransactionResult } from './types';

const defaultSiteSettings: SiteSettings = {
  id: 1,
  academy_name: "BJJ Agenda",
  instagram_url: "",
  facebook_url: "",
  x_url: "",
  whatsapp_url: "",
  pix_key: "",
  payment_instructions: "",
  logo_url: null,
  login_image_url: null,
  payment_gateway: 'manual',
  mercado_pago_api_key: '',
  asaas_api_key: '',
};

interface AppState {
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
  selectedUserId: string | null;
  
  isCartOpen: boolean;
  isCheckoutOpen: boolean;
  isMobileMenuOpen: boolean;

  initializeApp: () => Promise<void>;
  listenToAuthChanges: () => () => void;
  setCurrentView: (view: View) => void;
  setSelectedUserId: (userId: string | null) => void;
  login: (credentials: { email: string; pass: string }) => Promise<string | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  
  openCart: () => void;
  closeCart: () => void;
  openCheckout: () => void;
  closeCheckout: () => void;
  openMobileMenu: () => void;
  closeMobileMenu: () => void;
  toggleSidebarCollapse: () => void;

  createUser: (userData: Omit<User, 'id' | 'email'>, authData: { email: string, pass: string }) => Promise<{ success: boolean, message?: string }>;
  updateUser: (updatedUserData: Partial<User> & { id: string }) => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;

  addClass: (newClass: Omit<ClassSession, 'id'>) => Promise<void>;
  updateClass: (updatedClass: ClassSession) => Promise<void>;
  deleteClass: (classId: number) => Promise<void>;

  addProduct: (newProduct: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (updatedProduct: Product) => Promise<void>;
  deleteProduct: (productId: number) => Promise<void>;

  addToCart: (product: Product) => void;
  updateCartQuantity: (productId: number, newQuantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
  
  addAnnouncement: (data: { title: string; content: string }) => Promise<void>;
  deleteAnnouncement: (announcementId: number) => Promise<void>;
  
  bookTatame: (details: Omit<Booking, 'id' | 'user_id' | 'user_email' | 'status' | 'booking_key'>) => Promise<void>;
  cancelBooking: (bookingId: number) => Promise<void>;
  updateBookingStatus: (bookingId: number, action: 'confirm' | 'deny') => Promise<void>;
  updateTatameAreas: (updatedAreas: TatameArea[]) => Promise<void>;
  addTatameArea: (areaData: Omit<TatameArea, 'id'>) => Promise<void>;

  addPromotion: (newPlan: Omit<PromotionPlan, 'id'>) => Promise<void>;
  updatePromotion: (updatedPlan: PromotionPlan) => Promise<void>;
  deletePromotion: (planId: number) => Promise<void>;
  
  updateSiteSettings: (newSettings: SiteSettings) => Promise<void>;

  addTransaction: (newTransaction: Omit<FinancialTransaction, 'id'>) => Promise<void>;
  deleteTransaction: (transactionId: number) => Promise<void>;
  addCategory: (newCategory: Omit<TransactionCategory, 'id'>) => Promise<void>;
  updateCategory: (updatedCategory: TransactionCategory) => Promise<void>;
  deleteCategory: (categoryId: number) => Promise<void>;
  processAiCommand: (command: string) => Promise<AITransactionResult>;
  
  processPlanPayment: (planId: number) => Promise<void>;
  processCartCheckout: () => Promise<void>;
}

export const useAppStore = create<AppState>()(
    (set, get) => ({
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
      
      initializeApp: async () => {
        get().listenToAuthChanges();
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const userProfile = await getFullUserProfile(session.user);
            set({ currentUser: userProfile });
        }
        
        const tables = [
            'classes', 'products', 'announcements', 'bookings', 'promotions', 
            'site_settings', 'tatame_areas', 'financial_transactions', 'financial_categories', 'profiles'
        ];
        
        const promises = tables.map(table => supabase.from(table).select('*'));
        const results = await Promise.all(promises);
        const [
            classesRes, productsRes, announcementsRes, bookingsRes, promotionsRes, 
            siteSettingsRes, tatameAreasRes, transactionsRes, categoriesRes, profilesRes
        ] = results;

        set({
            classes: classesRes.data || [],
            products: productsRes.data || [],
            announcements: (announcementsRes.data || []).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            bookings: bookingsRes.data || [],
            promotions: promotionsRes.data || [],
            siteSettings: (siteSettingsRes.data && siteSettingsRes.data[0]) || defaultSiteSettings,
            tatameAreas: tatameAreasRes.data || [],
            financialTransactions: transactionsRes.data || [],
            financialCategories: categoriesRes.data || [],
            users: profilesRes.data || [],
        });
      },
      
      listenToAuthChanges: () => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === 'SIGNED_IN' && session) {
            const userProfile = await getFullUserProfile(session.user);
            set({ currentUser: userProfile });
          } else if (event === 'SIGNED_OUT') {
            set({ currentUser: null });
          } else if (event === 'USER_UPDATED' && session) {
            const userProfile = await getFullUserProfile(session.user);
            set({ currentUser: userProfile });
          }
        });
        return () => subscription.unsubscribe();
      },

      setCurrentView: (view) => set({ currentView: view, isMobileMenuOpen: false }),
      setSelectedUserId: (userId) => set({ selectedUserId: userId }),

      login: async ({ email, pass }) => {
          const { error } = await supabase.auth.signInWithPassword({ email, password: pass });
          return error ? error.message : null;
      },
      
      logout: async () => {
        await supabase.auth.signOut();
        set({ currentUser: null, currentView: 'dashboard' });
      },
      
      resetPassword: async (email) => {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin, // You might need a password reset page
        });
        if (error) throw error;
        toast.success(`Instruções de recuperação enviadas para ${email}.`);
      },
      
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),
      openCheckout: () => set({ isCartOpen: false, isCheckoutOpen: true }),
      closeCheckout: () => set({ isCheckoutOpen: false }),
      openMobileMenu: () => set({ isMobileMenuOpen: true }),
      closeMobileMenu: () => set({ isMobileMenuOpen: false }),
      toggleSidebarCollapse: () => {
        const collapsed = !get().isSidebarCollapsed;
        localStorage.setItem('sidebarCollapsed', String(collapsed));
        set({ isSidebarCollapsed: collapsed });
      },

      createUser: async (profileData, authData) => {
        const { data, error } = await supabase.auth.signUp({
          email: authData.email,
          password: authData.pass,
          options: {
            data: profileData
          }
        });
        if (error) return { success: false, message: error.message };
        if (data.user) {
            const newUser = { ...profileData, id: data.user.id, email: data.user.email };
            set(state => ({ users: [...state.users, newUser as User] }));
            return { success: true };
        }
        return { success: false, message: 'Usuário não foi criado.'};
      },
      
      updateUser: async (updatedUserData) => {
        const { error } = await supabase.from('profiles').update(updatedUserData).eq('id', updatedUserData.id);
        if (error) throw error;
        set(state => ({
            users: state.users.map(u => u.id === updatedUserData.id ? { ...u, ...updatedUserData } : u),
            currentUser: state.currentUser?.id === updatedUserData.id ? { ...state.currentUser, ...updatedUserData } : state.currentUser
        }));
        toast.success("Usuário atualizado!");
      },
      
      deleteUser: async (userId: string) => {
        // This requires a server-side function to delete from auth.users
        toast.error("A exclusão de usuários deve ser feita no painel do Supabase por segurança.");
      },
      
      addClass: async (newClass) => {
        const { data, error } = await supabase.from('classes').insert(newClass).select().single();
        if (error) throw error;
        set(state => ({ classes: [...state.classes, data] }));
        toast.success('Aula adicionada!');
      },
      updateClass: async (updatedClass) => {
        const { error } = await supabase.from('classes').update(updatedClass).eq('id', updatedClass.id);
        if (error) throw error;
        set(state => ({ classes: state.classes.map(c => c.id === updatedClass.id ? updatedClass : c) }));
        toast.success('Aula atualizada!');
      },
      deleteClass: async (classId) => {
        const { error } = await supabase.from('classes').delete().eq('id', classId);
        if (error) throw error;
        set(state => ({ classes: state.classes.filter(c => c.id !== classId) }));
        toast.success('Aula excluída!');
      },

      addProduct: async (newProduct) => {
        const { data, error } = await supabase.from('products').insert(newProduct).select().single();
        if (error) throw error;
        set(state => ({ products: [...state.products, data] }));
        toast.success('Produto adicionado!');
      },
      updateProduct: async (updatedProduct) => {
        const { error } = await supabase.from('products').update(updatedProduct).eq('id', updatedProduct.id);
        if (error) throw error;
        set(state => ({ products: state.products.map(p => p.id === updatedProduct.id ? updatedProduct : p) }));
        toast.success('Produto atualizado!');
      },
      deleteProduct: async (productId) => {
        const { error } = await supabase.from('products').delete().eq('id', productId);
        if (error) throw error;
        set(state => ({ products: state.products.filter(p => p.id !== productId) }));
        toast.success('Produto excluído!');
      },

      addToCart: (product) => {
        const cart = get().cart;
        const existing = cart.find(item => item.id === product.id);
        if (existing) {
            get().updateCartQuantity(product.id!, existing.quantity + 1);
        } else {
            set(state => ({ cart: [...state.cart, { ...product, quantity: 1 }] }));
        }
        toast.success(`${product.name} adicionado ao carrinho!`);
      },
      updateCartQuantity: (productId, quantity) => {
        if (quantity <= 0) get().removeFromCart(productId);
        else set(state => ({ cart: state.cart.map(i => i.id === productId ? { ...i, quantity } : i) }));
      },
      removeFromCart: (productId) => set(state => ({ cart: state.cart.filter(i => i.id !== productId) })),
      clearCart: () => set({ cart: [] }),

      addAnnouncement: async (data) => {
        const { data: newAnnouncement, error } = await supabase.from('announcements').insert(data).select().single();
        if (error) throw error;
        set(state => ({ announcements: [newAnnouncement, ...state.announcements] }));
        toast.success('Aviso publicado!');
      },
      deleteAnnouncement: async (id) => {
        const { error } = await supabase.from('announcements').delete().eq('id', id);
        if (error) throw error;
        set(state => ({ announcements: state.announcements.filter(a => a.id !== id) }));
        toast.success('Aviso excluído!');
      },

      bookTatame: async (details) => {
        const user = get().currentUser;
        if (!user) return;
        const bookingData = {
            ...details,
            booking_key: `${details.date}-${details.tatame_id}-${details.time_slot}`,
            user_id: user.id,
            user_email: user.email,
            status: 'pending' as const
        };
        const { data, error } = await supabase.from('bookings').insert(bookingData).select().single();
        if (error) {
            toast.error("Este horário já foi solicitado.");
            throw error;
        }
        set(state => ({ bookings: [...state.bookings, data] }));
        toast.success('Solicitação de reserva enviada!');
      },
      cancelBooking: async (id) => {
        const { error } = await supabase.from('bookings').delete().eq('id', id);
        if (error) throw error;
        set(state => ({ bookings: state.bookings.filter(b => b.id !== id) }));
        toast.success('Reserva cancelada.');
      },
      updateBookingStatus: async (id, action) => {
        if (action === 'deny') {
            await get().cancelBooking(id);
            toast.success('Solicitação de reserva negada.');
        } else {
            const { data, error } = await supabase.from('bookings').update({ status: 'confirmed' }).eq('id', id).select().single();
            if (error) throw error;
            set(state => ({ bookings: state.bookings.map(b => b.id === id ? data : b) }));
            toast.success('Reserva confirmada!');
        }
      },
      updateTatameAreas: async (areas) => {
        // Supabase doesn't have a simple bulk update, must be done one by one or with a function
        const { error } = await supabase.from('tatame_areas').upsert(areas);
        if (error) throw error;
        set({ tatameAreas: areas });
        toast.success('Áreas de tatame atualizadas.');
      },
      addTatameArea: async (areaData) => {
        const newArea = { ...areaData, id: areaData.name.toLowerCase().replace(/\s+/g, '-') };
        const { error } = await supabase.from('tatame_areas').insert(newArea);
        if (error) throw error;
        set(state => ({ tatameAreas: [...state.tatameAreas, newArea] }));
        toast.success('Nova área de tatame adicionada.');
      },

      addPromotion: async (newPlan) => {
        const { data, error } = await supabase.from('promotions').insert(newPlan).select().single();
        if (error) throw error;
        set(state => ({ promotions: [...state.promotions, data] }));
        toast.success('Plano adicionado!');
      },
      updatePromotion: async (updatedPlan) => {
        const { error } = await supabase.from('promotions').update(updatedPlan).eq('id', updatedPlan.id);
        if (error) throw error;
        set(state => ({ promotions: state.promotions.map(p => p.id === updatedPlan.id ? updatedPlan : p) }));
        toast.success('Plano atualizado!');
      },
      deletePromotion: async (id) => {
        const { error } = await supabase.from('promotions').delete().eq('id', id);
        if (error) throw error;
        set(state => ({ promotions: state.promotions.filter(p => p.id !== id) }));
        toast.success('Plano excluído!');
      },

      updateSiteSettings: async (newSettings) => {
        const { error } = await supabase.from('site_settings').update(newSettings).eq('id', newSettings.id);
        if (error) throw error;
        set({ siteSettings: newSettings });
        toast.success('Configurações salvas!');
      },

      addTransaction: async (newTransaction) => {
        const { data, error } = await supabase.from('financial_transactions').insert(newTransaction).select().single();
        if (error) throw error;
        set(state => ({ financialTransactions: [...state.financialTransactions, data] }));
        toast.success('Transação adicionada!');
      },
      deleteTransaction: async (id) => {
        const { error } = await supabase.from('financial_transactions').delete().eq('id', id);
        if (error) throw error;
        set(state => ({ financialTransactions: state.financialTransactions.filter(t => t.id !== id) }));
        toast.success('Transação excluída!');
      },
      addCategory: async (newCategory) => {
        const { data, error } = await supabase.from('financial_categories').insert(newCategory).select().single();
        if (error) throw error;
        set(state => ({ financialCategories: [...state.financialCategories, data] }));
      },
      updateCategory: async (updatedCategory) => {
        const { error } = await supabase.from('financial_categories').update(updatedCategory).eq('id', updatedCategory.id);
        if (error) throw error;
        set(state => ({
          financialCategories: state.financialCategories.map(c => c.id === updatedCategory.id ? updatedCategory : c)
        }));
        toast.success('Categoria atualizada!');
      },
      deleteCategory: async (id) => {
        const { error } = await supabase.from('financial_categories').delete().eq('id', id);
        if (error) throw error;
        set(state => ({ financialCategories: state.financialCategories.filter(c => c.id !== id) }));
      },

      processAiCommand: async (command) => {
        const categories = get().financialCategories;
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        
        try {
            const result = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: command,
                config: {
                    systemInstruction: `Você é um assistente financeiro para uma academia de Jiu-Jitsu. Sua tarefa é extrair informações de transações financeiras de um texto em linguagem natural. A data de hoje é ${new Date().toLocaleDateString('pt-BR')}. As categorias disponíveis são: ${JSON.stringify(categories)}. Se a categoria mencionada não existir, use a mais próxima. Se não houver próxima, retorne um erro. Retorne apenas um objeto JSON com o formato especificado.`,
                    responseMimeType: 'application/json',
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            description: { type: Type.STRING },
                            amount: { type: Type.NUMBER },
                            type: { type: Type.STRING, enum: ['income', 'expense'] },
                            category_id: { type: Type.NUMBER }
                        },
                        required: ['description', 'amount', 'type', 'category_id']
                    }
                }
            });

            const jsonText = result.text.trim();
            const transactionData = JSON.parse(jsonText);
            
            const transaction: Omit<FinancialTransaction, 'id'> = {
                ...transactionData,
                date: new Date().toISOString().split('T')[0],
            };
            
            await get().addTransaction(transaction);
            
            return { success: true, message: 'Transação adicionada com sucesso!', transaction: transactionData };

        } catch (error) {
            console.error("AI Error:", error);
            return { success: false, message: 'Não consegui entender o comando. Tente novamente.' };
        }
      },
      
      processPlanPayment: async (planId) => {
        const user = get().currentUser;
        if (!user) throw new Error("Usuário não logado.");
        const plan = get().promotions.find(p => p.id === planId);
        if (!plan) throw new Error("Plano não encontrado.");
        
        let months = 1;
        if (plan.name.toLowerCase().includes('trimestral')) months = 3;
        if (plan.name.toLowerCase().includes('semestral')) months = 6;
        if (plan.name.toLowerCase().includes('anual')) months = 12;

        const newDueDate = new Date();
        newDueDate.setMonth(newDueDate.getMonth() + months);
        
        const updatedUser = { id: user.id, payment_due_date: newDueDate.toISOString().split('T')[0] };
        await get().updateUser(updatedUser);

        await get().addTransaction({
            description: `Pagamento ${plan.name} - ${user.name}`,
            amount: plan.total ?? plan.price,
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            category_id: 1 // Mensalidade
        });
      },
      processCartCheckout: async () => {
        const user = get().currentUser;
        if (!user) throw new Error("Usuário não logado.");
        const cart = get().cart;
        const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        await get().addTransaction({
            description: `Venda de produtos - ${user.name}`,
            amount: total,
            date: new Date().toISOString().split('T')[0],
            type: 'income',
            category_id: 2 // Venda de Produtos
        });
        
        set({ cart: [] });
      },
    })
);