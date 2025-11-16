



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
import FinancialView from './components/FinancialView';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import { type View, type Product, type User, type ClassSession, type Booking, type Announcement, type PromotionPlan, type SiteSettings, type TatameArea, type CartItem, type FinancialTransaction, type TransactionCategory } from './types';
import { ShoppingCartIcon } from './components/icons/ShoppingCartIcon';
import { MenuIcon } from './components/icons/MenuIcon';
import { db } from './db';


const viewTitles: Record<View, string> = {
  dashboard: 'Dashboard',
  schedule: 'Agenda de Aulas',
  announcements: 'Mural de Avisos',
  store: 'Loja da Academia',
  booking: 'Reservar Tatame',
  promotions: 'Promoções e Planos',
  settings: 'Configurações da Academia',
  userManagement: 'Gerenciamento de Usuários',
  financial: 'Financeiro',
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);

  // Persisted state
  const [users, setUsers] = useState<User[]>(() => db.users.getAll());
  const [credentials, setCredentials] = useState<{ [email: string]: string }>(() => db.credentials.getAll());
  const [classes, setClasses] = useState<ClassSession[]>(() => db.classes.getAll());
  const [products, setProducts] = useState<Product[]>(() => db.products.getAll());
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => db.announcements.getAll());
  const [bookings, setBookings] = useState<Booking[]>(() => db.bookings.getAll());
  const [promotions, setPromotions] = useState<PromotionPlan[]>(() => db.promotions.getAll());
  const [siteSettings, setSiteSettings] = useState<SiteSettings>(() => db.siteSettings.getAll());
  const [tatameAreas, setTatameAreas] = useState<TatameArea[]>(() => db.tatameAreas.getAll());
  const [cart, setCart] = useState<CartItem[]>(() => db.cart.getAll());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => db.sidebar.isCollapsed());
  const [financialTransactions, setFinancialTransactions] = useState<FinancialTransaction[]>(() => db.financialTransactions.getAll());
  const [financialCategories, setFinancialCategories] = useState<TransactionCategory[]>(() => db.financialCategories.getAll());

  // Save state changes to localStorage
  useEffect(() => { db.users.saveAll(users); }, [users]);
  useEffect(() => { db.credentials.saveAll(credentials); }, [credentials]);
  useEffect(() => { db.classes.saveAll(classes); }, [classes]);
  useEffect(() => { db.products.saveAll(products); }, [products]);
  useEffect(() => { db.announcements.saveAll(announcements); }, [announcements]);
  useEffect(() => { db.bookings.saveAll(bookings); }, [bookings]);
  useEffect(() => { db.promotions.saveAll(promotions); }, [promotions]);
  useEffect(() => { db.siteSettings.saveAll(siteSettings); }, [siteSettings]);
  useEffect(() => { db.tatameAreas.saveAll(tatameAreas); }, [tatameAreas]);
  useEffect(() => { db.cart.saveAll(cart); }, [cart]);
  useEffect(() => { db.sidebar.saveCollapsed(isSidebarCollapsed); }, [isSidebarCollapsed]);
  useEffect(() => { db.financialTransactions.saveAll(financialTransactions); }, [financialTransactions]);
  useEffect(() => { db.financialCategories.saveAll(financialCategories); }, [financialCategories]);


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
  
  const handleResetPassword = (email: string, newPass: string): boolean => {
    const userExists = users.some(u => u.email === email);
    if (userExists && credentials[email]) {
      setCredentials(prev => ({ ...prev, [email]: newPass }));
      return true;
    }
    return false;
  };

  // User Management by Admin
  const handleCreateUser = (newUserData: { email: string; pass: string; role: 'admin' | 'user' | 'mestre'; name: string; paymentDueDate: string | null }): boolean => {
    if (users.some(u => u.email === newUserData.email)) {
      alert('Este e-mail já está cadastrado.');
      return false;
    }
    const newUser: User = {
      id: Date.now(),
      email: newUserData.email,
      name: newUserData.name,
      role: newUserData.role,
      paymentDueDate: newUserData.role === 'user' ? newUserData.paymentDueDate : null,
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
  
  // Financial Management
  const handleAddTransaction = (newTransaction: Omit<FinancialTransaction, 'id'>) => {
    setFinancialTransactions(prev => [...prev, { ...newTransaction, id: Date.now() }]);
  };
  
  const handleDeleteTransaction = (transactionId: number) => {
    setFinancialTransactions(prev => prev.filter(t => t.id !== transactionId));
  };

  const handleAddCategory = (newCategory: Omit<TransactionCategory, 'id'>) => {
    setFinancialCategories(prev => [...prev, { ...newCategory, id: Date.now() }]);
  };

  const handleUpdateCategory = (updatedCategory: TransactionCategory) => {
    setFinancialCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  };
  
  const handleDeleteCategory = (categoryId: number) => {
    if (financialTransactions.some(t => t.categoryId === categoryId)) {
        alert('Não é possível excluir uma categoria que já está em uso por uma transação.');
        return;
    }
    setFinancialCategories(prev => prev.filter(c => c.id !== categoryId));
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
      case 'financial':
        return <FinancialView
                  users={users}
                  transactions={financialTransactions}
                  categories={financialCategories}
                  onAddTransaction={handleAddTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onAddCategory={handleAddCategory}
                  onUpdateCategory={handleUpdateCategory}
                  onDeleteCategory={handleDeleteCategory}
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
            siteSettings={siteSettings}
            users={users}
            onResetPassword={handleResetPassword}
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