import React, { useState, useEffect } from 'react';
import { type PromotionPlan, type SiteSettings } from '../types';
import Modal from './Modal';
import { PlusCircleIcon } from './icons/PlusCircleIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ClipboardCopyIcon } from './icons/ClipboardCopyIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { useAppStore } from '../store';

interface SubscriptionPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  plan: PromotionPlan | null;
  settings: SiteSettings;
}

const SubscriptionPaymentModal: React.FC<SubscriptionPaymentModalProps> = ({ isOpen, onClose, plan, settings }) => {
  const [copied, setCopied] = useState(false);
  const { processPlanPayment } = useAppStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsProcessing(false);
      setPaymentSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen || !plan) return null;

  const total = plan.total ?? plan.price;
  
  const handleCopy = () => {
    if (settings.pixKey) {
        navigator.clipboard.writeText(settings.pixKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleConfirmPayment = async () => {
    if (!plan) return;
    setIsProcessing(true);
    
    // Simulating gateway interaction
    if (settings.paymentGateway !== 'manual') {
        await new Promise(resolve => setTimeout(resolve, 2000));
    }

    try {
      await processPlanPayment(plan.id);
      setPaymentSuccess(true);
      setTimeout(() => {
          onClose();
      }, 2500);
    } finally {
      if (settings.paymentGateway === 'manual') {
        setIsProcessing(false);
      }
    }
  };

  const gatewayName = {
      mercadopago: 'Mercado Pago',
      asaas: 'Asaas'
  }[settings.paymentGateway] || 'Gateway';


  const renderContent = () => {
    if (isProcessing) {
        return (
            <div className="text-center py-8 space-y-4">
                <SpinnerIcon className="h-12 w-12 text-red-500 mx-auto" />
                {paymentSuccess ? (
                    <>
                        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto" />
                        <h3 className="text-xl font-semibold text-gray-100">Pagamento Confirmado!</h3>
                        <p className="text-gray-400">Seu plano foi ativado com sucesso.</p>
                    </>
                ) : (
                    <>
                        <h3 className="text-xl font-semibold text-gray-100">
                            {settings.paymentGateway === 'manual' ? 'Processando...' : `Conectando com ${gatewayName}...`}
                        </h3>
                        <p className="text-gray-400">Por favor, aguarde.</p>
                    </>
                )}
            </div>
        );
    }
    
    if (settings.paymentGateway === 'manual') {
      return (
        <div className="space-y-4">
          <div>
            <p className="text-gray-300 text-sm">Valor total do plano:</p>
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
              <button onClick={onClose} className="px-6 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Fechar</button>
              <button onClick={handleConfirmPayment} className="flex items-center justify-center w-48 px-6 py-2 rounded-md text-white bg-green-600 hover:bg-green-700">Confirmar Pagamento</button>
          </div>
        </div>
      );
    }
    
    return (
        <div className="space-y-6 text-center">
            <p className="text-gray-300">Você será redirecionado para o ambiente seguro do <strong className="text-white">{gatewayName}</strong> para finalizar sua compra.</p>
            <div>
                <p className="text-gray-300 text-sm">Plano:</p>
                <p className="text-xl font-bold text-gray-100">{plan.name}</p>
            </div>
             <div>
                <p className="text-gray-300 text-sm">Valor total:</p>
                <p className="text-3xl font-bold text-red-500">R$ {total.toFixed(2)}</p>
            </div>
             <div className="mt-6 flex justify-end space-x-3 pt-4">
              <button onClick={onClose} className="px-6 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Cancelar</button>
              <button onClick={handleConfirmPayment} className="flex-grow px-6 py-2 rounded-md text-white font-semibold bg-green-600 hover:bg-green-700">
                Pagar com {gatewayName}
              </button>
            </div>
        </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Pagar ${plan.name}`}>
        {renderContent()}
    </Modal>
  );
};


const initialFormState: Omit<PromotionPlan, 'id'> = {
  name: '',
  price: 0,
  duration: 'mês',
  total: null,
  features: [],
  isBestValue: false,
};

const Checkmark: React.FC = () => (
    <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
    </svg>
)

const PromotionsView: React.FC = () => {
  const { user, plans, siteSettings, addPromotion, updatePromotion, deletePromotion } = useAppStore(state => ({
    user: state.currentUser!,
    plans: state.promotions,
    siteSettings: state.siteSettings,
    addPromotion: state.addPromotion,
    updatePromotion: state.updatePromotion,
    deletePromotion: state.deletePromotion,
  }));
  
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<PromotionPlan | null>(null);
  const [formData, setFormData] = useState<Omit<PromotionPlan, 'id'>>(initialFormState);
  const [featuresString, setFeaturesString] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PromotionPlan | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const isAdminOrMestre = user.role === 'admin' || user.role === 'mestre';

  useEffect(() => {
    if (editingPlan) {
      setFormData(editingPlan);
      setFeaturesString(editingPlan.features.join(', '));
    } else {
      setFormData(initialFormState);
      setFeaturesString('');
    }
  }, [editingPlan]);

  const handleOpenAddModal = () => {
    setEditingPlan(null);
    setIsFormModalOpen(true);
  };

  const handleOpenEditModal = (plan: PromotionPlan) => {
    setEditingPlan(plan);
    setIsFormModalOpen(true);
  };

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false);
    setEditingPlan(null);
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
        setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
        setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) : value }));
    }
  };
  
  const handleFeaturesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setFeaturesString(e.target.value);
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const finalPlanData = { ...formData, features: featuresString.split(',').map(f => f.trim()).filter(f => f) };
    try {
        if (editingPlan) {
            await updatePromotion({ ...finalPlanData, id: editingPlan.id });
        } else {
            await addPromotion(finalPlanData);
        }
        handleCloseFormModal();
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = (planId: number) => {
    if (window.confirm('Tem certeza que deseja excluir este plano?')) {
      deletePromotion(planId);
    }
  };
  
  const handleSubscribeClick = (plan: PromotionPlan) => {
    setSelectedPlan(plan);
  };

  return (
    <>
      <div className="animate-fade-in-up">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-100">Planos e Preços</h1>
          <p className="mt-4 text-lg text-gray-400">Escolha o plano que melhor se adapta à sua jornada no tatame.</p>
        </div>
        
        {isAdminOrMestre && (
             <div className="flex justify-end mb-6">
                <button 
                    onClick={handleOpenAddModal} 
                    className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-300 shadow-sm"
                >
                    <PlusCircleIcon />
                    <span>Adicionar Plano</span>
                </button>
            </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`bg-gray-800 rounded-xl p-8 shadow-sm flex flex-col border-2 relative group ${
                plan.isBestValue 
                  ? 'border-red-600 shadow-red-900/50' 
                  : 'border-gray-700'
              } transition-all duration-300 hover:border-red-500 hover:-translate-y-2`}
            >
              {isAdminOrMestre && (
                  <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => handleOpenEditModal(plan)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-700 rounded-full"><EditIcon /></button>
                      <button onClick={() => handleDelete(plan.id)} className="p-2 text-gray-400 hover:text-red-500 bg-gray-700 rounded-full"><TrashIcon /></button>
                  </div>
              )}
              {plan.isBestValue && (
                <div className="absolute top-0 right-0 -mt-3 mr-3">
                  <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Melhor Valor</span>
                </div>
              )}
              
              <h2 className="text-2xl font-semibold text-gray-100">{plan.name}</h2>
              
              <div className="mt-4">
                <span className="text-5xl font-bold text-white">R${plan.price}</span>
                <span className="text-lg text-gray-400">/{plan.duration}</span>
              </div>

              {plan.total && (
                <p className="mt-2 text-sm text-gray-400">Pagamento único de R$ {plan.total}</p>
              )}
              
              <ul className="mt-8 space-y-4 text-gray-300 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start">
                    <Checkmark />
                    <span className="ml-3">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <button
                onClick={() => handleSubscribeClick(plan)}
                className={`mt-10 w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
                  plan.isBestValue 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-gray-700 hover:bg-red-600'
                }`}
              >
                Assinar Agora
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Plan Modal for Admins */}
      <Modal isOpen={isFormModalOpen} onClose={handleCloseFormModal} title={editingPlan ? 'Editar Plano' : 'Adicionar Novo Plano'}>
        <form onSubmit={handleFormSubmit} className="space-y-4">
          <input type="text" name="name" placeholder="Nome do Plano" value={formData.name} onChange={handleFormChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
          <input type="number" name="price" placeholder="Preço por mês" value={formData.price} onChange={handleFormChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
          <input type="text" name="duration" placeholder="Duração (ex: mês)" value={formData.duration} onChange={handleFormChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
          <input type="number" name="total" placeholder="Valor Total (opcional)" value={formData.total || ''} onChange={handleFormChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
          <input type="text" name="features" placeholder="Benefícios (separados por vírgula)" value={featuresString} onChange={handleFeaturesChange} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
          <div className="flex items-center">
            <input type="checkbox" id="isBestValue" name="isBestValue" checked={formData.isBestValue} onChange={handleFormChange} className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500" />
            <label htmlFor="isBestValue" className="ml-2 block text-sm text-gray-300">Marcar como "Melhor Valor"?</label>
          </div>
          <div className="mt-6 flex justify-end space-x-4 pt-4">
            <button type="button" onClick={handleCloseFormModal} className="px-4 py-2 rounded-md text-gray-200 bg-gray-600 hover:bg-gray-500">Cancelar</button>
            <button type="submit" disabled={isSaving} className="flex items-center justify-center w-28 px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-red-800">
                {isSaving ? <SpinnerIcon /> : 'Salvar'}
            </button>
          </div>
        </form>
      </Modal>

      <SubscriptionPaymentModal
        isOpen={!!selectedPlan}
        onClose={() => setSelectedPlan(null)}
        plan={selectedPlan}
        settings={siteSettings}
      />
    </>
  );
};

export default PromotionsView;
