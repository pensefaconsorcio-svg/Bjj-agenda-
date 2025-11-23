
import React, { useState, useCallback } from 'react';
import Modal from './Modal';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { useAppStore } from '../store';
import { SpinnerIcon } from './icons/SpinnerIcon';
import toast from 'react-hot-toast';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose }) => {
  const resetPassword = useAppStore(state => state.resetPassword);

  type Step = 'email' | 'success';

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);


  const handleClose = useCallback(() => {
    onClose();
    // Delay state reset to avoid UI flicker while modal closes
    setTimeout(() => {
        setStep('email');
        setEmail('');
        setIsLoading(false);
    }, 300);
  }, [onClose]);

  
  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
        await resetPassword(email);
        setStep('success');
    } catch (err: any) {
        toast.error(err.message || 'Ocorreu um erro.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const titles: Record<Step, string> = {
    email: 'Recuperar Senha',
    success: 'Verifique seu E-mail!',
  };

  const renderContent = () => {
    switch(step) {
      case 'email':
        return (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <p className="text-sm text-gray-400">Insira seu e-mail para receber um link de redefinição de senha.</p>
            <div>
              <label htmlFor="reset-email" className="block text-sm font-medium text-gray-300 mb-1">Email</label>
              <input type="email" id="reset-email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg" />
            </div>
            <div className="flex justify-end pt-2 space-x-3">
              <button type="button" onClick={handleClose} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Cancelar</button>
              <button type="submit" disabled={isLoading} className="w-40 flex justify-center px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-800">
                  {isLoading ? <SpinnerIcon /> : 'Enviar Link'}
              </button>
            </div>
          </form>
        );
      case 'success':
        return (
          <div className="text-center space-y-4">
            <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500"/>
            <p className="text-gray-300">Se o e-mail estiver correto, você receberá um link para redefinir sua senha em breve.</p>
            <div className="flex justify-center pt-2">
              <button onClick={handleClose} className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700">Fechar</button>
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
