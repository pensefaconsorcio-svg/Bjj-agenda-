
import React from 'react';
import { type View, type User, type SiteSettings } from '../types';
import { HomeIcon } from './icons/HomeIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { MegaphoneIcon } from './icons/MegaphoneIcon';
import { TatameIcon } from './icons/TatameIcon';
import { StoreIcon } from './icons/StoreIcon';
import { LogoutIcon } from './icons/LogoutIcon';
import { TagIcon } from './icons/TagIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { UsersIcon } from './icons/UsersIcon';
import { FinancialIcon } from './icons/FinancialIcon';
import { ChevronDoubleLeftIcon } from './icons/ChevronDoubleLeftIcon';

interface SidebarProps {
  currentView: View;
  setCurrentView: (view: View) => void;
  user: User;
  onLogout: () => void;
  siteSettings: SiteSettings;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
}

const NavItem: React.FC<{
  view: View;
  currentView: View;
  setCurrentView: (view: View) => void;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
}> = ({ view, currentView, setCurrentView, icon, label, isCollapsed }) => {
  const isActive = currentView === view;
  return (
    <button
      onClick={() => setCurrentView(view)}
      className={`flex items-center w-full space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
        isActive
          ? 'bg-red-600 text-white shadow-sm'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      } ${isCollapsed ? 'justify-center' : ''}`}
      title={isCollapsed ? label : ''}
    >
      {icon}
      <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ 
  currentView, setCurrentView, user, onLogout, siteSettings, 
  isCollapsed, onToggleCollapse, isMobileOpen, onCloseMobile 
}) => {
  const sidebarContent = (
    <div className="flex flex-col h-full bg-gray-800 border-r border-gray-700 p-4">
      <div 
        className={`flex-shrink-0 flex items-center justify-start mb-8 h-12 cursor-pointer transition-all duration-300 ${isCollapsed ? 'justify-center' : ''}`} 
        onClick={() => setCurrentView('dashboard')}
      >
        {siteSettings.logoUrl ? (
          <img src={siteSettings.logoUrl} alt={siteSettings.academyName} className={`max-h-full transition-all duration-300 ${isCollapsed ? 'w-auto' : 'w-auto mr-3'}`} />
        ) : (
          !isCollapsed && <div className="w-8 h-8 mr-3 bg-red-500 rounded-md"></div> // Placeholder
        )}
        <span className={`font-bold text-xl text-white truncate transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
          {siteSettings.academyName}
        </span>
      </div>

      <nav className="flex-1 space-y-2">
        <NavItem view="dashboard" currentView={currentView} setCurrentView={setCurrentView} icon={<HomeIcon />} label="Dashboard" isCollapsed={isCollapsed} />
        <NavItem view="schedule" currentView={currentView} setCurrentView={setCurrentView} icon={<CalendarIcon />} label="Agenda" isCollapsed={isCollapsed} />
        <NavItem view="announcements" currentView={currentView} setCurrentView={setCurrentView} icon={<MegaphoneIcon />} label="Avisos" isCollapsed={isCollapsed} />
        <NavItem view="booking" currentView={currentView} setCurrentView={setCurrentView} icon={<TatameIcon />} label="Reservar Tatame" isCollapsed={isCollapsed} />
        <NavItem view="store" currentView={currentView} setCurrentView={setCurrentView} icon={<StoreIcon />} label="Loja" isCollapsed={isCollapsed} />
        <NavItem view="promotions" currentView={currentView} setCurrentView={setCurrentView} icon={<TagIcon />} label="Promoções" isCollapsed={isCollapsed} />
        {(user.role === 'admin' || user.role === 'mestre') && (
          <NavItem view="userManagement" currentView={currentView} setCurrentView={setCurrentView} icon={<UsersIcon />} label="Usuários" isCollapsed={isCollapsed} />
        )}
         {user.role === 'mestre' && (
          <NavItem view="financial" currentView={currentView} setCurrentView={setCurrentView} icon={<FinancialIcon />} label="Financeiro" isCollapsed={isCollapsed} />
        )}
        {user.role === 'admin' && (
          <NavItem view="settings" currentView={currentView} setCurrentView={setCurrentView} icon={<SettingsIcon />} label="Configurações" isCollapsed={isCollapsed} />
        )}
      </nav>

      <div className="mt-auto flex-shrink-0">
        <div className={`p-3 bg-gray-900 rounded-lg border border-gray-700 overflow-hidden ${isCollapsed ? 'p-2 text-center' : ''}`}>
           <span className={`text-gray-100 text-sm font-medium block truncate transition-opacity duration-200 ${isCollapsed ? 'opacity-0 h-0' : 'opacity-100'}`} title={user.email}>
              {user.email}
            </span>
            {user.role === 'admin' && <span className={`mt-1 text-xs font-semibold bg-red-200 text-red-800 px-2 py-0.5 rounded-full inline-block ${isCollapsed ? 'px-1' : ''}`}>{isCollapsed ? 'A' : 'Admin'}</span>}
            {user.role === 'mestre' && <span className={`mt-1 text-xs font-semibold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full inline-block ${isCollapsed ? 'px-1' : ''}`}>{isCollapsed ? 'M' : 'Mestre'}</span>}
        </div>
        <button 
          onClick={onLogout} 
          className={`mt-3 w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-900/50 hover:text-red-400 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Sair' : ''}
        >
          <LogoutIcon />
          <span className={`transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Sair</span>
        </button>
        <button
          onClick={onToggleCollapse}
          className={`hidden lg:flex w-full items-center justify-center mt-3 p-2 text-gray-400 hover:bg-gray-700 hover:text-white rounded-lg transition-colors`}
          title={isCollapsed ? "Expandir menu" : "Recolher menu"}
        >
          <ChevronDoubleLeftIcon className={`transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Sidebar (Overlay) */}
      <div 
        className={`fixed inset-y-0 left-0 z-40 w-64 transform transition-transform duration-300 ease-in-out lg:hidden ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {sidebarContent}
      </div>
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={onCloseMobile}></div>
      )}

      {/* Desktop Sidebar */}
      <aside 
        className={`hidden lg:block fixed inset-y-0 left-0 flex-shrink-0 transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'}`}
      >
         {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;