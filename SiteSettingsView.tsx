import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { type SiteSettings } from '../types';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { useAppStore } from '../store';

const SiteSettingsView: React.FC = () => {
  const { currentSettings, updateSiteSettings } = useAppStore(state => ({
    currentSettings: state.siteSettings,
    updateSiteSettings: state.updateSiteSettings,
  }));
  
  const [settings, setSettings] = useState<SiteSettings>(currentSettings);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setSettings(currentSettings);
  }, [currentSettings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        await updateSiteSettings(settings);
    } catch (error) {
        toast.error("Ocorreu um erro ao salvar as configurações.");
    } finally {
        setIsSaving(false);
    }
  };

  return (
    <div className="animate-fade-in-up max-w-2xl mx-auto">
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-6 sm:p-8 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* General Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-200 border-b border-gray-700 pb-2">Informações Gerais</h3>
            <div>
              <label htmlFor="academy_name" className="block text-sm font-medium text-gray-300 mb-1">Nome da Academia</label>
              <input 
                type="text" 
                id="academy_name" 
                name="academy_name" 
                value={settings.academy_name} 
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
              <label htmlFor="instagram_url" className="block text-sm font-medium text-gray-300 mb-1">URL do Instagram</label>
              <input 
                type="url" 
                id="instagram_url" 
                name="instagram_url" 
                value={settings.instagram_url} 
                onChange={handleChange} 
                placeholder="https://instagram.com/sua-academia"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>
             <div>
              <label htmlFor="facebook_url" className="block text-sm font-medium text-gray-300 mb-1">URL do Facebook</label>
              <input 
                type="url" 
                id="facebook_url" 
                name="facebook_url" 
                value={settings.facebook_url} 
                onChange={handleChange} 
                placeholder="https://facebook.com/sua-academia"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>
             <div>
              <label htmlFor="x_url" className="block text-sm font-medium text-gray-300 mb-1">URL do X (Twitter)</label>
              <input 
                type="url" 
                id="x_url" 
                name="x_url" 
                value={settings.x_url} 
                onChange={handleChange} 
                placeholder="https://x.com/sua-academia"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent" 
              />
            </div>
            <div>
              <label htmlFor="whatsapp_url" className="block text-sm font-medium text-gray-300 mb-1">URL do WhatsApp</label>
              <input 
                type="url" 
                id="whatsapp_url" 
                name="whatsapp_url" 
                value={settings.whatsapp_url} 
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
                <label htmlFor="payment_gateway" className="block text-sm font-medium text-gray-300 mb-1">Gateway de Pagamento</label>
                 <select 
                    id="payment_gateway" 
                    name="payment_gateway" 
                    value={settings.payment_gateway} 
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                    <option value="manual">PIX Manual</option>
                    <option value="mercadopago">Mercado Pago</option>
                    <option value="asaas">Asaas</option>
                </select>
            </div>
            
            {settings.payment_gateway === 'manual' && (
                <>
                    <div>
                        <label htmlFor="pix_key" className="block text-sm font-medium text-gray-300 mb-1">Chave PIX para Pagamentos</label>
                        <input type="text" id="pix_key" name="pix_key" value={settings.pix_key} onChange={handleChange} placeholder="E-mail, CPF/CNPJ, Telefone ou Chave Aleatória" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                    </div>
                    <div>
                        <label htmlFor="payment_instructions" className="block text-sm font-medium text-gray-300 mb-1">Instruções de Pagamento</label>
                        <textarea id="payment_instructions" name="payment_instructions" value={settings.payment_instructions} onChange={handleChange} rows={3} placeholder="Ex: Após o pagamento, envie o comprovante..." className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                    </div>
                </>
            )}

            {settings.payment_gateway === 'mercadopago' && (
                 <div>
                    <label htmlFor="mercado_pago_api_key" className="block text-sm font-medium text-gray-300 mb-1">Chave de API do Mercado Pago</label>
                    <input type="password" id="mercado_pago_api_key" name="mercado_pago_api_key" value={settings.mercado_pago_api_key} onChange={handleChange} placeholder="Insira sua Chave de API" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                </div>
            )}

            {settings.payment_gateway === 'asaas' && (
                 <div>
                    <label htmlFor="asaas_api_key" className="block text-sm font-medium text-gray-300 mb-1">Chave de API do Asaas</label>
                    <input type="password" id="asaas_api_key" name="asaas_api_key" value={settings.asaas_api_key} onChange={handleChange} placeholder="Insira sua Chave de API" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg"/>
                </div>
            )}
          </div>

          {/* Customization */}
          <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-200 border-b border-gray-700 pb-2">Personalização Visual</h3>
              <div>
                <label htmlFor="logo_url" className="block text-sm font-medium text-gray-300 mb-1">Logo da Academia (PNG, JPG, SVG)</label>
                <div className="mt-2 flex items-center space-x-4">
                  <div className="flex-shrink-0 h-16 w-16 bg-gray-700 rounded-md flex items-center justify-center border border-gray-600">
                    {settings.logo_url ? (
                      <img src={settings.logo_url} alt="Logo Preview" className="h-full w-full object-contain rounded-md" />
                    ) : (
                      <span className="text-xs text-gray-400 text-center p-1">Preview</span>
                    )}
                  </div>
                  <input 
                    type="file" 
                    id="logo_url" 
                    name="logo_url" 
                    accept="image/png, image/jpeg, image/svg+xml"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-white hover:file:bg-red-700 cursor-pointer"
                  />
                </div>
              </div>
        
              <div>
                <label htmlFor="login_image_url" className="block text-sm font-medium text-gray-300 mb-1">Imagem da Página de Login (JPG, PNG)</label>
                <div className="mt-2">
                    {settings.login_image_url && (
                        <div className="mb-4">
                            <img src={settings.login_image_url} alt="Login Image Preview" className="w-full h-40 object-cover rounded-md border border-gray-600" />
                        </div>
                    )}
                     <input 
                      type="file" 
                      id="login_image_url" 
                      name="login_image_url" 
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
              disabled={isSaving}
              className="flex items-center justify-center w-48 px-6 py-2.5 rounded-lg text-white font-semibold bg-red-600 hover:bg-red-700 transition-colors disabled:bg-red-800"
            >
              {isSaving ? <SpinnerIcon /> : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteSettingsView;
