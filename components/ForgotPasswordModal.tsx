import React, { useState, useEffect, useCallback } from 'react';
import { type User } from '../types';
import Modal from './Modal';
import { CheckCircleIcon } from './icons/CheckCircleIcon';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  onResetPassword: (email: string, newPass: string) => boolean;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, users, onResetPassword }) => {
  type Step = 'email' | 'security' | 'reset' | 'success';

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [userToReset, setUserToReset] = useState<User | null>(null);

  const resetState = useCallback(() => {
    setStep('email');
    setEmail('');
    setName('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setUserToReset(null);
  }, []);

  useEffect(() => {
    if (isOpen) {
      resetState();
    }
  }, [isOpen, resetState]);

  const handleClose = () => {
    onClose();
  };
  
  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (foundUser) {
      setUserToReset(foundUser);
      setStep('security');
    } else {
      setError('E-mail não encontrado em nosso sistema.');
    }
  };
  
  const handleSecuritySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (userToReset && name.trim().toLowerCase() === userToReset.name.toLowerCase()) {
      setStep('reset');
    } else {
      setError('O nome fornecido não corresponde ao usuário. Tente novamente.');
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword.length < 6) {
        setError('A senha deve ter pelo menos 6 caracteres.');
        return;
    }
    if (newPassword !== confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }
    if (userToReset) {
      const success = onResetPassword(userToReset.email, newPassword);
      if (success) {
        setStep('success');
      } else {
        setError('Ocorreu um erro ao redefinir a senha. Tente novamente.');
      }
    }
  };

  const titles: Record<Step, string> = {
    email: 'Recuperar Senha',
    security: 'Verificação de Segurança',
    reset: 'Criar Nova Senha',
    success: 'Senha Redefinida!',
  };

  const renderContent = () => {
    switch(step) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <p className="text-sm text-gray-400">Insira o e-mail associado à sua conta para iniciar a recuperação.</p>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input type="email" id="reset-email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end pt-2 space-x-3">
              <button type="button" onClick={handleClose} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Continuar</button>
            </div>
          </form>
        );
      case 'security':
        return (
          <form onSubmit={handleSecuritySubmit} className="space-y-4">
            <p className="text-sm text-gray-400">Para sua segurança, por favor, insira o nome completo cadastrado para o e-mail <strong className="text-gray-200">{userToReset?.email}</strong>.</p>
            <div>
              <label htmlFor="reset-name" className="block text-sm font-medium text-gray-300 mb-1">Nome Completo</label>
              <input type="text" id="reset-name" value={name} onChange={e => setName(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end pt-2 space-x-3">
              <button type="button" onClick={handleClose} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Verificar</button>
            </div>
          </form>
        );
      case 'reset':
        return (
          <form onSubmit={handleResetSubmit} className="space-y-4">
            <p className="text-sm text-gray-400">Crie uma nova senha forte para sua conta.</p>
            <div>
              <label htmlFor="reset-new-password" className="block text-sm font-medium text-gray-300 mb-1">Nova Senha</label>
              <input type="password" id="reset-new-password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            <div>
              <label htmlFor="reset-confirm-password" className="block text-sm font-medium text-gray-300 mb-1">Confirmar Nova Senha</label>
              <input type="password" id="reset-confirm-password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <div className="flex justify-end pt-2 space-x-3">
              <button type="button" onClick={handleClose} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Cancelar</button>
              <button type="submit" className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Redefinir Senha</button>
            </div>
          </form>
        );
      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500"/>
            <p className="text-gray-300">Sua senha foi redefinida com sucesso. Agora você pode fazer login com sua nova senha.</p>
            <div className="flex justify-center pt-2">
              <button onClick={handleClose} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Voltar para Login</button>
            </div>
          </div>
        );
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={titles[step]}>
      {renderContent()}
    </Modal>
  );
};

export default ForgotPasswordModal;
