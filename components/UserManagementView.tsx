
import React, { useState, useEffect } from 'react';
import { type User } from '../types';
import Modal from './Modal';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';

interface UserManagementViewProps {
  users: User[];
  currentUser: User;
  onCreateUser: (userData: { email: string; pass: string; role: 'admin' | 'user' | 'mestre'; name: string; paymentDueDate: string | null }) => boolean;
  onUpdateUser: (userData: User & { pass?: string }) => void;
  onDeleteUser: (userId: number) => void;
}

type FormData = {
  name: string;
  email: string;
  pass: string;
  role: 'admin' | 'user' | 'mestre';
  paymentDueDate: string | null;
}

const initialFormState: FormData = {
  name: '',
  email: '',
  pass: '',
  role: 'user',
  paymentDueDate: new Date().toISOString().split('T')[0],
};

const getPaymentStatus = (dueDate: string | null) => {
    if (!dueDate) {
        return { text: 'N/A', color: 'bg-gray-600 text-gray-200' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const dueDateObj = new Date(dueDate + 'T00:00:00');

    if (dueDateObj < today) {
        return { text: 'Vencido', color: 'bg-red-300 text-red-900' };
    } else if (dueDateObj.getTime() === today.getTime()) {
        return { text: 'Vence hoje', color: 'bg-yellow-300 text-yellow-900' };
    } else {
        return { text: 'Em dia', color: 'bg-green-300 text-green-900' };
    }
};


const UserManagementView: React.FC<UserManagementViewProps> = ({ users, currentUser, onCreateUser, onUpdateUser, onDeleteUser }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  useEffect(() => {
    if (editingUser) {
        const { name, email, role, paymentDueDate } = editingUser;
        setFormData({ name, email, role, paymentDueDate, pass: '' });
    } else {
        setFormData(initialFormState);
    }
  }, [editingUser, isModalOpen]);


  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingUser) {
        if(formData.pass && formData.pass.length < 6) {
            alert('A nova senha deve ter pelo menos 6 caracteres.');
            return;
        }
        onUpdateUser({ ...editingUser, ...formData });
        handleCloseModal();
    } else {
       if (formData.email && formData.pass) {
          const success = onCreateUser({
            ...formData, 
            paymentDueDate: formData.role === 'user' ? formData.paymentDueDate : null
          });
          if (success) {
            handleCloseModal();
          }
        } else {
          alert('Por favor, preencha todos os campos obrigatórios.');
        }
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
                <th className="p-4 text-sm font-semibold text-gray-300">Usuário</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Vencimento</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
                <th className="p-4 text-sm font-semibold text-gray-300">Função</th>
                <th className="p-4 text-sm font-semibold text-gray-300 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {users.map(user => {
                  const paymentStatus = getPaymentStatus(user.paymentDueDate);
                  const canMestreAct = currentUser.role === 'mestre' && user.role !== 'user';
                  return (
                    <tr key={user.id} className="hover:bg-gray-700/50">
                      <td className="p-4">
                        <p className="font-medium text-gray-100">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </td>
                      <td className="p-4 text-gray-300 font-mono text-sm">
                        {user.paymentDueDate ? new Date(user.paymentDueDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${paymentStatus.color}`}>
                            {paymentStatus.text}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                          user.role === 'admin' 
                          ? 'bg-red-300 text-red-900'
                          : user.role === 'mestre'
                          ? 'bg-blue-300 text-blue-900'
                          : 'bg-gray-600 text-gray-200'
                        }`}>
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                         <button
                            onClick={() => handleOpenEditModal(user)}
                            disabled={canMestreAct}
                            className="p-2 mr-2 text-gray-400 hover:text-red-500 rounded-full transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                            aria-label={`Editar usuário ${user.name}`}
                            title={canMestreAct ? 'Permissão negada' : `Editar usuário ${user.name}`}
                          >
                            <EditIcon />
                          </button>
                        <button
                          onClick={() => setUserToDelete(user)}
                          disabled={user.id === currentUser.id || canMestreAct}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                          aria-label={`Excluir usuário ${user.name}`}
                          title={user.id === currentUser.id ? 'Não é possível excluir a si mesmo' : canMestreAct ? 'Permissão negada' : 'Excluir usuário'}
                        >
                          <TrashIcon />
                        </button>
                      </td>
                    </tr>
                )})}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Delete Confirmation Modal */}
      <Modal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} title="Confirmar Exclusão">
        {userToDelete && (
          <div>
            <p className="text-gray-300 mb-4">
              Tem certeza que deseja excluir permanentemente o usuário abaixo?
            </p>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <p className="font-semibold text-gray-100">{userToDelete.name}</p>
              <p className="text-sm text-gray-400">{userToDelete.email}</p>
            </div>
            <p className="text-sm text-yellow-500 mt-4">
              <strong>Atenção:</strong> Esta ação não pode ser desfeita.
            </p>
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

      {/* Add/Edit User Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
           <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
            <input 
              type="text" id="name" name="name" value={formData.name} 
              onChange={handleFormChange} required 
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" 
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input 
              type="email" id="email" name="email" value={formData.email} 
              onChange={handleFormChange} required
              disabled={!!editingUser}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-800 disabled:cursor-not-allowed" 
            />
          </div>
          <div>
            <label htmlFor="pass" className="block text-sm font-medium text-gray-300 mb-1">
              {editingUser ? 'Nova Senha (opcional)' : 'Senha'}
            </label>
            <input
              type="password" id="pass" name="pass" value={formData.pass}
              onChange={handleFormChange}
              required={!editingUser}
              placeholder={editingUser ? 'Deixe em branco para não alterar' : ''}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Função</label>
            <select 
              id="role" name="role" value={formData.role} 
              onChange={handleFormChange} 
              disabled={currentUser.role === 'mestre'}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:bg-gray-800 disabled:cursor-not-allowed"
            >
              <option value="user">Usuário</option>
              {currentUser.role === 'admin' && (
                <>
                  <option value="admin">Admin</option>
                  <option value="mestre">Mestre</option>
                </>
              )}
            </select>
          </div>
           {formData.role === 'user' && (
              <div>
                <label htmlFor="paymentDueDate" className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento</label>
                <input
                  type="date" id="paymentDueDate" name="paymentDueDate"
                  value={formData.paymentDueDate || ''}
                  onChange={handleFormChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            )}
          <div className="mt-6 flex justify-end space-x-4 pt-4">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500 transition-colors">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 transition-colors">
              {editingUser ? 'Salvar Alterações' : 'Criar Usuário'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UserManagementView;