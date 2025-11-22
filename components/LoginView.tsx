import React, { useState } from 'react';
import ForgotPasswordModal from './ForgotPasswordModal';
import { useAppStore } from '../store';
import { SpinnerIcon } from './icons/SpinnerIcon';

const LoginView: React.FC = () => {
    const { login, siteSettings } = useAppStore(state => ({
        login: state.login,
        siteSettings: state.siteSettings,
    }));

    // Login state
    const [loginEmail, setLoginEmail] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

    const handleLoginSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        setIsLoading(true);
        try {
            const error = await login({ email: loginEmail, pass: loginPassword });
            if (error) {
                setLoginError(error);
            }
        } catch (err: any) {
            setLoginError(err.message || "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
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
                                <div className="flex items-center justify-between">
                                    <label htmlFor="password-login" className="block text-sm font-medium text-gray-300">Senha</label>
                                    <button 
                                        type="button" 
                                        onClick={() => setIsForgotPasswordOpen(true)}
                                        className="text-sm font-medium text-red-500 hover:text-red-400 focus:outline-none"
                                    >
                                        Esqueci minha senha
                                    </button>
                                </div>
                                <input id="password-login" name="password" type="password" autoComplete="current-password" required value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} className="mt-1 block w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-red-500" placeholder="••••••••" />
                            </div>

                            {loginError && <p className="text-sm text-red-500 text-center">{loginError}</p>}
                            
                            <div className="mt-4 p-4 bg-gray-800 border border-gray-700 rounded-lg space-y-2">
                                <p className="text-sm font-medium text-gray-300">Use uma conta de teste:</p>
                                <div className="text-xs text-gray-400 space-y-1">
                                    <p><strong className="font-semibold text-gray-300">Admin:</strong> `admin@bjj.com` / `admin123`</p>
                                    <p><strong className="font-semibold text-gray-300">Mestre:</strong> `mestre@bjj.com` / `mestre123`</p>
                                    <p><strong className="font-semibold text-gray-300">Aluno 1:</strong> `user@bjj.com` / `user123`</p>
                                    <p><strong className="font-semibold text-gray-300">Aluno 2:</strong> `joana@bjj.com` / `user123`</p>
                                </div>
                            </div>

                            <div>
                                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors duration-300 disabled:bg-red-800">
                                  {isLoading ? <SpinnerIcon /> : 'Entrar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <ForgotPasswordModal 
                isOpen={isForgotPasswordOpen}
                onClose={() => setIsForgotPasswordOpen(false)}
            />
        </div>
    );
};

export default LoginView;