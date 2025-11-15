
import React, { useState } from 'react';
import { type Announcement, type User } from '../types';
import Modal from './Modal';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';

interface AnnouncementsViewProps {
  user: User;
  announcements: Announcement[];
  onAddAnnouncement: (announcement: { title: string; content: string }) => void;
  onDeleteAnnouncement: (announcementId: number) => void;
}

const initialFormState = {
  title: '',
  content: '',
};

const AnnouncementsView: React.FC<AnnouncementsViewProps> = ({ user, announcements, onAddAnnouncement, onDeleteAnnouncement }) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [announcementToDelete, setAnnouncementToDelete] = useState<Announcement | null>(null);

  const isAdmin = user.role === 'admin';

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.title && formData.content) {
      onAddAnnouncement(formData);
      handleCloseFormModal();
    }
  };

  const handleConfirmDelete = () => {
    if (announcementToDelete) {
      onDeleteAnnouncement(announcementToDelete.id);
      setAnnouncementToDelete(null);
    }
  };

  return (
    <>
      <div className="animate-fade-in-up">
        {isAdmin && (
          <div className="flex justify-end mb-6">
            <button
              onClick={handleOpenAddModal}
              className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm"
            >
              <PlusCircleIcon />
              <span>Adicionar Aviso</span>
            </button>
          </div>
        )}
        <div className="max-w-3xl mx-auto">
          {announcements.length > 0 ? (
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-gray-800 rounded-lg p-6 shadow-sm border-l-4 border-red-600 transition-all duration-300 hover:shadow-md relative group">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-100 pr-16">{announcement.title}</h2>
                    <span className="text-sm text-gray-400 flex-shrink-0">{announcement.date}</span>
                  </div>
                  <p className="text-gray-300 mt-2 whitespace-pre-wrap">
                    {announcement.content}
                  </p>
                  {isAdmin && (
                    <button
                      onClick={() => setAnnouncementToDelete(announcement)}
                      className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 bg-gray-700/50 rounded-full transition-all opacity-0 group-hover:opacity-100"
                      aria-label="Excluir aviso"
                    >
                      <TrashIcon />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
             <div className="text-center py-16 bg-gray-800 rounded-lg border border-gray-700">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-700">
                     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                        <path d="m3 11 18-5v12L3 14v-3z"></path>
                        <path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"></path>
                    </svg>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-gray-200">Nenhum aviso publicado</h3>
                <p className="mt-2 text-gray-400">Quando um novo aviso for adicionado, ele aparecerá aqui.</p>
                {isAdmin && (
                    <div className="mt-6">
                         <button
                            onClick={handleOpenAddModal}
                            className="flex items-center mx-auto space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm"
                            >
                            <PlusCircleIcon />
                            <span>Publicar o primeiro aviso</span>
                        </button>
                    </div>
                )}
            </div>
          )}
        </div>
      </div>
      
      {/* Delete Confirmation Modal for Admins */}
      <Modal isOpen={!!announcementToDelete} onClose={() => setAnnouncementToDelete(null)} title="Confirmar Exclusão">
        {announcementToDelete && (
          <div>
            <p className="text-gray-300">Tem certeza que deseja excluir o aviso abaixo?</p>
            <div className="mt-4 bg-gray-900 p-4 rounded-lg border border-gray-700">
                <p className="font-semibold text-gray-100">{announcementToDelete.title}</p>
                <p className="text-gray-400 text-sm mt-1">{announcementToDelete.date}</p>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
                <button
                    onClick={() => setAnnouncementToDelete(null)}
                    className="px-4 py-2 rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 rounded-md text-white bg-red-800 hover:bg-red-700 transition-colors"
                >
                    Excluir Aviso
                </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal for Admins */}
      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title="Adicionar Novo Aviso">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-1">Título</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleFormChange} 
              required 
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
            />
          </div>
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-300 mb-1">Conteúdo</label>
            <textarea 
              id="content" 
              name="content" 
              value={formData.content} 
              onChange={handleFormChange} 
              required 
              rows={5}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
            />
          </div>
          <div className="mt-6 flex justify-end space-x-4 pt-4">
            <button type="button" onClick={handleCloseFormModal} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">
              Publicar Aviso
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default AnnouncementsView;
