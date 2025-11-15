import React, { useState, useEffect } from 'react';
import { type SiteSettings } from '../types';

interface SiteSettingsViewProps {
  currentSettings: SiteSettings;
  onSave: (newSettings: SiteSettings) => void;
}

const SiteSettingsView: React.FC<SiteSettingsViewProps> = ({ currentSettings, onSave }) => {
  const [settings, setSettings] = useState<SiteSettings>(currentSettings);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings(prev => ({ ...prev, [name]: reader.result as string }));
      };
      reader.readAsDataURL(files[0]);
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(settings);
  };

  return (
    <div className="animate-fade-in-up max-w-2xl mx-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* General Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-200 border-b border-gray-700 pb-2">Informações Gerais</h3>
            <div>
              <label htmlFor="academyName" className="block text-sm font-medium text-gray-300 mb-1">Nome da Academia</label>
              <input 
                type="text" 
                id="academyName" 
                name="academyName" 
                value={settings.academyName} 
                onChange={handleChange} 
                required 
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-200 border-b border-gray-700 pb-2">Redes Sociais</h3>
             <div>
              <label htmlFor="instagramUrl" className="block text-sm font-medium text-gray-300 mb-1">URL do Instagram</label>
              <input 
                type="url" 
                id="instagramUrl" 
                name="instagramUrl" 
                value={settings.instagramUrl} 
                onChange={handleChange} 
                placeholder="https://instagram.com/sua-academia"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>
             <div>
              <label htmlFor="facebookUrl" className="block text-sm font-medium text-gray-300 mb-1">URL do Facebook</label>
              <input 
                type="url" 
                id="facebookUrl" 
                name="facebookUrl" 
                value={settings.facebookUrl} 
                onChange={handleChange} 
                placeholder="https://facebook.com/sua-academia"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>
             <div>
              <label htmlFor="xUrl" className="block text-sm font-medium text-gray-300 mb-1">URL do X (Twitter)</label>
              <input 
                type="url" 
                id="xUrl" 
                name="xUrl" 
                value={settings.xUrl} 
                onChange={handleChange} 
                placeholder="https://x.com/sua-academia"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label htmlFor="whatsappUrl" className="block text-sm font-medium text-gray-300 mb-1">URL do WhatsApp</label>
              <input 
                type="url" 
                id="whatsappUrl" 
                name="whatsappUrl" 
                value={settings.whatsappUrl} 
                onChange={handleChange} 
                placeholder="https://wa.me/5511999999999"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>
          </div>

          {/* Payment Settings */}
          <div className="space-y-6">
             <h3 className="text-lg font-medium text-gray-200 border-b border-gray-700 pb-2">Configurações de Pagamento</h3>
              <div>
                <label htmlFor="pixKey" className="block text-sm font-medium text-gray-300 mb-1">Chave PIX para Pagamentos</label>
                <input 
                  type="text" 
                  id="pixKey" 
                  name="pixKey" 
                  value={settings.pixKey} 
                  onChange={handleChange}
                  placeholder="E-mail, CPF/CNPJ, Telefone ou Chave Aleatória"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
                />
              </div>
              <div>
                <label htmlFor="paymentInstructions" className="block text-sm font-medium text-gray-300 mb-1">Instruções de Pagamento</label>
                <textarea 
                  id="paymentInstructions" 
                  name="paymentInstructions" 
                  value={settings.paymentInstructions} 
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ex: Após o pagamento, envie o comprovante para o WhatsApp (XX) XXXXX-XXXX."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
          </div>

          {/* Customization */}
          <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-200 border-b border-gray-700 pb-2">Personalização Visual</h3>
              <div>
                <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-300 mb-1">Logo da Academia (PNG, JPG, SVG)</label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-gray-700 rounded-md flex items-center justify-center border border-gray-600">
                    {settings.logoUrl ? (
                      <img src={settings.logoUrl} alt="Logo Preview" className="h-full w-full object-contain rounded-md" />
                    ) : (
                      <span className="text-xs text-gray-400 text-center p-1">Preview</span>
                    )}
                  </div>
                  <input 
                    type="file" 
                    id="logoUrl" 
                    name="logoUrl" 
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                  />
                </div>
              </div>
        
              <div>
                <label htmlFor="loginImageUrl" className="block text-sm font-medium text-gray-300 mb-1">Imagem da Página de Login (JPG, PNG)</label>
                <div className="mt-2">
                    {settings.loginImageUrl && (
                        <div className="mb-4">
                            <img src={settings.loginImageUrl} alt="Login Image Preview" className="w-full h-40 object-cover rounded-md border border-gray-600" />
                        </div>
                    )}
                     <input 
                      type="file" 
                      id="loginImageUrl" 
                      name="loginImageUrl" 
                      accept="image/png, image/jpeg"
                      onChange={handleFileChange}
                      className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                    />
                </div>
              </div>
          </div>


          <div className="pt-6 flex justify-end">
            <button 
              type="submit" 
              className="px-6 py-2.5 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteSettingsView;