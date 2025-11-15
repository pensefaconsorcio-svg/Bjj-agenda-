import React from 'react';
import { type User, type ClassSession, type Announcement, type Booking, type View } from '../types';
import { ClockIcon } from './icons/ClockIcon';
import { BellIcon } from './icons/BellIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface DashboardViewProps {
  user: User;
  classes: ClassSession[];
  announcements: Announcement[];
  bookings: Booking[];
  setCurrentView: (view: View) => void;
}

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


const DashboardView: React.FC<DashboardViewProps> = ({ user, classes, announcements, bookings, setCurrentView }) => {
  const upcomingClasses = getUpcomingClasses(classes);
  const latestAnnouncement = announcements[0];
  const myUpcomingBookings = bookings.filter(b => b.userId === user.id && new Date(b.date) >= new Date(new Date().toDateString())).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="animate-fade-in-up space-y-10">
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-100">Bem-vindo(a) de volta, <span className="text-red-500">{user.email.split('@')[0]}</span>!</h1>
        <p className="mt-2 text-lg text-gray-400">Aqui está um resumo da sua semana na academia.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm">
          <div className="flex items-center space-x-3 mb-4">
            <ClockIcon />
            <h2 className="text-xl font-bold text-gray-100">Suas Próximas Aulas</h2>
          </div>
          <div className="space-y-4">
            {upcomingClasses.length > 0 ? (
              upcomingClasses.map(c => (
                <div key={c.id} className="bg-gray-900 border border-gray-700 p-4 rounded-lg flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-gray-100">{c.name}</p>
                    <p className="text-sm text-gray-400">{c.day}, {c.time}</p>
                  </div>
                  <span className="text-sm font-medium bg-red-900 text-red-300 px-3 py-1 rounded-full">{c.level}</span>
                </div>
              ))
            ) : (
              <p className="text-gray-400">Nenhuma aula encontrada para os próximos dias.</p>
            )}
          </div>
           <button onClick={() => setCurrentView('schedule')} className="mt-6 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors">
            Ver agenda completa &rarr;
          </button>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm">
           <div className="flex items-center space-x-3 mb-4">
            <BellIcon />
            <h2 className="text-xl font-bold text-gray-100">Último Aviso</h2>
          </div>
          {latestAnnouncement ? (
            <div>
              <h3 className="font-semibold text-gray-100">{latestAnnouncement.title}</h3>
              <p className="text-sm text-gray-400 mt-1">{latestAnnouncement.date}</p>
              <p className="text-gray-300 mt-3 text-sm line-clamp-4">{latestAnnouncement.content}</p>
              <button onClick={() => setCurrentView('announcements')} className="mt-4 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors">
                Ver todos os avisos &rarr;
              </button>
            </div>
          ) : (
            <p className="text-gray-400">Nenhum aviso recente.</p>
          )}
        </div>
        
        <div className="lg:col-span-3 bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm">
           <div className="flex items-center space-x-3 mb-4">
            <BookmarkIcon />
            <h2 className="text-xl font-bold text-gray-100">Minhas Reservas</h2>
          </div>
           <div className="space-y-3">
             {myUpcomingBookings.length > 0 ? (
                myUpcomingBookings.slice(0, 4).map(b => (
                  <div key={b.id} className="bg-gray-900 border border-gray-700 p-3 rounded-lg flex items-center justify-between">
                    <p className="font-medium text-gray-100">{b.tatameId}</p>
                    <div className="text-right">
                      <p className="text-sm text-gray-200 font-mono">{b.timeSlot}</p>
                      <p className="text-xs text-gray-400">{new Date(b.date + 'T00:00:00').toLocaleDateString('pt-BR')}</p>
                    </div>
                  </div>
                ))
             ) : (
               <p className="text-gray-400">Você não possui reservas futuras.</p>
             )}
           </div>
           <button onClick={() => setCurrentView('booking')} className="mt-6 text-sm font-semibold text-red-500 hover:text-red-400 transition-colors">
              Gerenciar reservas &rarr;
            </button>
        </div>

      </div>
    </div>
  );
};

export default DashboardView;