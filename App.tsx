import React, { useEffect, useMemo, useState } from 'react';
import Sidebar from './components/Header';
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
import UserDetailView from './components/UserDetailView';
import FinancialView from './components/FinancialView';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import { type View } from './types';
import { ShoppingCartIcon } from './components/icons/ShoppingCartIcon';
import { MenuIcon } from './components/icons/MenuIcon';
import { useAppStore } from './store';
import { Toaster } from 'react-hot-toast';
import { SpinnerIcon } from './components/icons/SpinnerIcon';


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
  userDetail: 'Detalhes do Usuário'
};

const VIEW_COMPONENTS: Record<View, React.ReactElement> = {
  dashboard: <DashboardView />,
  schedule: <ScheduleView />,
  announcements: <AnnouncementsView />,
  store: <StoreView />,
  booking: <BookingView />,
  promotions: <PromotionsView />,
  settings: <SiteSettingsView />,
  userManagement: <UserManagementView />,
  userDetail: <UserDetailView />,
  financial: <FinancialView />,
};

const PageHeader: React.FC = () => {
  const currentView = useAppStore(state => state.currentView);
  const cart = useAppStore(state => state.cart);
  const currentUser = useAppStore(state => state.currentUser);
  const openMobileMenu = useAppStore(state => state.openMobileMenu);
  const openCart = useAppStore(state => state.openCart);

  const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const title = viewTitles[currentView] || 'Dashboard';

  return (
    <header className="bg-gray-900/80 backdrop-blur-lg border-b border-gray-700 sticky top-0 z-10">
      <div className="px-6 sm:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-4">
            <button
              onClick={openMobileMenu}
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
          {currentView === 'store' && currentUser?.role !== 'admin' && (
            <button 
              onClick={openCart} 
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
  const currentUser = useAppStore(state => state.currentUser);
  const currentView = useAppStore(state => state.currentView);
  const isSidebarCollapsed = useAppStore(state => state.isSidebarCollapsed);
  const initializeApp = useAppStore(state => state.initializeApp);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initializeApp();
      setIsLoading(false);
    };
    init();
  }, [initializeApp]);

  const memoizedView = useMemo(() => {
    return VIEW_COMPONENTS[currentView] || <DashboardView />;
  }, [currentView]);
  
  const renderLoadingScreen = () => (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="text-center">
            <SpinnerIcon className="h-12 w-12 text-red-500 mx-auto" />
            <p className="mt-4 text-lg text-gray-300">Carregando dados da academia...</p>
        </div>
    </div>
  );

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1F2937', // gray-800
            color: '#F9FAFB', // gray-50
            border: '1px solid #4B5563', // gray-600
          },
          success: {
            iconTheme: {
              primary: '#10B981', // green-500
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444', // red-500
              secondary: 'white',
            },
          },
        }}
      />
      {isLoading ? renderLoadingScreen() : !currentUser ? (
        <LoginView />
      ) : (
        <div className="flex min-h-screen bg-gray-900 text-gray-200 font-sans">
          <Sidebar />
          <div className={`flex-1 flex flex-col max-w-full overflow-x-hidden transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
            <PageHeader />
            <main className="flex-grow p-4 sm:p-6 lg:p-8">
              {memoizedView}
            </main>
            <Footer />
          </div>
          <CartModal />
          <CheckoutModal />
        </div>
      )}
    </>
  );
};

export default App;