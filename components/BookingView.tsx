import React, { useState } from 'react';
import { type Booking, type TatameArea } from '../types';
import Modal from './Modal';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { useAppStore } from '../store';

const formatDateForInput = (date: Date): string => {
    return date.toISOString().split('T')[0];
};

const TatameAreaEditor: React.FC<{
  area: TatameArea;
  onSave: (updatedArea: TatameArea) => void;
  onClose: () => void;
}> = ({ area, onSave, onClose }) => {
    const [name, setName] = useState(area.name);
    const [timeSlots, setTimeSlots] = useState([...area.timeSlots]);
    const [newTimeSlot, setNewTimeSlot] = useState('');

    const handleAddTimeSlot = () => {
        if (newTimeSlot.match(/^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/) && !timeSlots.includes(newTimeSlot)) {
            setTimeSlots(prev => [...prev, newTimeSlot].sort());
            setNewTimeSlot('');
        } else {
            alert('Formato de horário inválido (ex: 09:00 - 10:00) ou horário já existe.');
        }
    };
    
    const handleRemoveTimeSlot = (slotToRemove: string) => {
        setTimeSlots(prev => prev.filter(slot => slot !== slotToRemove));
    };
    
    const handleSave = () => {
        onSave({ ...area, name, timeSlots });
        onClose();
    };

    return (
        <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Nome da Área</label>
                <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100" />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Horários</label>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {timeSlots.map(slot => (
                        <div key={slot} className="flex items-center justify-between bg-gray-900 p-2 rounded">
                            <span className="font-mono">{slot}</span>
                            <button onClick={() => handleRemoveTimeSlot(slot)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon /></button>
                        </div>
                    ))}
                </div>
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Adicionar Horário</label>
                 <div className="flex space-x-2">
                    <input type="text" value={newTimeSlot} onChange={e => setNewTimeSlot(e.target.value)} placeholder="09:00 - 10:00" className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100" />
                    <button onClick={handleAddTimeSlot} type="button" className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Adicionar</button>
                 </div>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
                <button onClick={onClose} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Salvar Alterações</button>
            </div>
        </div>
    );
};


const BookingView: React.FC = () => {
    const { 
        user, 
        bookings, 
        tatameAreas, 
        bookTatame, 
        cancelBooking, 
        updateBookingStatus, 
        updateTatameAreas, 
        addTatameArea 
    } = useAppStore(state => ({
        user: state.currentUser!,
        bookings: state.bookings,
        tatameAreas: state.tatameAreas,
        bookTatame: state.bookTatame,
        cancelBooking: state.cancelBooking,
        updateBookingStatus: state.updateBookingStatus,
        updateTatameAreas: state.updateTatameAreas,
        addTatameArea: state.addTatameArea,
    }));
    
    const [selectedDate, setSelectedDate] = useState(formatDateForInput(new Date()));
    const [confirmingBooking, setConfirmingBooking] = useState<Omit<Booking, 'id' | 'userId' | 'userEmail' | 'status'> | null>(null);
    const [editingArea, setEditingArea] = useState<TatameArea | null>(null);
    const [isAddAreaModalOpen, setIsAddAreaModalOpen] = useState(false);
    
    // State for the "Add Tatame Area" modal form
    const [newAreaName, setNewAreaName] = useState('');
    const [newAreaTimeSlots, setNewAreaTimeSlots] = useState<string[]>([]);
    const [newTimeSlotInput, setNewTimeSlotInput] = useState('');

    const isAdminOrMestre = user.role === 'admin' || user.role === 'mestre';

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedDate(e.target.value);
    };

    const handleBookClick = (tatameId: string, tatameName: string, timeSlot: string) => {
        setConfirmingBooking({ tatameId, tatameName, date: selectedDate, timeSlot });
    };
    
    const handleCancelClick = (booking: Booking) => {
        if (window.confirm(`Tem certeza que deseja cancelar a reserva para "${booking.tatameName}" no horário ${booking.timeSlot}?`)) {
            cancelBooking(booking.id);
        }
    };
    
    const handleSaveArea = (updatedArea: TatameArea) => {
        const newAreas = tatameAreas.map(area => area.id === updatedArea.id ? updatedArea : area);
        updateTatameAreas(newAreas);
    };

    const executeBooking = () => {
        if (confirmingBooking) {
            bookTatame(confirmingBooking);
            setConfirmingBooking(null);
        }
    };

    // --- Handlers for Add Tatame Area Modal ---
    const handleOpenAddAreaModal = () => {
      setNewAreaName('');
      setNewAreaTimeSlots([]);
      setNewTimeSlotInput('');
      setIsAddAreaModalOpen(true);
    };

    const handleCloseAddAreaModal = () => {
      setIsAddAreaModalOpen(false);
    };

    const handleAddNewTimeSlot = () => {
        if (newTimeSlotInput.match(/^\d{2}:\d{2}\s*-\s*\d{2}:\d{2}$/) && !newAreaTimeSlots.includes(newTimeSlotInput)) {
            setNewAreaTimeSlots(prev => [...prev, newTimeSlotInput].sort());
            setNewTimeSlotInput('');
        } else {
            alert('Formato de horário inválido (ex: 09:00 - 10:00) ou horário já existe.');
        }
    };

    const handleRemoveNewTimeSlot = (slotToRemove: string) => {
        setNewAreaTimeSlots(prev => prev.filter(slot => slot !== slotToRemove));
    };

    const handleSaveNewArea = (e: React.FormEvent) => {
        e.preventDefault();
        if (newAreaName.trim() === '') {
            alert('O nome da área não pode ser vazio.');
            return;
        }
        addTatameArea({ name: newAreaName, timeSlots: newAreaTimeSlots });
        handleCloseAddAreaModal();
    };
    // ------------------------------------------

    const bookingsForSelectedDate = bookings.filter(b => b.date === selectedDate);
  
    return (
        <>
            <div className="animate-fade-in-up">
                <div className="flex justify-end items-center mb-6 space-x-4">
                    {isAdminOrMestre && (
                        <button 
                            onClick={handleOpenAddAreaModal}
                            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm"
                        >
                            <PlusCircleIcon />
                            <span>Adicionar Tatame</span>
                        </button>
                    )}
                    <div className="flex items-center space-x-2">
                        <label htmlFor="booking-date" className="text-gray-300 font-medium">Data:</label>
                        <input
                            type="date"
                            id="booking-date"
                            value={selectedDate}
                            onChange={handleDateChange}
                            className="bg-gray-800 border border-gray-600 rounded-lg text-gray-200 px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {tatameAreas.map(area => (
                        <div key={area.id} className="bg-gray-800 border border-gray-700 rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-center border-b-2 border-gray-700 pb-3 mb-5">
                                <h2 
                                    className={`text-2xl font-semibold text-gray-100 ${isAdminOrMestre ? 'cursor-pointer hover:text-red-400 transition-colors' : ''}`}
                                    onClick={() => isAdminOrMestre && setEditingArea(area)}
                                    title={isAdminOrMestre ? 'Clique para editar o nome da área' : ''}
                                >
                                    {area.name}
                                </h2>
                                {isAdminOrMestre && (
                                    <button 
                                        onClick={() => setEditingArea(area)} 
                                        className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                        aria-label={`Editar área ${area.name}`}
                                    >
                                        <EditIcon />
                                    </button>
                                )}
                            </div>
                            <div className="space-y-3">
                                {area.timeSlots.map(timeSlot => {
                                    const booking = bookingsForSelectedDate.find(
                                        b => b.tatameId === area.id && b.timeSlot === timeSlot
                                    );

                                    const canUserCancel = booking && booking.userId === user.id;

                                    return (
                                        <div key={timeSlot} className={`p-3 rounded-lg flex items-center justify-between transition-colors duration-200 ${booking ? 'bg-gray-900' : 'bg-gray-800 hover:bg-gray-700'}`}>
                                            <span className="font-mono text-gray-300">{timeSlot}</span>
                                            {booking ? (
                                                <div className="flex items-center space-x-3">
                                                    {booking.status === 'pending' ? (
                                                        isAdminOrMestre ? (
                                                            <>
                                                                <div className="text-right"><span className="text-sm text-yellow-500 font-semibold truncate" title={booking.userEmail}>{booking.userEmail}</span></div>
                                                                <button onClick={() => updateBookingStatus(booking.id, 'deny')} className="p-1.5 text-red-500 hover:bg-red-900/50 rounded-full"><XCircleIcon /></button>
                                                                <button onClick={() => updateBookingStatus(booking.id, 'confirm')} className="p-1.5 text-green-500 hover:bg-green-900/50 rounded-full"><CheckCircleIcon /></button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <span className="text-sm font-semibold text-yellow-500">Pendente</span>
                                                                {canUserCancel && <button onClick={() => handleCancelClick(booking)} className="p-2 text-gray-400 hover:text-white bg-red-900/50 hover:bg-red-600 rounded-full transition-colors" aria-label="Cancelar solicitação"><TrashIcon /></button>}
                                                            </>
                                                        )
                                                    ) : ( // Confirmed
                                                        <>
                                                            <div className="text-right">
                                                                <p className="text-sm font-semibold text-red-500">Reservado</p>
                                                                <p className="text-xs text-gray-400 truncate" title={booking.userEmail}>{booking.userEmail}</p>
                                                            </div>
                                                            {(isAdminOrMestre || canUserCancel) && <button onClick={() => handleCancelClick(booking)} className="p-2 text-gray-400 hover:text-white bg-red-900/50 hover:bg-red-600 rounded-full transition-colors" aria-label="Cancelar reserva"><TrashIcon /></button>}
                                                        </>
                                                    )}
                                                </div>
                                            ) : (
                                                <button onClick={() => handleBookClick(area.id, area.name, timeSlot)} className="text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition-all shadow-sm">
                                                    Reservar
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <Modal isOpen={!!confirmingBooking} onClose={() => setConfirmingBooking(null)} title="Confirmar Solicitação de Reserva">
                {confirmingBooking && (
                    <div>
                        <p className="text-gray-300">Sua solicitação será enviada para aprovação do administrador. Deseja continuar?</p>
                        <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-gray-700">
                            <p><span className="font-semibold text-gray-400">Tatame:</span> <span className="text-gray-100">{confirmingBooking.tatameName}</span></p>
                            <p><span className="font-semibold text-gray-400">Data:</span> <span className="text-gray-100">{new Date(confirmingBooking.date + 'T00:00:00').toLocaleDateString('pt-BR')}</span></p>
                            <p><span className="font-semibold text-gray-400">Horário:</span> <span className="text-gray-100">{confirmingBooking.timeSlot}</span></p>
                        </div>
                        <div className="mt-6 flex justify-end space-x-4">
                            <button onClick={() => setConfirmingBooking(null)} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500 transition-colors">
                                Voltar
                            </button>
                            <button onClick={executeBooking} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">
                                Enviar Solicitação
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
            
            <Modal isOpen={!!editingArea} onClose={() => setEditingArea(null)} title={`Editar ${editingArea?.name}`}>
              {editingArea && <TatameAreaEditor area={editingArea} onSave={handleSaveArea} onClose={() => setEditingArea(null)} />}
            </Modal>
            
            <Modal isOpen={isAddAreaModalOpen} onClose={handleCloseAddAreaModal} title="Adicionar Nova Área de Tatame">
              <form onSubmit={handleSaveNewArea} className="space-y-4">
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Nome da Nova Área</label>
                      <input type="text" value={newAreaName} onChange={e => setNewAreaName(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100" />
                  </div>
                  <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Horários</label>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                          {newAreaTimeSlots.map(slot => (
                              <div key={slot} className="flex items-center justify-between bg-gray-900 p-2 rounded">
                                  <span className="font-mono">{slot}</span>
                                  <button type="button" onClick={() => handleRemoveNewTimeSlot(slot)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon /></button>
                              </div>
                          ))}
                      </div>
                  </div>
                   <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Adicionar Horário</label>
                       <div className="flex space-x-2">
                          <input type="text" value={newTimeSlotInput} onChange={e => setNewTimeSlotInput(e.target.value)} placeholder="09:00 - 10:00" className="flex-grow px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100" />
                          <button onClick={handleAddNewTimeSlot} type="button" className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Adicionar</button>
                       </div>
                  </div>
                  <div className="mt-6 flex justify-end space-x-4">
                      <button type="button" onClick={handleCloseAddAreaModal} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Cancelar</button>
                      <button type="submit" className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Salvar Área</button>
                  </div>
              </form>
            </Modal>
        </>
    );
};

export default BookingView;