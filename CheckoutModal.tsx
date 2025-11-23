import React, { useState, useEffect } from 'react';
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
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isCheckoutOpen) {
      setIsProcessing(false);
      setPaymentSuccess(false);
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  
  const handleCopy = () => {
    if (settings.pix_key) {
        navigator.clipboard.writeText(settings.pix_key);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmCheckout = async () => {
    setIsProcessing(true);
    // Simulate gateway interaction
    await new Promise(resolve => setTimeout(resolve, settings.payment_gateway === 'manual' ? 500 : 2000));

    try {
        await processCartCheckout();
        setPaymentSuccess(true);
        setTimeout(() => {
            closeCheckout();
        }, 2500);
    } catch (e) {
        toast.error("Erro ao finalizar a compra.");
        if (settings.payment_gateway === 'manual') {
            setIsProcessing(false);
        }
    }
  };
  
  const gatewayName = {
      mercadopago: 'Mercado Pago',
      asaas: 'Asaas'
  }[settings.payment_gateway] || 'Gateway';


  const renderContent = () => {
    if (isProcessing) {
        return (
            <div className="text-center py-8 space-y-4">
                <SpinnerIcon className="h-12 w-12 text-red-500 mx-auto" />
                {paymentSuccess ? (
                    <>
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                        <h3 className="text-xl font-semibold text-gray-100">Compra Confirmada!</h3>
                        <p className="text-gray-400">Obrigado pela sua compra.</p>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl font-semibold text-gray-100">
                            {settings.payment_gateway === 'manual' ? 'Processando...' : `Conectando com ${gatewayName}...`}
                        </h3>
                        <p className="text-gray-400">Por favor, aguarde.</p>
                    </>
                )}
            </div>
        );
    }
    
    if (settings.payment_gateway === 'manual') {
      return (
        <div className="space-y-4">
          <div>
            <p className="text-gray-300 text-sm">Valor total da compra:</p>
            <p className="text-3xl font-bold text-red-500">R$ {total.toFixed(2)}</p>
          </div>
          
          <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
            <p className="text-sm font-medium text-gray-300 mb-1">Chave PIX:</p>
            <div className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
              <p className="font-mono text-gray-100 truncate pr-2" title={settings.pix_key}>{settings.pix_key || "Não configurada"}</p>
              <button 
                onClick={handleCopy}
                disabled={!settings.pix_key || copied}
                className="flex items-center space-x-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded-md transition-all shadow-sm disabled:bg-gray-500 disabled:cursor-not-allowed"
              >
                {copied ? <CheckCircleIcon/> : <ClipboardCopyIcon/>}
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
          </div>

          <div>
             <p className="text-sm font-medium text-gray-300 mb-1">Instruções:</p>
             <p className="text-gray-400 text-sm whitespace-pre-wrap">{settings.payment_instructions || "Contate a academia para finalizar o pagamento."}</p>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
              <button onClick={closeCheckout} className="px-6 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Fechar</button>
              <button onClick={handleConfirmCheckout} disabled={cartItems.length === 0} className="flex items-center justify-center w-48 px-6 py-2 rounded-md text-white bg-green-600 hover:bg-green-700">
                  Confirmar Pagamento
              </button>
          </div>
        </div>
      );
    }

    return (
        <div className="space-y-6 text-center">
            <p className="text-gray-300">Você será redirecionado para o ambiente seguro do <strong className="text-white">{gatewayName}</strong> para finalizar sua compra.</p>
            <div>
                <p className="text-gray-300 text-sm">Valor total:</p>
                <p className="text-3xl font-bold text-red-500">R$ {total.toFixed(2)}</p>
            </div>
             <div className="mt-6 flex justify-end space-x-3 pt-4">
              <button onClick={closeCheckout} className="px-6 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Cancelar</button>
              <button onClick={handleConfirmCheckout} className="flex-grow px-6 py-2 rounded-md text-white font-semibold bg-green-600 hover:bg-green-700">
                Pagar com {gatewayName}
              </button>
            </div>
        </div>
    );
  };
  
  return (
    <Modal isOpen={isCheckoutOpen} onClose={isProcessing ? () => {} : closeCheckout} title={paymentSuccess ? "Sucesso!" : `Finalizar Compra com ${gatewayName}`}>
      {renderContent()}
    </Modal>
  );
};

export default CheckoutModal;
