import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { TrashIcon } from './icons/TrashIcon';
import { EditIcon } from './icons/EditIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { useAppStore } from '../store';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { type Belt } from '../types';

// Base object schema without refinement
const baseUserObject = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres.'),
  email: z.string().email('Formato de e-mail inválido.'),
  pass: z.string().optional(),
  role: z.enum(['admin', 'user', 'mestre']),
  belt: z.enum(['branca', 'azul', 'roxa', 'marrom', 'preta']),
  paymentDueDate: z.string().nullable(),
});

// Refinement logic and options
const refinement = (data: z.infer<typeof baseUserObject>) => data.role !== 'user' || !!data.paymentDueDate;
const refinementOptions = {
  message: 'Data de vencimento é obrigatória para usuários.',
  path: ['paymentDueDate'],
};

// Schema for updating users
const userSchema = baseUserObject.refine(refinement, refinementOptions);

// Schema for creating users (extends the base to make password required, then applies the same refinement)
const createUserSchema = baseUserObject.extend({
  pass: z.string().min(6, 'A senha deve ter pelo menos 6 caracteres.'),
}).refine(refinement, refinementOptions);


type FormData = z.infer<typeof userSchema>;

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


const UserManagementView: React.FC = () => {
  const { users, currentUser, createUser, updateUser, deleteUser, setCurrentView, setSelectedUserId } = useAppStore(state => ({
    users: state.users,
    currentUser: state.currentUser!,
    createUser: state.createUser,
    updateUser: state.updateUser,
    deleteUser: state.deleteUser,
    setCurrentView: state.setCurrentView,
    setSelectedUserId: state.setSelectedUserId,
  }));
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<typeof users[0] | null>(null);
  const [userToDelete, setUserToDelete] = useState<typeof users[0] | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm<FormData>({
    resolver: zodResolver(editingUser ? userSchema : createUserSchema),
  });

  const watchRole = watch('role');

  useEffect(() => {
    if (editingUser) {
        reset({
            ...editingUser,
            pass: '',
            belt: editingUser.belt || 'branca',
            paymentDueDate: editingUser.paymentDueDate || new Date().toISOString().split('T')[0]
        });
    } else {
        reset({
            name: '',
            email: '',
            pass: '',
            role: currentUser.role === 'mestre' ? 'user' : 'user',
            belt: 'branca',
            paymentDueDate: new Date().toISOString().split('T')[0],
        });
    }
  }, [editingUser, isModalOpen, reset, currentUser.role]);


  const handleOpenAddModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (e: React.MouseEvent, user: typeof users[0]) => {
    e.stopPropagation();
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };
  
  const handleRowClick = (user: typeof users[0]) => {
    setSelectedUserId(user.id);
    setCurrentView('userDetail');
  };

  const processFormSubmit = async (data: FormData) => {
    try {
        if (editingUser) {
            if (data.pass && data.pass.length > 0 && data.pass.length < 6) {
                toast.error('A nova senha deve ter pelo menos 6 caracteres.');
                return;
            }
            await updateUser({ ...editingUser, ...data });
            toast.success('Usuário atualizado com sucesso!');
        } else {
           const result = await createUser({
             ...(data as Required<FormData>), // pass is required by schema here
             paymentDueDate: data.role === 'user' ? data.paymentDueDate : null
           });
           if (result.success) {
               toast.success('Usuário criado com sucesso!');
           } else {
               toast.error(result.message || 'Erro ao criar usuário.');
               return; // Prevent modal from closing on error
           }
        }
        handleCloseModal();
    } catch (error) {
        toast.error('Ocorreu um erro.');
    }
  };

  const handleConfirmDelete = async () => {
    if (userToDelete) {
      const success = await deleteUser(userToDelete.id);
      if (success) {
        toast.success(`Usuário ${userToDelete.name} excluído.`);
      }
      setUserToDelete(null);
    }
  };
  
  const handleDeleteClick = (e: React.MouseEvent, user: typeof users[0]) => {
      e.stopPropagation();
      setUserToDelete(user);
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
                  const isActionDisabled = (currentUser.role === 'mestre' && user.role === 'admin') || user.id === currentUser.id;
                  
                  let disabledTitle = '';
                  if (user.id === currentUser.id) disabledTitle = 'Não é possível alterar a si mesmo';
                  else if (currentUser.role === 'mestre' && user.role === 'admin') disabledTitle = 'Mestres não podem alterar Administradores';

                  return (
                    <tr key={user.id} onClick={() => handleRowClick(user)} className="hover:bg-gray-700/50 cursor-pointer">
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
                            onClick={(e) => handleOpenEditModal(e, user)}
                            disabled={isActionDisabled}
                            className="p-2 mr-2 text-gray-400 hover:text-red-500 rounded-full transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                            aria-label={`Editar usuário ${user.name}`}
                            title={isActionDisabled ? disabledTitle : `Editar usuário ${user.name}`}
                          >
                            <EditIcon />
                          </button>
                        <button
                          onClick={(e) => handleDeleteClick(e, user)}
                          disabled={isActionDisabled}
                          className="p-2 text-gray-400 hover:text-red-500 rounded-full transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
                          aria-label={`Excluir usuário ${user.name}`}
                          title={isActionDisabled ? disabledTitle : `Excluir usuário ${user.name}`}
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
              <button onClick={() => setUserToDelete(null)} className="px-4 py-2 rounded-md text-gray-200 bg-gray-700 hover:bg-gray-600">Cancelar</button>
              <button onClick={handleConfirmDelete} className="px-4 py-2 rounded-md text-white bg-red-800 hover:bg-red-700">Excluir Usuário</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit User Modal */}
      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingUser ? 'Editar Usuário' : 'Adicionar Novo Usuário'}>
        <form onSubmit={handleSubmit(processFormSubmit)} className="space-y-4">
           <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
            <input {...register('name')} type="text" id="name" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input {...register('email')} type="email" id="email" disabled={!!editingUser} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg disabled:bg-gray-800 disabled:cursor-not-allowed" />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label htmlFor="pass" className="block text-sm font-medium text-gray-300 mb-1">{editingUser ? 'Nova Senha (opcional)' : 'Senha'}</label>
            <input {...register('pass')} type="password" id="pass" placeholder={editingUser ? 'Deixe em branco para não alterar' : ''} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
            {errors.pass && <p className="text-red-500 text-xs mt-1">{errors.pass.message}</p>}
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-300 mb-1">Função</label>
            <select {...register('role')} id="role" disabled={currentUser.role === 'mestre'} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg disabled:bg-gray-800 disabled:cursor-not-allowed">
              {currentUser.role === 'admin' ? (
                 <>
                    <option value="user">Usuário</option>
                    <option value="mestre">Mestre</option>
                    <option value="admin">Admin</option>
                 </>
              ) : ( <>
                    <option value="user">Usuário</option>
                    {watchRole === 'mestre' && <option value="mestre">Mestre</option>}
                  </>)}
            </select>
          </div>
          <div>
            <label htmlFor="belt" className="block text-sm font-medium text-gray-300 mb-1">Faixa</label>
            <select {...register('belt')} id="belt" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg">
                <option value="branca">Branca</option>
                <option value="azul">Azul</option>
                <option value="roxa">Roxa</option>
                <option value="marrom">Marrom</option>
                <option value="preta">Preta</option>
            </select>
            {errors.belt && <p className="text-red-500 text-xs mt-1">{errors.belt.message}</p>}
          </div>
           {watchRole === 'user' && (
              <div>
                <label htmlFor="paymentDueDate" className="block text-sm font-medium text-gray-300 mb-1">Data de Vencimento</label>
                <input {...register('paymentDueDate')} type="date" id="paymentDueDate" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
                {errors.paymentDueDate && <p className="text-red-500 text-xs mt-1">{errors.paymentDueDate.message}</p>}
              </div>
            )}
          <div className="mt-6 flex justify-end space-x-4 pt-4">
            <button type="button" onClick={handleCloseModal} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="flex items-center justify-center w-40 px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-800">
              {isSubmitting ? <SpinnerIcon /> : (editingUser ? 'Salvar Alterações' : 'Criar Usuário')}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default UserManagementView;