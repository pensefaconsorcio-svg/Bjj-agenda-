import React from 'react';
import { InstagramIcon } from './icons/InstagramIcon';
import { FacebookIcon } from './icons/FacebookIcon';
import { XIcon } from './icons/XIcon';
import { WhatsappIcon } from './icons/WhatsappIcon';
import { useAppStore } from '../store';

const Footer: React.FC = () => {
  const siteSettings = useAppStore(state => state.siteSettings);

  return (
    <footer className="bg-gray-800 mt-8 border-t border-gray-700">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 text-center text-gray-400">
        <div className="flex justify-center space-x-6 mb-4">
          <a href={siteSettings.instagramUrl} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors duration-200"><InstagramIcon /></a>
          <a href={siteSettings.facebookUrl} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors duration-200"><FacebookIcon /></a>
          <a href={siteSettings.xUrl} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors duration-200"><XIcon /></a>
          <a href={siteSettings.whatsappUrl} target="_blank" rel="noopener noreferrer" className="hover:text-red-500 transition-colors duration-200"><WhatsappIcon /></a>
        </div>
        <p className="text-sm">&copy; {new Date().getFullYear()} {siteSettings.academyName}. Todos os direitos reservados.</p>
      </div>
    </footer>
  );
};

export default Footer;