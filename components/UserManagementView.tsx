
import React, { useState } from 'react';
import { type User } from '../types';
import Modal from './Modal';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  onCreateUser: (userData: { email: string; pass: string; role: 'admin' | 'user' }) => boolean;
  onDeleteUser: (userId: number) => void;
}

const initialFormState = {
  email: '',
  pass: '',
  role: 'user' as 'admin' | 'user',
};

const UserManagementView: React.FC<UserManagementViewProps> = ({ users, currentUser, onCreateUser, onDeleteUser }) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState(initialFormState);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const handleOpenAddModal = () => {
    setFormData(initialFormState);
    setIsAddModalOpen(true);
  };

  const handleCloseAddModal = () => {
    setIsAddModalOpen(false);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email && formData.pass) {
      const success = onCreateUser(formData);
      if (success) {
        handleCloseAddModal();
      }
    } else {
      alert('Por favor, preencha todos os campos.');
    }
  };

  const handleConfirmDelete = () => {
    if (userToDelete) {
      onDeleteUser(userToDelete.id);
      setUserToDelete(null);
    }
  };

  return (
    <>
      <div className="animate-fade-in-up">
        <div className="flex justify-end mb-6">
          <button
            onClick={handleOpenAddModal}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm"
          >
            <PlusCircleIcon />
            <span>Adicionar Usuário</span>
          </button>
        </div>
        <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-900/50">
              <tr>
                <th className="p-4 text-sm font-semibold text-gray-300">Email</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Função</th>
                <th className="p-4 text-sm font-semibold text-gray-300 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-700/50">
                  <td className="p-4 text-gray-100">{user.email}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      user.role === 'admin' 
                      ? 'bg-red-200 text-red-800' 
                      : 'bg-gray-600 text-gray-200'
                    }`}>
                      {user.role === 'admin' ? 'Admin' : 'Usuário'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => setUserToDelete(user)}
                      disabled={user.id === currentUser.id}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                      aria-label={`Excluir usuário ${user.email}`}
                      title={user.id === currentUser.id ? 'Não é possível excluir a si mesmo' : 'Excluir usuário'}
                    >
                      <TrashIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="Confirmar Exclusão">
        {userToDelete && (
          <div>
            <p className="text-gray-300">Tem certeza que deseja excluir permanentemente o usuário <span className="font-bold text-red-400">{userToDelete.email}</span>?</p>
            <p className="text-sm text-yellow-400 mt-2">Esta ação não pode ser desfeita.</p>
            <div className="mt-6 flex justify-end space-x-4">
              <button
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-md text-white bg-red-800 hover:bg-red-700 transition-colors"
              >
                Excluir Usuário
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add User Modal */}
      <Modal isOpen={isAddModalOpen} onClose={handleCloseAddModal} title="Adicionar Novo Usuário">
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email} 
              onChange={handleFormChange} 
              required 
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" 
            />
          </div>
          <div>
            <label htmlFor="pass" className="block text-sm font-medium text-gray-300 mb-1">Senha</label>
            <input
              type="password"
              id="pass"
              name="pass"
              value={formData.pass}
              onChange={handleFormChange}
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Função</label>
            <select 
              id="role" 
              name="role" 
              value={formData.role} 
              onChange={handleFormChange} 
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="user">Usuário</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="mt-6 flex justify-end space-x-4 pt-4">
            <button type="button" onClick={handleCloseAddModal} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">
              Criar Usuário
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UserManagementView;
