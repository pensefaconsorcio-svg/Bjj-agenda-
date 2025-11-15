

import React, { useState } from 'react';
import { type User, type SiteSettings } from '../types';

interface LoginViewProps {
  onLogin: (credentials: { email: string, pass: string }) => boolean;
  siteSettings: SiteSettings;
}

const LoginView: React.FC<LoginViewProps> = ({ onLogin, siteSettings }) => {
    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    const handleLoginSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        const success = onLogin({ email: loginEmail, pass: loginPassword });
        if (!success) {
            setLoginError('E-mail ou senha inválidos.');
        }
    };

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
                    {/* LOGIN FORM */}
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
                                <p>Mestre: <span className="font-mono text-gray-100">mestre@bjj.com</span> / <span className="font-mono text-gray-100">mestre123</span></p>
                                <p>Usuário: <span className="font-mono text-gray-100">user@bjj.com</span> / <span className="font-mono text-gray-100">user123</span></p>
                            </div>
                            <div>
                                <button type="submit" className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-300">Entrar</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginView;