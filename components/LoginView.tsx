import React, { useState } from 'react';
import { type User, type SiteSettings } from '../types';
import { GoogleIcon } from './icons/GoogleIcon';

interface LoginViewProps {
  onLogin: (credentials: { email: string, pass: string }) => boolean;
  onRegister: (credentials: { email: string, pass: string }) => User | null;
  siteSettings: SiteSettings;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, onRegister, siteSettings }) => {
    const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
    
    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    
    // Register state
    const [regEmail, setRegEmail] = useState('');
    const [regPassword, setRegPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [regError, setRegError] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        const success = onLogin({ email: loginEmail, pass: loginPassword });
        if (!success) {
            setLoginError('E-mail ou senha inválidos.');
        }
    };

    const handleRegisterSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setRegError('');
        if (regPassword !== confirmPassword) {
            setRegError('As senhas não coincidem.');
            return;
        }
        if (regPassword.length < 6) {
            setRegError('A senha deve ter pelo menos 6 caracteres.');
            return;
        }
        onRegister({ email: regEmail, pass: regPassword });
    };

    const handleGoogleRegister = () => {
        // Mock implementation
        const googleEmail = prompt("Por favor, insira seu e-mail do Google para simular o cadastro:");
        if (googleEmail) {
            // In a real app, you'd get a token. Here, we just register them.
            // Using a random password since it won't be used for login again this way.
            const randomPassword = Math.random().toString(36).slice(-8); 
            onRegister({ email: googleEmail, pass: randomPassword });
        }
    };
    
    const TabButton: React.FC<{tab: 'login' | 'register', children: React.ReactNode}> = ({ tab, children }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`w-1/2 py-3 text-sm font-semibold transition-colors border-b-2 ${
                activeTab === tab 
                ? 'text-red-500 border-red-500'
                : 'text-gray-400 border-gray-700 hover:text-gray-200 hover:border-gray-500'
            }`}
        >
            {children}
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 flex font-sans">
            {/* Left side with image */}
            <div className="hidden lg:flex w-1/2 bg-gray-800 items-center justify-center relative">
                <img 
                    src={siteSettings.loginImageUrl || "https://images.unsplash.com/photo-1603525281789-b5f3a1f1a1d3?q=80&w=2574&auto=format&fit=crop"} 
                    alt="Jiu-Jitsu training" 
                    className="absolute h-full w-full object-cover opacity-20" 
                />
                <div className="relative z-10 text-center p-12">
                     <div className="flex items-center justify-center mb-4">
                        {siteSettings.logoUrl && (
                            <img src={siteSettings.logoUrl} alt={siteSettings.academyName} className="max-h-24 w-auto mr-4" />
                        )}
                        <h1 className={`font-bold text-red-600 ${siteSettings.logoUrl ? 'text-4xl' : 'text-5xl'}`}>{siteSettings.academyName}</h1>
                    </div>
                     <p className="text-xl text-gray-300">Sua jornada no tatame começa aqui.</p>
                </div>
            </div>

            {/* Right side with form */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                    <div className="flex border-b border-gray-700 mb-8">
                        <TabButton tab="login">Entrar</TabButton>
                        <TabButton tab="register">Cadastrar</TabButton>
                    </div>

                    {activeTab === 'login' ? (
                        // LOGIN FORM
                        <div className="animate-fade-in">
                            <div className="text-left mb-8">
                                <h2 className="text-3xl font-bold text-gray-100">Bem-vindo(a) de volta</h2>
                                <p className="mt-2 text-gray-400">Faça login para acessar sua conta.</p>
                            </div>
                            <form className="space-y-6" onSubmit={handleLoginSubmit}>
                                <div>
                                    <label htmlFor="email-login" className="block text-sm font-medium text-gray-300">Email</label>
                                    <input id="email-login" name="email" type="email" autoComplete="email" required value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="seu@email.com" />
                                </div>
                                <div>
                                    <label htmlFor="password-login" className="block text-sm font-medium text-gray-300">Senha</label>
                                    <input id="password-login" name="password" type="password" autoComplete="current-password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="••••••••" />
                                </div>
                                {loginError && <p className="text-sm text-red-500 text-center">{loginError}</p>}
                                <div className="text-xs text-gray-400 mt-2 p-3 bg-gray-800 rounded-md border border-gray-700">
                                    <p className="font-semibold text-gray-200">Credenciais de teste:</p>
                                    <p>Admin: <span className="font-mono text-gray-100">admin@bjj.com</span> / <span className="font-mono text-gray-100">admin123</span></p>
                                    <p>Usuário: <span className="font-mono text-gray-100">user@bjj.com</span> / <span className="font-mono text-gray-100">user123</span></p>
                                </div>
                                <div>
                                    <button type="submit" className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-300">Entrar</button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        // REGISTER FORM
                        <div className="animate-fade-in">
                             <div className="text-left mb-8">
                                <h2 className="text-3xl font-bold text-gray-100">Crie sua Conta</h2>
                                <p className="mt-2 text-gray-400">Junte-se a nós e comece sua jornada.</p>
                            </div>
                            <form className="space-y-4" onSubmit={handleRegisterSubmit}>
                                <div>
                                    <label htmlFor="email-reg" className="block text-sm font-medium text-gray-300">Email</label>
                                    <input id="email-reg" name="email" type="email" required value={regEmail} onChange={(e) => setRegEmail(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="seu@email.com" />
                                </div>
                                <div>
                                    <label htmlFor="password-reg" className="block text-sm font-medium text-gray-300">Senha</label>
                                    <input id="password-reg" name="password" type="password" required value={regPassword} onChange={(e) => setRegPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Mínimo 6 caracteres" />
                                </div>
                                <div>
                                    <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-300">Confirmar Senha</label>
                                    <input id="confirm-password" name="confirm-password" type="password" required value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="Repita a senha" />
                                </div>
                                {regError && <p className="text-sm text-red-500 text-center">{regError}</p>}
                                <div>
                                    <button type="submit" className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-300">Criar Conta</button>
                                </div>
                            </form>
                            <div className="my-6 flex items-center justify-center">
                                <span className="h-px bg-gray-700 flex-grow"></span>
                                <span className="px-4 text-sm text-gray-400">OU</span>
                                <span className="h-px bg-gray-700 flex-grow"></span>
                            </div>
                            <button onClick={handleGoogleRegister} className="w-full flex items-center justify-center py-3 px-4 rounded-lg text-sm font-medium text-gray-200 bg-gray-700 hover:bg-gray-600 transition-colors duration-300">
                               <GoogleIcon />
                               <span className="ml-3">Cadastrar com Google</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LoginView;