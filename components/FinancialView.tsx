import React, { useState, useMemo } from 'react';
import { type FinancialTransaction, type TransactionCategory, type Belt } from '../types';
import Modal from './Modal';
import { TrashIcon } from './icons/TrashIcon';
import { ArrowUpCircleIcon } from './icons/ArrowUpCircleIcon';
import { ArrowDownCircleIcon } from './icons/ArrowDownCircleIcon';
import AIAssistant from './AIAssistant';
import { useAppStore } from '../store';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const getPaymentStatus = (dueDate: string | null) => {
    if (!dueDate) return { text: 'N/A', color: 'bg-gray-600 text-gray-200' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDateObj = new Date(dueDate + 'T00:00:00');
    if (dueDateObj < today) return { text: 'Vencido', color: 'bg-red-300 text-red-900' };
    if (dueDateObj.getTime() === today.getTime()) return { text: 'Vence hoje', color: 'bg-yellow-300 text-yellow-900' };
    return { text: 'Em dia', color: 'bg-green-300 text-green-900' };
};

const beltColorMap: Record<Belt, string> = {
    branca: 'bg-white text-black',
    azul: 'bg-blue-600 text-white',
    roxa: 'bg-purple-600 text-white',
    marrom: 'bg-yellow-800 text-white',
    preta: 'bg-black text-white border border-gray-500',
};

const TransactionModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    type: 'income' | 'expense',
    categories: TransactionCategory[],
    onSave: (transaction: Omit<FinancialTransaction, 'id'>) => void,
}> = ({ isOpen, onClose, type, categories, onSave }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [categoryId, setCategoryId] = useState<number | ''>('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!description || !amount || !date || categoryId === '') return;
        onSave({ description, amount: parseFloat(amount), date, categoryId: Number(categoryId), type });
        onClose();
    };
    
    const filteredCategories = categories.filter(c => c.type === type);

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`Adicionar ${type === 'income' ? 'Entrada' : 'Saída'}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input type="text" placeholder="Descrição" value={description} onChange={e => setDescription(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                <input type="number" placeholder="Valor (R$)" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                <select value={categoryId} onChange={e => setCategoryId(Number(e.target.value))} required className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg">
                    <option value="" disabled>Selecione uma categoria</option>
                    {filteredCategories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                </select>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md bg-gray-600 hover:bg-gray-500">Cancelar</button>
                    <button type="submit" className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700">Salvar</button>
                </div>
            </form>
        </Modal>
    );
};

const CategoryModal: React.FC<{
    isOpen: boolean,
    onClose: () => void,
    categories: TransactionCategory[],
    onAdd: (category: Omit<TransactionCategory, 'id'>) => void,
    onUpdate: (category: TransactionCategory) => void,
    onDelete: (id: number) => void
}> = ({ isOpen, onClose, categories, onAdd, onUpdate, onDelete }) => {
    const [name, setName] = useState('');
    const [emoji, setEmoji] = useState('');
    const [type, setType] = useState<'income' | 'expense'>('income');

    const handleAdd = () => {
        if (!name || !emoji) return;
        onAdd({ name, emoji, type });
        setName(''); setEmoji('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Gerenciar Categorias">
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2 p-2 bg-gray-900 rounded-lg">
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="Nome" className="col-span-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                    <input value={emoji} onChange={e => setEmoji(e.target.value)} placeholder="Emoji" className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                    <select value={type} onChange={e => setType(e.target.value as any)} className="col-span-2 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg">
                        <option value="income">Entrada</option>
                        <option value="expense">Saída</option>
                    </select>
                    <button onClick={handleAdd} className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700">Adicionar</button>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-2 pr-2">
                    {categories.map(c => (
                        <div key={c.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                            <span>{c.emoji} {c.name} <span className={`text-xs ${c.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>({c.type === 'income' ? 'Entrada' : 'Saída'})</span></span>
                            <button onClick={() => onDelete(c.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon/></button>
                        </div>
                    ))}
                </div>
            </div>
        </Modal>
    )
}

const FinancialChart: React.FC<{ transactions: FinancialTransaction[] }> = ({ transactions }) => {
    const chartData = useMemo(() => {
        const dataByMonth: { [key: string]: { name: string; income: number; expense: number } } = {};
        const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"];

        transactions.forEach(t => {
            const date = new Date(t.date + 'T00:00:00');
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            if (!dataByMonth[monthKey]) {
                dataByMonth[monthKey] = {
                    name: `${monthNames[date.getMonth()]}/${String(date.getFullYear()).slice(2)}`,
                    income: 0,
                    expense: 0,
                };
            }
            if (t.type === 'income') {
                dataByMonth[monthKey].income += t.amount;
            } else {
                dataByMonth[monthKey].expense += t.amount;
            }
        });

        return Object.values(dataByMonth).sort((a,b) => {
            const [aMonth, aYear] = a.name.split('/');
            const [bMonth, bYear] = b.name.split('/');
            if (aYear !== bYear) return Number(aYear) - Number(bYear);
            return monthNames.indexOf(aMonth) - monthNames.indexOf(bMonth);
        }).slice(-6); // Last 6 months
    }, [transactions]);

    if (chartData.length === 0) {
        return <div className="text-center text-gray-500 py-8">Dados insuficientes para gerar o gráfico.</div>;
    }

    return (
        <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
                <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#4B5563" />
                    <XAxis dataKey="name" tick={{ fill: '#9CA3AF' }} />
                    <YAxis tick={{ fill: '#9CA3AF' }} tickFormatter={(value) => `R$${value}`} />
                    <Tooltip
                        cursor={{ fill: 'rgba(156, 163, 175, 0.1)' }}
                        contentStyle={{
                            backgroundColor: '#1F2937',
                            borderColor: '#4B5563',
                            color: '#F9FAFB'
                        }}
                        formatter={(value: number) => `R$ ${value.toFixed(2)}`}
                    />
                    <Legend wrapperStyle={{ color: '#D1D5DB' }} />
                    <Bar dataKey="income" fill="#10B981" name="Entradas" />
                    <Bar dataKey="expense" fill="#EF4444" name="Saídas" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

const FinancialView: React.FC = () => {
    const { 
        users, 
        transactions, 
        categories, 
        addTransaction, 
        deleteTransaction, 
        addCategory, 
        updateCategory, 
        deleteCategory,
        updateUser
    } = useAppStore(state => ({
        users: state.users,
        transactions: state.financialTransactions,
        categories: state.financialCategories,
        addTransaction: state.addTransaction,
        deleteTransaction: state.deleteTransaction,
        addCategory: state.addCategory,
        updateCategory: state.updateCategory,
        deleteCategory: state.deleteCategory,
        updateUser: state.updateUser,
    }));
    
    const [activeTab, setActiveTab] = useState<'overview' | 'students'>('overview');
    const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);
    const [transactionType, setTransactionType] = useState<'income' | 'expense'>('income');
    const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);

    const { totalIncome, totalExpense, balance } = useMemo(() => {
        const totalIncome = transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
        const totalExpense = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
        return { totalIncome, totalExpense, balance: totalIncome - totalExpense };
    }, [transactions]);
    
    const handleOpenTransactionModal = (type: 'income' | 'expense') => {
        setTransactionType(type);
        setTransactionModalOpen(true);
    }
  
    const sortedTransactions = [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  return (
    <div className="animate-fade-in-up space-y-8">
        <div>
            <h1 className="text-3xl font-bold text-gray-100">Financeiro</h1>
            <p className="mt-2 text-gray-400">Acompanhe o fluxo de caixa e o status de pagamento dos alunos.</p>
        </div>
      
        <div className="border-b border-gray-700">
            <nav className="-mb-px flex space-x-6">
                <button onClick={() => setActiveTab('overview')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'overview' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Visão Geral & Transações</button>
                <button onClick={() => setActiveTab('students')} className={`py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'students' ? 'border-red-500 text-red-500' : 'border-transparent text-gray-400 hover:text-gray-200'}`}>Status dos Alunos</button>
            </nav>
        </div>

        {activeTab === 'overview' && (
            <div className="space-y-6">
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6"><p className="text-sm font-medium text-gray-400">Total de Entradas</p><p className="text-3xl font-bold text-green-500 mt-2">R$ {totalIncome.toFixed(2)}</p></div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6"><p className="text-sm font-medium text-gray-400">Total de Saídas</p><p className="text-3xl font-bold text-red-500 mt-2">R$ {totalExpense.toFixed(2)}</p></div>
                    <div className="bg-gray-800 border border-gray-700 rounded-xl p-6"><p className="text-sm font-medium text-gray-400">Saldo Atual</p><p className={`text-3xl font-bold ${balance >= 0 ? 'text-blue-500' : 'text-yellow-500'} mt-2`}>R$ {balance.toFixed(2)}</p></div>
                </div>
                
                 <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <h2 className="text-xl font-bold text-gray-100 mb-4">Resumo Mensal</h2>
                    <FinancialChart transactions={transactions} />
                </div>

                <div className="bg-gray-800 border border-gray-700 rounded-xl p-6">
                    <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                         <h2 className="text-xl font-bold text-gray-100">Últimas Transações</h2>
                        <div className="flex flex-wrap gap-2">
                             <AIAssistant />
                             <button onClick={() => handleOpenTransactionModal('income')} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-green-600/20 text-green-400 hover:bg-green-600/40">Adicionar Entrada</button>
                             <button onClick={() => handleOpenTransactionModal('expense')} className="flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/40">Adicionar Saída</button>
                             <button onClick={() => setCategoryModalOpen(true)} className="px-3 py-2 text-sm font-semibold rounded-lg bg-gray-600 hover:bg-gray-500">Categorias</button>
                        </div>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="border-b border-gray-700"><tr className="text-sm text-gray-400">
                                <th className="p-3">Tipo</th><th className="p-3">Descrição</th><th className="p-3">Categoria</th><th className="p-3">Data</th><th className="p-3 text-right">Valor</th><th className="p-3"></th>
                            </tr></thead>
                            <tbody>{sortedTransactions.map(t => {
                                const category = categories.find(c => c.id === t.categoryId);
                                return (<tr key={t.id} className="border-b border-gray-700/50 hover:bg-gray-700/30">
                                    <td className="p-3">{t.type === 'income' ? <ArrowUpCircleIcon className="text-green-500"/> : <ArrowDownCircleIcon className="text-red-500"/>}</td>
                                    <td className="p-3 font-medium text-gray-200">{t.description}</td>
                                    <td className="p-3 text-sm text-gray-300">{category ? `${category.emoji} ${category.name}` : 'Sem Categoria'}</td>
                                    <td className="p-3 text-sm text-gray-400 font-mono">{new Date(t.date + 'T00:00:00').toLocaleDateString('pt-BR')}</td>
                                    <td className={`p-3 text-right font-semibold ${t.type === 'income' ? 'text-green-500' : 'text-red-500'}`}>R$ {t.amount.toFixed(2)}</td>
                                    <td className="p-3 text-right"><button onClick={() => deleteTransaction(t.id)} className="p-1 text-gray-500 hover:text-red-400"><TrashIcon /></button></td>
                                </tr>);
                            })}</tbody>
                        </table>
                         {transactions.length === 0 && <p className="text-center py-8 text-gray-500">Nenhuma transação registrada.</p>}
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'students' && (
            <div className="bg-gray-800 border border-gray-700 rounded-xl shadow-sm overflow-hidden">
                <h2 className="text-xl font-bold text-gray-100 p-6">Status de Pagamento dos Alunos</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-900/50"><tr>
                            <th className="p-4 text-sm font-semibold text-gray-300">Aluno</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Email</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Faixa</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Vencimento</th>
                            <th className="p-4 text-sm font-semibold text-gray-300">Status</th>
                        </tr></thead>
                        <tbody className="divide-y divide-gray-700">{users.filter(u => u.role === 'user').map(student => {
                            const paymentStatus = getPaymentStatus(student.paymentDueDate);
                            return (<tr key={student.id} className="hover:bg-gray-700/50">
                                <td className="p-4 font-medium text-gray-100">{student.name}</td>
                                <td className="p-4 text-gray-400">{student.email}</td>
                                <td className="p-4">
                                    <select
                                        value={student.belt}
                                        onChange={(e) => updateUser({ ...student, belt: e.target.value as Belt })}
                                        onClick={(e) => e.stopPropagation()}
                                        className={`px-3 py-1 text-sm font-semibold rounded-lg border-transparent focus:ring-2 focus:ring-red-500 focus:outline-none ${beltColorMap[student.belt]}`}
                                    >
                                        <option value="branca" className="bg-gray-700 text-white">Branca</option>
                                        <option value="azul" className="bg-gray-700 text-white">Azul</option>
                                        <option value="roxa" className="bg-gray-700 text-white">Roxa</option>
                                        <option value="marrom" className="bg-gray-700 text-white">Marrom</option>
                                        <option value="preta" className="bg-gray-700 text-white">Preta</option>
                                    </select>
                                </td>
                                <td className="p-4 text-gray-300 font-mono text-sm">{student.paymentDueDate ? new Date(student.paymentDueDate + 'T00:00:00').toLocaleDateString('pt-BR') : 'N/A'}</td>
                                <td className="p-4"><span className={`px-2 py-1 text-xs font-bold rounded-full ${paymentStatus.color}`}>{paymentStatus.text}</span></td>
                            </tr>);
                        })}</tbody>
                    </table>
                </div>
                 {users.filter(u => u.role === 'user').length === 0 && <div className="text-center py-12 text-gray-400"><p>Nenhum aluno cadastrado.</p></div>}
            </div>
        )}

        <TransactionModal isOpen={isTransactionModalOpen} onClose={() => setTransactionModalOpen(false)} type={transactionType} categories={categories} onSave={addTransaction}/>
        <CategoryModal isOpen={isCategoryModalOpen} onClose={() => setCategoryModalOpen(false)} categories={categories} onAdd={addCategory} onUpdate={updateCategory} onDelete={deleteCategory}/>
    </div>
  );
};

export default FinancialView;