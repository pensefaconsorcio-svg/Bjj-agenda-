import React from 'react';
import { useAppStore } from '../store';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { FinancialIcon } from './icons/FinancialIcon';
import { type Belt } from '../types';

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

const beltColorMap: Record<Belt, string> = {
    branca: 'bg-white text-black',
    azul: 'bg-blue-600 text-white',
    roxa: 'bg-purple-600 text-white',
    marrom: 'bg-yellow-800 text-white',
    preta: 'bg-black text-white border border-gray-500',
};

const UserDetailView: React.FC = () => {
  const { 
    selectedUserId, 
    users, 
    financialTransactions, 
    categories, 
    setCurrentView 
  } = useAppStore(state => ({
    selectedUserId: state.selectedUserId,
    users: state.users,
    financialTransactions: state.financialTransactions,
    categories: state.financialCategories,
    setCurrentView: state.setCurrentView,
  }));

  const user = users.find(u => u.id === selectedUserId);

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-gray-400">Usuário não encontrado. Por favor, volte para a lista.</p>
        <button 
          onClick={() => setCurrentView('userManagement')} 
          className="mt-4 px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700"
        >
          Voltar
        </button>
      </div>
    );
  }
  
  const userTransactions = financialTransactions.filter(t => 
    t.description.toLowerCase().includes(user.name.toLowerCase()) && t.type === 'income'
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const paymentStatus = getPaymentStatus(user.paymentDueDate);
  const roleInfo = {
    user: { text: 'Usuário', color: 'bg-gray-600 text-gray-200' },
    mestre: { text: 'Mestre', color: 'bg-blue-300 text-blue-900' },
    admin: { text: 'Admin', color: 'bg-red-300 text-red-900' },
  };
  const beltName = user.belt.charAt(0).toUpperCase() + user.belt.slice(1);


  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <button 
          onClick={() => setCurrentView('userManagement')}
          className="flex items-center space-x-2 text-sm font-semibold text-gray-300 hover:text-red-500 transition-colors mb-4"
        >
          <ArrowLeftIcon />
          <span>Voltar para Gerenciamento</span>
        </button>
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center text-2xl font-bold text-white">
            {user.name.charAt(0)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-100">{user.name}</h1>
            <p className="text-gray-400">{user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-gray-400">Função</p>
              <p className={`mt-2 inline-block px-3 py-1 text-sm font-bold rounded-full ${roleInfo[user.role].color}`}>
                  {roleInfo[user.role].text}
              </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-gray-400">Faixa</p>
              <p className={`mt-2 inline-block px-3 py-1 text-sm font-bold rounded-full ${beltColorMap[user.belt]}`}>
                  {beltName}
              </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-gray-400">Status do Pagamento</p>
              <p className={`mt-2 inline-block px-3 py-1 text-sm font-bold rounded-full ${paymentStatus.color}`}>
                  {paymentStatus.text}
              </p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 text-center">
              <p className="text-sm font-medium text-gray-400">Data de Vencimento</p>
              <p className="mt-2 text-lg font-semibold text-gray-100 font-mono">
                  {user.paymentDueDate ? new Date(user.paymentDueDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}
              </p>
          </div>
      </div>

       <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
                <FinancialIcon />
                <h2 className="text-xl font-bold text-gray-100">Histórico de Pagamentos</h2>
            </div>
            {userTransactions.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b border-gray-700"><tr className="text-sm text-gray-400">
                            <th className="p-3">Descrição</th>
                            <th className="p-3">Categoria</th>
                            <th className="p-3">Data</th>
                            <th className="p-3 text-right">Valor</th>
                        </tr></thead>
                        <tbody>{userTransactions.map(t => {
                            const category = categories.find(c => c.id === t.categoryId);
                            return (<tr key={t.id} className="border-b border-gray-700/50">
                                <td className="p-3 font-medium text-gray-200">{t.description}</td>
                                <td className="p-3 text-sm text-gray-300">{category ? `${category.emoji} ${category.name}` : 'Sem Categoria'}</td>
                                <td className="p-3 text-sm text-gray-400 font-mono">{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                <td className="p-3 text-right font-semibold text-green-500">R$ {t.amount.toFixed(2)}</td>
                            </tr>);
                        })}</tbody>
                    </table>
                </div>
            ) : (
                <p className="text-center py-8 text-gray-500">Nenhum histórico de pagamento encontrado para este usuário.</p>
            )}
       </div>
    </div>
  );
};

export default UserDetailView;