import React, { useState } from 'react';
// Fix: Import 'toast' from 'react-hot-toast' to handle notifications.
import toast from 'react-hot-toast';
import Modal from './Modal';
import { ClipboardCopyIcon } from './icons/ClipboardCopyIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { useAppStore } from '../store';

const CheckoutModal: React.FC = () => {
  const { isCheckoutOpen, cartItems, settings, closeCheckout, processCartCheckout } = useAppStore(state => ({
    isCheckoutOpen: state.isCheckoutOpen,
    cartItems: state.cart,
    settings: state.siteSettings,
    closeCheckout: state.closeCheckout,
    processCartCheckout: state.processCartCheckout,
  }));
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isCheckoutOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const handleCopy = () => {
    if (settings.pixKey) {
        navigator.clipboard.writeText(settings.pixKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmCheckout = async () => {
    setIsProcessing(true);
    try {
        await processCartCheckout();
        // The closeCheckout is called inside the store action upon success
    } catch (e) {
        toast.error("Erro ao finalizar a compra.");
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <Modal isOpen={isCheckoutOpen} onClose={closeCheckout} title="Finalizar Compra com PIX">
      <div className="space-y-4">
        <div>
          <p className="text-gray-300 text-sm">Valor total da compra:</p>
          <p className="text-3xl font-bold text-red-500">R$ {total.toFixed(2)}</p>
        </div>
        
        <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
          <p className="text-sm font-medium text-gray-300 mb-1">Chave PIX:</p>
          <div className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
            <p className="font-mono text-gray-100 truncate pr-2" title={settings.pixKey}>{settings.pixKey || "Não configurada"}</p>
            <button 
              onClick={handleCopy}
              disabled={!settings.pixKey || copied}
              className="flex items-center space-x-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition-all shadow-sm disabled:bg-gray-500 disabled:cursor-not-allowed"
            >
              {copied ? <CheckCircleIcon/> : <ClipboardCopyIcon/>}
              <span>{copied ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>
        </div>

        <div>
           <p className="text-sm font-medium text-gray-300 mb-1">Instruções:</p>
           <p className="text-gray-400 text-sm whitespace-pre-wrap">{settings.paymentInstructions || "Contate a academia para finalizar o pagamento."}</p>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
            <button 
              onClick={closeCheckout} 
              disabled={isProcessing}
              className="px-6 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
                Fechar
            </button>
            <button 
                onClick={handleConfirmCheckout}
                disabled={isProcessing || cartItems.length === 0}
                className="flex items-center justify-center w-48 px-6 py-2 rounded-md text-white bg-green-600 hover:bg-green-700 transition-colors disabled:bg-green-800 disabled:cursor-not-allowed"
            >
                {isProcessing ? <SpinnerIcon /> : 'Confirmar Pagamento'}
            </button>
        </div>

      </div>
    </Modal>
  );
};

export default CheckoutModal;