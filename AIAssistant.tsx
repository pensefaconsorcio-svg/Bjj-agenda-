import React, { useState, useRef, useEffect } from 'react';
import { MicrophoneIcon } from './icons/MicrophoneIcon';
import { useAppStore } from '../store';

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

const AIAssistant: React.FC = () => {
    const processAiCommand = useAppStore(state => state.processAiCommand);

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
                handleCommand(transcript);
            };
        } else {
             setStatusMessage('Reconhecimento de voz não suportado neste navegador.');
        }

        return () => {
            recognitionRef.current?.stop();
        };
    }, []);
    
    const handleCommand = async (command: string) => {
        setIsLoading(true);
        const result = await processAiCommand(command);
        setStatusMessage(result.message);
        setIsLoading(false);
        if (!isListening) {
            setTimeout(() => setStatusMessage('Clique no microfone para começar'), 3000);
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
