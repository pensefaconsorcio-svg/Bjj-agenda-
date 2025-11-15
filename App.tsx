
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Header'; // Using Header file for Sidebar component
import ScheduleView from './components/ScheduleView';
import AnnouncementsView from './components/AnnouncementsView';
import StoreView from './components/StoreView';
import Footer from './components/Footer';
import LoginView from './components/LoginView';
import BookingView from './components/BookingView';
import DashboardView from './components/DashboardView';
import PromotionsView from './components/PromotionsView';
import SiteSettingsView from './components/SiteSettingsView';
import UserManagementView from './components/UserManagementView';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import { type View, type Product, type User, type ClassSession, type Booking, type Announcement, type PromotionPlan, type SiteSettings, type TatameArea, type CartItem } from './types';
import { ShoppingCartIcon } from './components/icons/ShoppingCartIcon';
import { MenuIcon } from './components/icons/MenuIcon';

// Helper to get initial state from localStorage or use default
const getInitialState = <T extends object | boolean | string | number>(key: string, defaultValue: T): T => {
    try {
        const storedValue = localStorage.getItem(key);
        if (storedValue) {
            const parsed = JSON.parse(storedValue);
            
            // FIX: Handle type mismatches for primitive types stored in localStorage.
            // Handle simple boolean/string values
            if (typeof parsed !== 'object' || parsed === null) {
                if (typeof parsed === typeof defaultValue) {
                    return parsed;
                }
                // If types don't match, fall back to the default value.
                return defaultValue;
            }
            // From here on, we know `parsed` is an object or array.

            // Specific migration for paymentLink -> pixKey
            if (key === 'bjjagenda-siteSettings' && parsed.paymentLink) {
              delete parsed.paymentLink;
            }

            // Image URL migration
            if (key === 'bjjagenda-siteSettings' && typeof parsed === 'object' && parsed !== null) {
                if (parsed.logoUrl && typeof parsed.logoUrl === 'string' && !parsed.logoUrl.startsWith('data:')) {
                    parsed.logoUrl = null;
                }
                if (parsed.loginImageUrl && typeof parsed.loginImageUrl === 'string' && !parsed.loginImageUrl.startsWith('data:')) {
                    parsed.loginImageUrl = null;
                }
            }

            // If default is an array, we expect parsed to be an array. Don't merge.
            if (Array.isArray(defaultValue)) {
                // FIX: Cast `parsed` to `T` to resolve the TypeScript error. This trusts that the
                // data from localStorage has the correct array element type.
                return Array.isArray(parsed) ? (parsed as T) : defaultValue;
            }
            
            // For objects, merge to inherit new properties from default.
            if (typeof defaultValue === 'object' && defaultValue !== null) {
                 return { ...defaultValue, ...parsed };
            }

            // FIX: If `parsed` is an object but `defaultValue` is a primitive, there's a
            // type mismatch in localStorage. Return the default value to avoid runtime errors.
            return defaultValue;
        }
        return defaultValue;
    } catch (error) {
        console.error(`Error reading from localStorage for key ${key}:`, error);
        return defaultValue;
    }
};

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
  // Gis
  { id: 1, name: 'Gi Azul Royal', price: 450.00, imageUrl: 'https://picsum.photos/seed/bjj-gi-blue/400/400', category: 'Gis' },
  { id: 2, name: 'Gi Preto Competição', price: 550.00, imageUrl: 'https://picsum.photos/seed/bjj-gi-black/400/400', category: 'Gis' },
  { id: 8, name: 'Gi Branco Clássico', price: 420.00, imageUrl: 'https://picsum.photos/seed/bjj-gi-white/400/400', category: 'Gis' },
  
  // Rashguards
  { id: 3, name: 'Rashguard "Arte Suave"', price: 180.00, imageUrl: 'https://picsum.photos/seed/bjj-rashguard-art/400/400', category: 'Rashguards' },
  { id: 4, name: 'Rashguard Logo Academia', price: 150.00, imageUrl: 'https://picsum.photos/seed/bjj-rashguard-logo/400/400', category: 'Rashguards' },
  
  // Vestuário (Apparel)
  { id: 7, name: 'Bermuda No-Gi Preta', price: 120.00, imageUrl: 'https://picsum.photos/seed/bjj-shorts-black/400/400', category: 'Vestuário' },
  { id: 9, name: 'Camiseta "Estilo BJJ"', price: 90.00, imageUrl: 'https://picsum.photos/seed/bjj-tshirt-style/400/400', category: 'Vestuário' },

  // Acessórios
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
  {
    id: 1,
    name: 'Plano Mensal',
    price: 150,
    duration: 'mês',
    total: null,
    features: ['Acesso ilimitado às aulas', 'Todas as modalidades inclusas', 'Sem taxa de matrícula'],
    isBestValue: false,
  },
  {
    id: 2,
    name: 'Plano Trimestral',
    price: 135,
    duration: 'mês',
    total: 405,
    features: ['Acesso ilimitado às aulas', 'Todas as modalidades inclusas', 'Sem taxa de matrícula', 'Desconto de 10%'],
    isBestValue: false,
  },
  {
    id: 3,
    name: 'Plano Semestral',
    price: 120,
    duration: 'mês',
    total: 720,
    features: ['Acesso ilimitado às aulas', 'Todas as modalidades inclusas', 'Sem taxa de matrícula', 'Desconto de 20%'],
    isBestValue: true,
  },
];

const initialTatameAreas: TatameArea[] = [
  { 
    id: 'tatame-principal', 
    name: 'Tatame Principal', 
    timeSlots: [
      '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
      '13:00 - 14:00', '14:00 - 15:00',
    ] 
  },
  { 
    id: 'area-sparring', 
    name: 'Área de Sparring', 
    timeSlots: [
      '08:00 - 09:00', '09:00 - 10:00', '10:00 - 11:00', '11:00 - 12:00',
      '13:00 - 14:00', '14:00 - 15:00',
    ]
  },
];

const initialSiteSettings: SiteSettings = {
  academyName: 'BJJAgenda',
  instagramUrl: '#',
  facebookUrl: '#',
  xUrl: '#',
  pixKey: 'chave-pix-aleatoria-exemplo@banco.com',
  paymentInstructions: 'Após o pagamento, por favor envie o comprovante para o nosso WhatsApp: (XX) 9XXXX-XXXX para confirmarmos seu pedido.',
  logoUrl: null,
  loginImageUrl: null,
};

const initialUsers: User[] = [
    { id: 1, email: 'admin@bjj.com', name: 'Administrador', role: 'admin', paymentDueDate: null },
    { id: 2, email: 'user@bjj.com', name: 'Aluno Exemplo', role: 'user', paymentDueDate: '2024-08-15' },
];

const initialCredentials: { [email: string]: string } = {
    'admin@bjj.com': 'admin123',
    'user@bjj.com': 'user123',
};


const viewTitles: Record<View, string> = {
  dashboard: 'Dashboard',
  schedule: 'Agenda de Aulas',
  announcements: 'Mural de Avisos',
  store: 'Loja da Academia',
  booking: 'Reservar Tatame',
  promotions: 'Promoções e Planos',
  settings: 'Configurações da Academia',
  userManagement: 'Gerenciamento de Usuários',
};

const PageHeader: React.FC<{ 
  currentView: View; 
  cartItemCount: number;
  onCartClick: () => void;
  user: User | null;
  onMobileMenuOpen: () => void;
}> = ({ currentView, cartItemCount, onCartClick, user, onMobileMenuOpen }) => {
  const title = viewTitles[currentView] || 'Dashboard';

  return (
    <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
      <div className="px-6 sm:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <button
              onClick={onMobileMenuOpen}
              className="lg:hidden text-gray-300 hover:text-white"
              aria-label="Abrir menu"
            >
              <MenuIcon />
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-100">
              {title}
            </h1>
        </div>
        <div className="flex items-center">
          {currentView === 'store' && user?.role !== 'admin' && (
            <button 
              onClick={onCartClick} 
              className="relative p-2 text-gray-300 hover:text-white transition-colors"
              aria-label={`Ver carrinho de compras com ${cartItemCount} itens`}
            >
              <ShoppingCartIcon />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white">
                  {cartItemCount}
                </span>
              )}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};


const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  // FIX: Explicitly set the type to boolean to prevent incorrect type inference from getInitialState.
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => getInitialState('bjjagenda-sidebarCollapsed', false));
  // FIX: Explicitly set the type to boolean to prevent incorrect type inference.
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Persisted state
  const [users, setUsers] = useState<User[]>(() => getInitialState('bjjagenda-users', initialUsers));
  const [credentials, setCredentials] = useState<{ [email: string]: string }>(() => getInitialState('bjjagenda-credentials', initialCredentials));
  const [classes, setClasses] = useState<ClassSession[]>(() => getInitialState('bjjagenda-classes', initialClasses));
  const [products, setProducts] = useState<Product[]>(() => getInitialState('bjjagenda-products', initialProducts));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => getInitialState('bjjagenda-announcements', mockAnnouncements));
  const [bookings, setBookings] = useState<Booking[]>(() => getInitialState('bjjagenda-bookings', []));
  const [promotions, setPromotions] = useState<PromotionPlan[]>(() => getInitialState('bjjagenda-promotions', initialPromotions));
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => getInitialState('bjjagenda-siteSettings', initialSiteSettings));
  const [tatameAreas, setTatameAreas] = useState<TatameArea[]>(() => getInitialState('bjjagenda-tatameAreas', initialTatameAreas));
  const [cart, setCart] = useState<CartItem[]>(() => getInitialState('bjjagenda-cart', []));

  // Save state changes to localStorage
  useEffect(() => { localStorage.setItem('bjjagenda-users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('bjjagenda-credentials', JSON.stringify(credentials)); }, [credentials]);
  useEffect(() => { localStorage.setItem('bjjagenda-classes', JSON.stringify(classes)); }, [classes]);
  useEffect(() => { localStorage.setItem('bjjagenda-products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('bjjagenda-announcements', JSON.stringify(announcements)); }, [announcements]);
  useEffect(() => { localStorage.setItem('bjjagenda-bookings', JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem('bjjagenda-promotions', JSON.stringify(promotions)); }, [promotions]);
  useEffect(() => { localStorage.setItem('bjjagenda-siteSettings', JSON.stringify(siteSettings)); }, [siteSettings]);
  useEffect(() => { localStorage.setItem('bjjagenda-tatameAreas', JSON.stringify(tatameAreas)); }, [tatameAreas]);
  useEffect(() => { localStorage.setItem('bjjagenda-cart', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('bjjagenda-sidebarCollapsed', JSON.stringify(isSidebarCollapsed)); }, [isSidebarCollapsed]);


  const handleLogin = (userCredentials: { email: string, pass: string }): boolean => {
    const user = users.find(u => u.email === userCredentials.email);
    const correctPassword = credentials[userCredentials.email];

    if (user && userCredentials.pass === correctPassword) {
      setCurrentUser(user);
      setCurrentView('dashboard');
      return true;
    }
    return false;
  };

  const handleRegister = (newUserData: { email: string; pass: string; name: string }): User | null => {
    if (users.some(u => u.email === newUserData.email)) {
      alert('Este e-mail já está cadastrado.');
      return null;
    }
    const today = new Date();
    today.setDate(today.getDate() + 30); // Set due date 30 days from now
    const dueDate = today.toISOString().split('T')[0];

    const newUser: User = {
      id: Date.now(),
      email: newUserData.email,
      name: newUserData.name,
      role: 'user',
      paymentDueDate: dueDate,
    };
    setUsers(prev => [...prev, newUser]);
    setCredentials(prev => ({ ...prev, [newUserData.email]: newUserData.pass }));

    // Automatically log in the new user
    setCurrentUser(newUser);
    setCurrentView('dashboard');
    return newUser;
  };

  // User Management by Admin
  const handleCreateUser = (newUserData: { email: string; pass: string; role: 'admin' | 'user'; name: string; paymentDueDate: string | null }): boolean => {
    if (users.some(u => u.email === newUserData.email)) {
      alert('Este e-mail já está cadastrado.');
      return false;
    }
    const newUser: User = {
      id: Date.now(),
      email: newUserData.email,
      name: newUserData.name,
      role: newUserData.role,
      paymentDueDate: newUserData.role === 'admin' ? null : newUserData.paymentDueDate,
    };
    setUsers(prev => [...prev, newUser]);
    setCredentials(prev => ({ ...prev, [newUserData.email]: newUserData.pass }));
    return true;
  };
  
  const handleUpdateUser = (updatedUserData: User & { pass?: string }) => {
      const { pass, ...userToUpdate } = updatedUserData;
      const originalUser = users.find(u => u.id === userToUpdate.id);
      if (!originalUser) return;
  
      // Update user details
      setUsers(prev => prev.map(u => u.id === userToUpdate.id ? { ...originalUser, ...userToUpdate } : u));
      
      // Update password if a new one was provided
      if (pass && pass.length > 0) {
          setCredentials(prev => ({ ...prev, [originalUser.email]: pass }));
      }
  };

  const handleDeleteUser = (userId: number) => {
    if (userId === currentUser?.id) {
        alert('Você não pode excluir sua própria conta.');
        return;
    }
    const userToDelete = users.find(u => u.id === userId);
    if(userToDelete) {
        setUsers(prevUsers => prevUsers.filter(u => u.id !== userId));
        setCredentials(prevCreds => {
            const newCreds = { ...prevCreds };
            delete newCreds[userToDelete.email];
            return newCreds;
        });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // Class Management
  const handleAddClass = (newClass: Omit<ClassSession, 'id'>) => {
    setClasses(prev => [
      ...prev,
      { ...newClass, id: Date.now() } // Simple unique ID generation
    ]);
  };

  const handleUpdateClass = (updatedClass: ClassSession) => {
    setClasses(prev => prev.map(c => c.id === updatedClass.id ? updatedClass : c));
  };
  
  const handleDeleteClass = (classId: number) => {
    try {
      const classExists = classes.some(c => c.id === classId);
      if (!classExists) {
        throw new Error("Aula não encontrada para exclusão.");
      }
      setClasses(prev => prev.filter(c => c.id !== classId));
      alert("Agendamento excluído com sucesso.");
    } catch (error) {
      console.error("Erro ao excluir aula:", error);
      alert("Erro ao excluir agendamento. Tente novamente.");
    }
  };
  
  // Product Management
  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    setProducts(prev => [
        ...prev,
        { ...newProduct, id: Date.now() }
    ]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleDeleteProduct = (productId: number) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  // Cart Management
  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateCartQuantity = (productId: number, newQuantity: number) => {
    setCart(prevCart => {
      if (newQuantity <= 0) {
        return prevCart.filter(item => item.id !== productId);
      }
      return prevCart.map(item =>
        item.id === productId ? { ...item, quantity: newQuantity } : item
      );
    });
  };
  
  const handleRemoveFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  // Announcement Management
  const handleAddAnnouncement = (newAnnouncementData: { title: string; content: string }) => {
    const date = new Date();
    const day = date.getDate();
    const monthNames = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    const newAnnouncement: Announcement = {
      id: Date.now(),
      title: newAnnouncementData.title,
      content: newAnnouncementData.content,
      date: `${day} de ${month}, ${year}`
    };
    
    setAnnouncements(prev => [newAnnouncement, ...prev]);
  };

  const handleDeleteAnnouncement = (announcementId: number) => {
    setAnnouncements(prev => prev.filter(a => a.id !== announcementId));
  };
  
  // Booking Management
  const handleBookTatame = (bookingDetails: Omit<Booking, 'id' | 'userId' | 'userEmail' | 'status'>) => {
      if (!currentUser) return;
      
      const newBooking: Booking = {
          ...bookingDetails,
          id: `${bookingDetails.tatameId}-${bookingDetails.date}-${bookingDetails.timeSlot}`,
          userId: currentUser.id,
          userEmail: currentUser.email,
          status: 'pending',
      };

      if (bookings.some(b => b.id === newBooking.id)) {
          alert('Este horário já foi solicitado ou reservado.');
          return;
      }

      setBookings(prev => [...prev, newBooking]);
      alert('Sua solicitação de reserva foi enviada para aprovação do administrador.');
  };

  const handleCancelBooking = (bookingId: string) => {
    try {
        const bookingExists = bookings.some(b => b.id === bookingId);
        if (!bookingExists) {
            throw new Error("Reserva não encontrada para cancelamento.");
        }
        setBookings(prev => prev.filter(b => b.id !== bookingId));
        alert("Reserva cancelada com sucesso.");
    } catch (error) {
        console.error("Erro ao cancelar reserva:", error);
        alert('Erro ao cancelar reserva. Tente novamente.');
    }
  };

  const handleUpdateBookingStatus = (bookingId: string, action: 'confirm' | 'deny') => {
    if (action === 'deny') {
      setBookings(prev => prev.filter(b => b.id !== bookingId));
    } else { // 'confirm'
      setBookings(prev => 
        prev.map(b => (b.id === bookingId ? { ...b, status: 'confirmed' } : b))
      );
    }
  };

  const handleUpdateTatameAreas = (updatedAreas: TatameArea[]) => {
    setTatameAreas(updatedAreas);
  };
  
  const handleAddTatameArea = (areaData: Omit<TatameArea, 'id'>) => {
    const newArea: TatameArea = {
      ...areaData,
      id: `${areaData.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
    };
    setTatameAreas(prev => [...prev, newArea]);
  };
  
  // Promotions Management
  const handleAddPromotion = (newPlan: Omit<PromotionPlan, 'id'>) => {
    setPromotions(prev => [...prev, { ...newPlan, id: Date.now() }]);
  };

  const handleUpdatePromotion = (updatedPlan: PromotionPlan) => {
    setPromotions(prev => prev.map(p => p.id === updatedPlan.id ? updatedPlan : p));
  };

  const handleDeletePromotion = (planId: number) => {
    setPromotions(prev => prev.filter(p => p.id !== planId));
  };

  // Settings Management
  const handleUpdateSiteSettings = (newSettings: SiteSettings) => {
    setSiteSettings(newSettings);
    alert('Configurações salvas com sucesso!');
    setCurrentView('dashboard');
  };

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView 
                  user={currentUser!}
                  classes={classes}
                  announcements={announcements}
                  bookings={bookings}
                  setCurrentView={setCurrentView}
                />;
      case 'schedule':
        return <ScheduleView 
                  user={currentUser!}
                  classes={classes}
                  onAddClass={handleAddClass}
                  onUpdateClass={handleUpdateClass}
                  onDeleteClass={handleDeleteClass}
                  siteSettings={siteSettings}
                />;
      case 'announcements':
        return <AnnouncementsView 
                  user={currentUser!}
                  announcements={announcements} 
                  onAddAnnouncement={handleAddAnnouncement}
                  onDeleteAnnouncement={handleDeleteAnnouncement}
                />;
      case 'store':
        return <StoreView 
                  user={currentUser!}
                  products={products}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onAddToCart={handleAddToCart}
                />;
      case 'booking':
        return <BookingView 
                  user={currentUser!}
                  bookings={bookings}
                  tatameAreas={tatameAreas}
                  onBookTatame={handleBookTatame}
                  onCancelBooking={handleCancelBooking}
                  onUpdateBookingStatus={handleUpdateBookingStatus}
                  onUpdateTatameAreas={handleUpdateTatameAreas}
                  onAddTatameArea={handleAddTatameArea}
                />;
      case 'promotions':
        return <PromotionsView 
                  user={currentUser!}
                  plans={promotions}
                  siteSettings={siteSettings}
                  onAddPlan={handleAddPromotion}
                  onUpdatePlan={handleUpdatePromotion}
                  onDeletePlan={handleDeletePromotion}
                />;
      case 'settings':
        return <SiteSettingsView
                  currentSettings={siteSettings}
                  onSave={handleUpdateSiteSettings}
                />;
      case 'userManagement':
        return <UserManagementView
                  users={users}
                  currentUser={currentUser!}
                  onCreateUser={handleCreateUser}
                  onUpdateUser={handleUpdateUser}
                  onDeleteUser={handleDeleteUser}
                />;
      default:
        return <DashboardView 
                  user={currentUser!}
                  classes={classes}
                  announcements={announcements}
                  bookings={bookings}
                  setCurrentView={setCurrentView}
                />;
    }
  };

  if (!currentUser) {
    return <LoginView 
            onLogin={handleLogin} 
            onRegister={handleRegister} 
            siteSettings={siteSettings} 
          />;
  }
  
  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Sidebar 
        user={currentUser}
        currentView={currentView} 
        setCurrentView={setCurrentView} 
        onLogout={handleLogout}
        siteSettings={siteSettings}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(prev => !prev)}
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />
      <div className={`flex-1 flex flex-col max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        <PageHeader 
          currentView={currentView} 
          cartItemCount={cartItemCount}
          onCartClick={() => setIsCartOpen(true)}
          user={currentUser}
          onMobileMenuOpen={() => setIsMobileMenuOpen(true)}
        />
        <main className="flex-grow p-4 sm:p-6 lg:p-8">
          {renderView()}
        </main>
        <Footer siteSettings={siteSettings} />
      </div>
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveFromCart}
        onClearCart={handleClearCart}
        onProceedToCheckout={handleProceedToCheckout}
      />
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        cartItems={cart}
        settings={siteSettings}
      />
    </div>
  );
};

export default App;
