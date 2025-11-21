import React, { useMemo } from 'react';
import { type ClassSession, type User } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { BellIcon } from './icons/BellIcon';
import { AlertTriangleIcon } from './icons/AlertTriangleIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { CashIcon } from './icons/CashIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { useAppStore } from '../store';

const daysOrder = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const getUpcomingClasses = (classes: ClassSession[]): ClassSession[] => {
  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7; // 0=Monday, 6=Sunday
  const currentTime = now.getHours() * 100 + now.getMinutes();

  const sortedClasses = [...classes].sort((a, b) => {
    const dayA = daysOrder.indexOf(a.day);
    const dayB = daysOrder.indexOf(b.day);
    const timeA = parseInt(a.time.replace(':', '').split('-')[0]);
    const timeB = parseInt(b.time.replace(':', '').split('-')[0]);

    if (dayA !== dayB) return dayA - dayB;
    return timeA - timeB;
  });

  const upcoming = sortedClasses.filter(c => {
    const classDayIndex = daysOrder.indexOf(c.day);
    const classStartTime = parseInt(c.time.replace(':', '').split('-')[0]);
    
    if (classDayIndex > dayIndex) return true;
    if (classDayIndex === dayIndex && classStartTime > currentTime) return true;
    return false;
  });

  if (upcoming.length === 0) {
    return sortedClasses.slice(0, 3);
  }
  
  return upcoming.slice(0, 3);
};

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; description?: string }> = ({ title, value, icon, description }) => (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-5">
        <div className="flex items-center space-x-4">
            <div className="bg-gray-900/50 p-3 rounded-lg flex-shrink-0">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-400">{title}</p>
                <p className="text-2xl font-bold text-gray-100">{value}</p>
            </div>
        </div>
        {description && <p className="text-xs text-gray-500 mt-2">{description}</p>}
    </div>
);

const UserDashboard: React.FC<{ user: User }> = ({ user }) => {
  const { classes, announcements, bookings, setCurrentView } = useAppStore(state => ({
    classes: state.classes,
    announcements: state.announcements,
    bookings: state.bookings,
    setCurrentView: state.setCurrentView,
  }));

  const upcomingClasses = getUpcomingClasses(classes);
  const latestAnnouncement = announcements[0];
  const myUpcomingBookings = bookings.filter(b => b.userId === user.id && new Date(b.date + 'T00:00:00') >= new Date(new Date().toDateString())).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const bookingsThisMonth = bookings.filter(b => b.userId === user.id && new Date(b.date).getMonth() === new Date().getMonth()).length;

  const renderPaymentReminder = () => {
    if (user.role !== 'user' || !user.paymentDueDate) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(user.paymentDueDate + 'T00:00:00');
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    let reminder;
    if (diffDays < 0) {
      reminder = { message: `Sua mensalidade venceu há ${Math.abs(diffDays)} dia(s).`, color: 'red', buttonText: 'Renovar Agora' };
    } else if (diffDays <= 3) {
      reminder = { message: diffDays === 0 ? 'Sua mensalidade vence hoje!' : `Sua mensalidade vence em ${diffDays} dia(s).`, color: 'yellow', buttonText: 'Renovar Agora' };
    } else {
      reminder = { message: `Próximo vencimento em ${diffDays} dias.`, color: 'green', buttonText: 'Ver Planos' };
    }
    const colors = {
      red: { container: "bg-red-900/50 border-red-700 text-red-200", button: "bg-red-600 text-white hover:bg-red-700", icon: <AlertTriangleIcon className="text-red-400 h-6 w-6" /> },
      yellow: { container: "bg-yellow-900/50 border-yellow-700 text-yellow-200", button: "bg-yellow-500 text-yellow-900 hover:bg-yellow-600", icon: <AlertTriangleIcon className="text-yellow-400 h-6 w-6" /> },
      green: { container: "bg-green-900/50 border-green-700 text-green-200", button: "bg-green-600 text-white hover:bg-green-700", icon: <CheckCircleIcon className="text-green-400 h-6 w-6" /> }
    };
    const currentColors = colors[reminder.color];
    return (
      <div className={`border rounded-xl p-4 flex items-center justify-between space-x-4 ${currentColors.container}`}>
        <div className="flex items-center space-x-3">{currentColors.icon}<p className="font-medium">{reminder.message}</p></div>
        <button onClick={() => setCurrentView('promotions')} className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${currentColors.button}`}>{reminder.buttonText}</button>
      </div>
    );
  };
  
  return (
    <div className="space-y-8">
      {renderPaymentReminder()}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-100 mb-3">Sua Próxima Reserva</h3>
            {myUpcomingBookings.length > 0 ? (
                <div>
                    <p className="text-2xl font-semibold text-red-500">{myUpcomingBookings[0].tatameName}</p>
                    <p className="text-gray-300 font-mono mt-1">{myUpcomingBookings[0].timeSlot}</p>
                    <p className="text-sm text-gray-400">{new Date(myUpcomingBookings[0].date + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
            ) : <p className="text-gray-400">Nenhuma reserva futura.</p>}
            <button onClick={() => setCurrentView('booking')} className="mt-4 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors">Ver todas &rarr;</button>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 text-center flex flex-col justify-center">
            <p className="text-5xl font-bold text-gray-100">{bookingsThisMonth}</p>
            <p className="text-sm font-medium text-gray-400 mt-1">Reservas de Tatame este Mês</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4"><BellIcon /><h2 className="text-lg font-bold text-gray-100">Último Aviso</h2></div>
            {latestAnnouncement ? (<div>
                <h3 className="font-semibold text-gray-100 truncate">{latestAnnouncement.title}</h3>
                <p className="text-gray-300 mt-2 text-sm line-clamp-2">{latestAnnouncement.content}</p>
                <button onClick={() => setCurrentView('announcements')} className="mt-3 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors">Ler mais &rarr;</button>
            </div>) : <p className="text-gray-400">Nenhum aviso recente.</p>}
          </div>
      </div>
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4"><ClockIcon /><h2 className="text-xl font-bold text-gray-100">Próximas Aulas na Agenda</h2></div>
        <div className="space-y-4">
            {upcomingClasses.length > 0 ? (upcomingClasses.map(c => (
            <div key={c.id} className="bg-gray-900 border border-gray-700 p-4 rounded-lg flex justify-between items-center">
                <div>
                <p className="font-semibold text-gray-100">{c.name}</p>
                <p className="text-sm text-gray-400">{c.day}, {c.time}</p>
                </div>
                <span className="text-sm font-medium bg-red-900 text-red-300 px-3 py-1 rounded-full">{c.level}</span>
            </div>
            ))) : <p className="text-gray-400">Nenhuma aula encontrada para os próximos dias.</p>}
        </div>
        <button onClick={() => setCurrentView('schedule')} className="mt-6 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors">Ver agenda completa &rarr;</button>
      </div>
    </div>
  )
}

const AdminDashboard: React.FC = () => {
    const { users, financialTransactions, bookings, updateBookingStatus, setCurrentView } = useAppStore(state => ({
        users: state.users,
        financialTransactions: state.financialTransactions,
        bookings: state.bookings,
        updateBookingStatus: state.updateBookingStatus,
        setCurrentView: state.setCurrentView,
    }));
    
    const stats = useMemo(() => {
        const studentUsers = users.filter(u => u.role === 'user');
        const activeStudents = studentUsers.length;
        
        let onTime = 0;
        let overdue = 0;
        const today = new Date();
        today.setHours(0,0,0,0);
        
        studentUsers.forEach(u => {
            if (u.paymentDueDate) {
                const dueDate = new Date(u.paymentDueDate + 'T00:00:00');
                if (dueDate < today) overdue++;
                else onTime++;
            }
        });

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = financialTransactions
            .filter(t => {
                const tDate = new Date(t.date + 'T00:00:00');
                return t.type === 'income' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
            })
            .reduce((sum, t) => sum + t.amount, 0);

        return { activeStudents, onTime, overdue, monthlyRevenue };
    }, [users, financialTransactions]);

    const pendingBookings = bookings.filter(b => b.status === 'pending');

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard title="Alunos Ativos" value={stats.activeStudents} icon={<UsersIcon className="text-red-500" />} />
                <StatCard title="Pagamentos em Dia" value={`${stats.onTime} / ${stats.activeStudents}`} description={`${stats.overdue} vencido(s)`} icon={<CreditCardIcon className="text-red-500" />} />
                <StatCard title="Receita do Mês" value={`R$ ${stats.monthlyRevenue.toFixed(2)}`} icon={<CashIcon className="text-red-500" />} />
            </div>

            <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                <h2 className="text-xl font-bold text-gray-100 mb-4">Solicitações de Reserva Pendentes</h2>
                {pendingBookings.length > 0 ? (
                    <div className="space-y-3">
                        {pendingBookings.map(b => (
                            <div key={b.id} className="bg-gray-900 p-3 rounded-lg flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="font-semibold text-gray-100">{b.tatameName} - {b.timeSlot}</p>
                                    <p className="text-sm text-gray-400">{b.userEmail} - {new Date(b.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={() => updateBookingStatus(b.id!, 'deny')} className="p-2 text-red-500 hover:bg-red-900/50 rounded-full transition-colors"><XCircleIcon /></button>
                                    <button onClick={() => updateBookingStatus(b.id!, 'confirm')} className="p-2 text-green-500 hover:bg-green-900/50 rounded-full transition-colors"><CheckCircleIcon /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-400">Nenhuma solicitação pendente no momento.</p>
                )}
                 <button onClick={() => setCurrentView('booking')} className="mt-6 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors">
                    Gerenciar todas as reservas &rarr;
                </button>
            </div>
        </div>
    )
}

const DashboardView: React.FC = () => {
  const user = useAppStore(state => state.currentUser!);
  const isAdminOrMestre = user.role === 'admin' || user.role === 'mestre';

  return (
    <div className="animate-fade-in-up space-y-6">
        <div>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-100">Bem-vindo(a) de volta, <span className="text-red-500">{user.name}</span>!</h1>
            <p className="mt-2 text-lg text-gray-400">
                {isAdminOrMestre ? "Veja um resumo do desempenho da sua academia." : "Aqui está um resumo da sua semana."}
            </p>
        </div>
        
        {isAdminOrMestre ? <AdminDashboard /> : <UserDashboard user={user} />}
    </div>
  );
};

export default DashboardView;