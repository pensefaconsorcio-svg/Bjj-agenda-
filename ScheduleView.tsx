import React, { useState, useCallback, useEffect } from 'react';
import toast from 'react-hot-toast';
import { type ClassSession } from '../types';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import Modal from './Modal';
import { CalendarPlusIcon } from './icons/CalendarPlusIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ExportIcon } from './icons/ExportIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import EmptyState from './EmptyState';
import { useAppStore } from '../store';

const daysOfWeek = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

const initialFormState: Omit<ClassSession, 'id'> = {
  day: 'Segunda',
  time: '',
  name: '',
  instructor: '',
  level: '',
};

const generateGoogleCalendarLink = (classSession: ClassSession, academyName: string): string => {
    const dayMap: { [key: string]: number } = {
        'Domingo': 0, 'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5, 'Sábado': 6
    };

    const targetDayIndex = dayMap[classSession.day];
    if (targetDayIndex === undefined) return '';

    const [startTimeStr, endTimeStr] = classSession.time.replace(/ /g, '').split('-');
    if (!startTimeStr || !endTimeStr) return '';
    const [startHour, startMinute] = startTimeStr.split(':').map(Number);
    const [endHour, endMinute] = endTimeStr.split(':').map(Number);

    const now = new Date();
    const todayIndex = now.getDay();
    
    let dayDifference = (targetDayIndex - todayIndex + 7) % 7;
    
    const eventDate = new Date(now);
    eventDate.setDate(now.getDate() + dayDifference);

    if (dayDifference === 0 && (now.getHours() > startHour || (now.getHours() === startHour && now.getMinutes() > startMinute))) {
        eventDate.setDate(eventDate.getDate() + 7);
    }

    const startDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), startHour, startMinute);
    const endDate = new Date(eventDate.getFullYear(), eventDate.getMonth(), eventDate.getDate(), endHour, endMinute);

    const toGoogleFormat = (date: Date) => date.toISOString().replace(/-|:|\.\d+/g, '');

    const title = encodeURIComponent(classSession.name);
    const details = encodeURIComponent(`Instrutor: ${classSession.instructor}\nNível: ${classSession.level}`);
    const location = encodeURIComponent(academyName);
    const dates = `${toGoogleFormat(startDate)}/${toGoogleFormat(endDate)}`;

    return `https://www.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
};


const ScheduleView: React.FC = () => {
  const { user, classes, siteSettings, addClass, updateClass, deleteClass } = useAppStore(state => ({
    user: state.currentUser!,
    classes: state.classes,
    siteSettings: state.siteSettings,
    addClass: state.addClass,
    updateClass: state.updateClass,
    deleteClass: state.deleteClass,
  }));
  
  const [bookedClasses, setBookedClasses] = useState<Set<number>>(new Set());
  const [selectedClass, setSelectedClass] = useState<ClassSession | null>(null);
  
  // Admin states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassSession | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [classToDelete, setClassToDelete] = useState<ClassSession | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isAdminOrMestre = user.role === 'admin' || user.role === 'mestre';

  useEffect(() => {
    if (editingClass) {
      setFormData(editingClass);
    } else {
      setFormData(initialFormState);
    }
  }, [editingClass]);

  const handleBookClick = useCallback((classSession: ClassSession) => {
    setSelectedClass(classSession);
  }, []);

  const confirmBooking = useCallback(() => {
    if (selectedClass) {
      setBookedClasses(prev => new Set(prev).add(selectedClass.id!));
      toast.success(`Aula "${selectedClass.name}" agendada com sucesso!`);
      setSelectedClass(null);
    }
  }, [selectedClass]);
  
  const handleCancelBooking = (classId: number) => {
    if (window.confirm('Tem certeza que deseja cancelar seu agendamento para esta aula?')) {
        setBookedClasses(prev => {
            const newSet = new Set(prev);
            newSet.delete(classId);
            return newSet;
        });
        toast.success("Agendamento cancelado.");
    }
  };

  const handleOpenAddModal = () => {
    setEditingClass(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (classSession: ClassSession) => {
    setEditingClass(classSession);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingClass(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingClass) {
        await updateClass({ ...formData, id: editingClass.id });
      } else {
        await addClass(formData);
      }
      handleCloseFormModal();
    } catch (error) {
        toast.error("Ocorreu um erro ao salvar a aula.");
    } finally {
      setIsSaving(false);
    }
  };
    
  const handleConfirmDelete = async () => {
    if (classToDelete) {
      await deleteClass(classToDelete.id!);
      setClassToDelete(null);
    }
  };

  const handleExportToCalendar = () => {
    const dayMap: { [key: string]: number } = {
        'Domingo': 0, 'Segunda': 1, 'Terça': 2, 'Quarta': 3, 'Quinta': 4, 'Sexta': 5, 'Sábado': 6
    };
    
    const getNextDateForDay = (dayOfWeek: string): Date => {
        const targetDayIndex = dayMap[dayOfWeek];
        const now = new Date();
        const todayIndex = now.getDay();
        let dayDifference = (targetDayIndex - todayIndex + 7) % 7;
        const nextDate = new Date(now);
        nextDate.setDate(now.getDate() + dayDifference);
        return nextDate;
    };

    const formatDateToICS = (date: Date, hours: number, minutes: number) => {
        const eventDate = new Date(date);
        eventDate.setHours(hours, minutes, 0, 0);
        return eventDate.toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z';
    };

    let icsString = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//BJJAgenda//NONSGML v1.0//EN',
        'CALSCALE:GREGORIAN',
    ].join('\r\n');

    classes.forEach(classSession => {
        const [startTimeStr, endTimeStr] = classSession.time.replace(/ /g, '').split('-');
        if (!startTimeStr || !endTimeStr) return;

        const [startHour, startMinute] = startTimeStr.split(':').map(Number);
        const [endHour, endMinute] = endTimeStr.split(':').map(Number);
        
        const eventDate = getNextDateForDay(classSession.day);
        const dtstart = formatDateToICS(eventDate, startHour, startMinute);
        const dtend = formatDateToICS(eventDate, endHour, endMinute);

        const event = [
            'BEGIN:VEVENT',
            `UID:${classSession.id}@${siteSettings.academy_name.replace(/\s/g, '')}.com`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '').slice(0, 15) + 'Z'}`,
            `DTSTART:${dtstart}`,
            `DTEND:${dtend}`,
            'RRULE:FREQ=WEEKLY',
            `SUMMARY:${classSession.name}`,
            `DESCRIPTION:Instrutor: ${classSession.instructor}\\nNível: ${classSession.level}`,
            `LOCATION:${siteSettings.academy_name}`,
            'END:VEVENT'
        ].join('\r\n');
        icsString += `\r\n${event}`;
    });

    icsString += '\r\nEND:VCALENDAR';
      
    const blob = new Blob([icsString], { type: 'text/calendar' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agenda-bjj.ics';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const classesByDay = daysOfWeek.map(day => ({
    day,
    classes: classes.filter(c => c.day === day),
  })).filter(d => d.classes.length > 0);

  const renderContent = () => {
      if (classes.length === 0 && isAdminOrMestre) {
          return (
              <EmptyState 
                  icon={<CalendarIcon />}
                  title="Nenhuma aula na agenda"
                  message="Sua agenda de aulas está vazia. Adicione a primeira aula para que seus alunos possam vê-la."
                  actionButton={
                    <button 
                        onClick={handleOpenAddModal} 
                        className="flex items-center mx-auto space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm"
                    >
                        <PlusCircleIcon />
                        <span>Adicionar a primeira aula</span>
                    </button>
                  }
              />
          );
      }
      return (
        <div className="space-y-10">
          {classesByDay.map(({ day, classes: dayClasses }) => (
            <div key={day}>
              <h2 className="text-2xl font-semibold mb-5 text-gray-100 border-b-2 border-gray-700 pb-3">{day}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dayClasses.map(classSession => {
                  const googleCalendarLink = generateGoogleCalendarLink(classSession, siteSettings.academy_name);
                  return (
                  <div key={classSession.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-red-500 hover:-translate-y-1">
                    <div>
                      <p className="text-lg font-bold text-red-500">{classSession.time}</p>
                      <h3 className="text-xl font-semibold text-gray-100 mt-1">{classSession.name}</h3>
                      <p className="text-gray-400 mt-2">Instrutor: {classSession.instructor}</p>
                      <p className="text-gray-400">Nível: {classSession.level}</p>
                    </div>
                    {isAdminOrMestre ? (
                        <div className="mt-6 flex justify-end items-center space-x-3">
                            <a href={googleCalendarLink} target="_blank" rel="noopener noreferrer" title="Adicionar ao Google Agenda" className="p-2 text-gray-400 hover:text-red-500 bg-gray-700 rounded-full transition-colors"><CalendarPlusIcon /></a>
                            <button onClick={() => handleOpenEditModal(classSession)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-700 rounded-full transition-colors"><EditIcon /></button>
                            <button 
                                onClick={() => setClassToDelete(classSession)}
                                className="p-2 text-gray-400 hover:text-red-500 bg-gray-700 rounded-full transition-colors"
                            >
                                <TrashIcon />
                            </button>
                        </div>
                    ) : (
                        <div className="mt-6 flex items-center space-x-3">
                           {bookedClasses.has(classSession.id!) ? (
                              <button
                                onClick={() => handleCancelBooking(classSession.id!)}
                                className="flex-grow py-2 px-4 rounded-md font-semibold transition-all duration-300 bg-gray-600 hover:bg-gray-500 text-white"
                              >
                                Cancelar
                              </button>
                            ) : (
                              <button
                                  onClick={() => handleBookClick(classSession)}
                                  className={`flex-grow py-2 px-4 rounded-md font-semibold transition-all duration-300 bg-red-600 hover:bg-red-700 text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 focus:ring-offset-gray-800`}
                              >
                                Agendar Aula
                              </button>
                            )}
                          <a href={googleCalendarLink} target="_blank" rel="noopener noreferrer" title="Adicionar ao Google Agenda" className="flex-shrink-0 p-2 text-gray-400 hover:text-red-500 bg-gray-700 rounded-full transition-colors">
                              <CalendarPlusIcon />
                          </a>
                        </div>
                    )}
                  </div>
                )})}
              </div>
            </div>
          ))}
        </div>
      )
  }

  return (
    <>
      <div className="animate-fade-in-up">
        <div className="flex justify-end items-center mb-6 space-x-4">
             <button 
                onClick={handleExportToCalendar} 
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm"
            >
                <ExportIcon />
                <span>Exportar Agenda</span>
            </button>
            {isAdminOrMestre && (
                <button 
                    onClick={handleOpenAddModal} 
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm"
                >
                    <PlusCircleIcon />
                    <span>Adicionar Aula</span>
                </button>
            )}
        </div>
        {renderContent()}
      </div>

      {/* Booking Modal for Users */}
      <Modal isOpen={!!selectedClass} onClose={() => setSelectedClass(null)} title="Confirmar Agendamento">
        {selectedClass && (
          <div>
            <p className="text-gray-300">Tem certeza que deseja agendar esta aula?</p>
            <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-gray-700">
              <p className="font-semibold text-gray-100">{selectedClass.name}</p>
              <p className="text-gray-400">{selectedClass.day} às {selectedClass.time}</p>
              <p className="text-gray-400">Instrutor: {selectedClass.instructor}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setSelectedClass(null)}
                className="px-4 py-2 rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmBooking}
                className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </Modal>
      
      {/* Delete Confirmation Modal for Admins */}
      <Modal isOpen={!!classToDelete} onClose={() => setClassToDelete(null)} title="Confirmar Exclusão">
        {classToDelete && (
          <div>
            <p className="text-gray-300">Tem certeza que deseja excluir permanentemente a aula abaixo?</p>
            <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-gray-700">
              <p className="font-semibold text-gray-100">{classToDelete.name}</p>
              <p className="text-gray-400">{classToDelete.day} às {classToDelete.time}</p>
              <p className="text-gray-400">Instrutor: {classToDelete.instructor}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setClassToDelete(null)}
                className="px-4 py-2 rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md text-white bg-red-800 hover:bg-red-700 transition-colors"
              >
                Excluir Aula
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal for Admins */}
      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={editingClass ? 'Editar Aula' : 'Adicionar Nova Aula'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="day" className="block text-sm font-medium text-gray-300 mb-1">Dia da Semana</label>
            <select id="day" name="day" value={formData.day} onChange={handleFormChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent">
              {daysOfWeek.filter(d => d !== 'Domingo').map(day => <option key={day} value={day}>{day}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-gray-300 mb-1">Horário</label>
            <input type="text" id="time" name="time" value={formData.time} onChange={handleFormChange} required placeholder="ex: 19:00 - 20:30" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome da Aula</label>
            <input type="text" id="name" name="name" value={formData.name} onChange={handleFormChange} required placeholder="ex: Gi Fundamentos" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="instructor" className="block text-sm font-medium text-gray-300 mb-1">Instrutor</label>
            <input type="text" id="instructor" name="instructor" value={formData.instructor} onChange={handleFormChange} required placeholder="ex: Professor Helio" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div>
            <label htmlFor="level" className="block text-sm font-medium text-gray-300 mb-1">Nível</label>
            <input type="text" id="level" name="level" value={formData.level} onChange={handleFormChange} required placeholder="ex: Iniciante" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" />
          </div>
          <div className="mt-6 flex justify-end space-x-4 pt-4">
              <button type="button" onClick={handleCloseFormModal} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500 transition-colors">
                Cancelar
              </button>
              <button type="submit" disabled={isSaving} className="flex items-center justify-center w-28 px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors disabled:bg-red-800">
                {isSaving ? <SpinnerIcon /> : 'Salvar'}
              </button>
            </div>
        </form>
      </Modal>
    </>
  );
};

export default ScheduleView;
