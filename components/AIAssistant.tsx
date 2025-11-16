import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, FunctionDeclaration, Type } from '@google/genai';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { type FinancialTransaction, type TransactionCategory, type AITransactionResult } from '../types';

// Fix: Add types for Web Speech API to fix "Cannot find name 'SpeechRecognition'" errors.
interface SpeechRecognitionAlternative {
    transcript: string;
}
interface SpeechRecognitionResult {
    [index: number]: SpeechRecognitionAlternative;
}
interface SpeechRecognitionResultList {
    [index: number]: SpeechRecognitionResult;
}
interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent {
    error: string;
}

interface SpeechRecognition {
    lang: string;
    continuous: boolean;
    interimResults: boolean;
    onstart: (() => void) | null;
    onend: (() => void) | null;
    onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
    onresult: ((event: SpeechRecognitionEvent) => void) | null;
    stop: () => void;
    start: () => void;
}

interface SpeechRecognitionStatic {
    new (): SpeechRecognition;
}

declare global {
    interface Window {
        SpeechRecognition: SpeechRecognitionStatic;
        webkitSpeechRecognition: SpeechRecognitionStatic;
    }
}

interface AIAssistantProps {
    transactions: FinancialTransaction[];
    categories: TransactionCategory[];
    onAddTransaction: (transaction: Omit<FinancialTransaction, 'id'>) => void;
    onDeleteTransaction: (transactionId: number) => void;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ transactions, categories, onAddTransaction, onDeleteTransaction }) => {
    const [isListening, setIsListening] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [statusMessage, setStatusMessage] = useState('Clique no microfone para começar');
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.lang = 'pt-BR';
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;

            recognitionRef.current.onstart = () => {
                setIsListening(true);
                setStatusMessage('Ouvindo...');
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
                 if(!isLoading) setStatusMessage('Clique no microfone para começar');
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setStatusMessage(`Erro: ${event.error}`);
                setIsListening(false);
            };

            recognitionRef.current.onresult = (event) => {
                const transcript = event.results[0][0].transcript;
                setStatusMessage(`Processando: "${transcript}"`);
                processCommand(transcript);
            };
        } else {
             setStatusMessage('Reconhecimento de voz não suportado neste navegador.');
        }

        return () => {
            recognitionRef.current?.stop();
        };
    }, []);
    
    const findClosestCategory = (name: string, type: 'income' | 'expense'): number => {
        const lowerCaseName = name.toLowerCase();
        const matchingCategories = categories.filter(c => c.type === type);
        
        // Exact match first
        let category = matchingCategories.find(c => c.name.toLowerCase() === lowerCaseName);
        if (category) return category.id;

        // Partial match
        category = matchingCategories.find(c => lowerCaseName.includes(c.name.toLowerCase()));
        if (category) return category.id;
        
        // Default to the first available category of that type
        return matchingCategories[0]?.id || 0;
    };

    const findTransactionToDelete = (description: string, amount?: number): number | null => {
        if (description.toLowerCase().includes('última')) {
            const sorted = [...transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            return sorted[0]?.id || null;
        }

        const lowerCaseDesc = description.toLowerCase();
        const candidates = transactions.filter(t => t.description.toLowerCase().includes(lowerCaseDesc));
        
        if (candidates.length === 0) return null;
        if (candidates.length === 1) return candidates[0].id;

        if (amount) {
            const specificCandidate = candidates.find(c => c.amount === amount);
            if (specificCandidate) return specificCandidate.id;
        }

        return candidates[0].id; // Return the most likely candidate if multiple match
    };

    const processCommand = async (command: string) => {
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
            
            const addTransactionDeclaration: FunctionDeclaration = {
                name: 'addTransaction',
                parameters: {
                    type: Type.OBJECT,
                    description: 'Adiciona uma nova transação financeira (entrada ou saída).',
                    properties: {
                        type: { type: Type.STRING, description: 'O tipo da transação, "income" para entrada/receita ou "expense" para saída/despesa.', enum: ['income', 'expense'] },
                        amount: { type: Type.NUMBER, description: 'O valor da transação.' },
                        description: { type: Type.STRING, description: 'Uma breve descrição da transação.' },
                        categoryName: { type: Type.STRING, description: 'O nome da categoria da transação (ex: Mensalidades, Aluguel).' },
                    },
                    required: ['type', 'amount', 'description', 'categoryName'],
                },
            };

            const removeTransactionDeclaration: FunctionDeclaration = {
                 name: 'removeTransaction',
                parameters: {
                    type: Type.OBJECT,
                    description: 'Remove uma transação financeira existente.',
                    properties: {
                        amount: { type: Type.NUMBER, description: 'O valor da transação a ser removida.' },
                        description: { type: Type.STRING, description: 'A descrição da transação a ser removida. Pode ser "última" para remover a mais recente.' },
                    },
                    required: ['description'],
                },
            };
            
            const categoryList = categories.map(c => c.name).join(', ');
            const systemInstruction = `Você é um assistente financeiro de uma academia de Jiu-Jitsu. Sua tarefa é interpretar comandos de voz para adicionar ou remover transações.
            - Use a função 'addTransaction' para criar novas transações. "Entrada", "receita" ou "ganho" significam 'income'. "Saída", "despesa" ou "gasto" significam 'expense'.
            - Use a função 'removeTransaction' para apagar transações. "Remover", "apagar" ou "excluir" são palavras-chave. Se o usuário disser "última", use "última" na descrição.
            - As categorias disponíveis são: ${categoryList}. Tente associar o comando a uma delas.`;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: command,
                config: {
                    tools: [{ functionDeclarations: [addTransactionDeclaration, removeTransactionDeclaration] }],
                    systemInstruction
                }
            });

            if (response.functionCalls && response.functionCalls.length > 0) {
                const fc = response.functionCalls[0];
                if (fc.name === 'addTransaction') {
                    const { type, amount, description, categoryName } = fc.args;
                    const categoryId = findClosestCategory(categoryName, type);
                    if (categoryId === 0) {
                        throw new Error(`Nenhuma categoria do tipo '${type}' encontrada.`);
                    }
                    onAddTransaction({
                        type,
                        amount,
                        description,
                        categoryId,
                        date: new Date().toISOString().split('T')[0],
                    });
                    setStatusMessage(`✅ Entrada de R$ ${amount.toFixed(2)} adicionada!`);
                } else if (fc.name === 'removeTransaction') {
                    const { description, amount } = fc.args;
                    const transactionId = findTransactionToDelete(description, amount);
                    if (transactionId) {
                        onDeleteTransaction(transactionId);
                        setStatusMessage('🗑️ Transação removida com sucesso!');
                    } else {
                        setStatusMessage('⚠️ Transação não encontrada.');
                    }
                }
            } else {
                setStatusMessage('Não entendi o comando. Tente novamente.');
            }

        } catch (error) {
            console.error('AI processing error:', error);
            setStatusMessage('Houve um erro ao processar o comando.');
        } finally {
            setIsLoading(false);
            if (!isListening) {
                setTimeout(() => setStatusMessage('Clique no microfone para começar'), 3000);
            }
        }
    };
    

    const handleListenClick = () => {
        if (!recognitionRef.current) {
            alert('Reconhecimento de voz não é suportado neste navegador.');
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };

    return (
        <div className="flex items-center gap-4">
            <button
                onClick={handleListenClick}
                disabled={isLoading}
                className={`p-3 rounded-full transition-colors duration-300 disabled:opacity-50 disabled:cursor-wait ${
                    isListening ? 'bg-red-700 animate-pulse' : 'bg-red-600 hover:bg-red-700'
                }`}
                aria-label="Ativar assistente de IA por voz"
            >
                <MicrophoneIcon className="text-white" />
            </button>
            <div className="text-sm">
                <p className="font-semibold text-gray-200">Assistente de IA</p>
                <p className="text-gray-400">{isLoading ? 'Processando...' : statusMessage}</p>
            </div>
        </div>
    );
};

export default AIAssistant;
