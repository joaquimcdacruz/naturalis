import React from 'react';
import { Phone, MapPin, Clock, Instagram, Heart, ShieldCheck, Lock, Shield } from 'lucide-react';
import { StoreSettings } from '../types';
import { NaturalisLogo } from './NaturalisLogo';

interface FooterProps {
  storeSettings: StoreSettings;
  isAdminAuthenticated?: boolean;
  onOpenAdminAuth?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  storeSettings,
  isAdminAuthenticated = false,
  onOpenAdminAuth,
  onOpenAdminPanel,
}) => {
  return (
    <footer className="bg-stone-900 text-stone-300 pt-12 pb-8 border-t border-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8 pb-8 border-b border-stone-800 text-xs">
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3.5">
            <div className="flex items-center gap-4 sm:gap-5">
              <NaturalisLogo className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 drop-shadow-xl shrink-0" priority />
              <div>
                <span className="font-extrabold text-2xl sm:text-3xl text-white tracking-tight font-serif block">
                  {storeSettings.storeName}
                </span>
                <span className="text-xs sm:text-sm font-semibold text-emerald-400 uppercase tracking-wider">
                  Geladinhos Artesanais Nobres
                </span>
              </div>
            </div>
            <p className="text-stone-400 max-w-sm leading-relaxed font-normal">
              Produção artesanal diária de geladinhos e chup-chups gourmet com base nobre de Leite Ninho, Nutella pura, frutas frescas e calda caseira.
            </p>
            <div className="flex items-center gap-2 text-stone-300 pt-1 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Garantia de produto 100% congelado no transporte</span>
            </div>
          </div>

          {/* Col 2: Hours & Location */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Atendimento & Local</h4>
            <div className="flex items-start gap-2 text-stone-400 font-normal">
              <Clock className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
              <span>{storeSettings.openingHoursText}</span>
            </div>
            <div className="flex items-start gap-2 text-stone-400 font-normal">
              <MapPin className="w-4 h-4 text-stone-300 shrink-0 mt-0.5" />
              <span>{storeSettings.address} - {storeSettings.city}</span>
            </div>
          </div>

          {/* Col 3: WhatsApp & Customer Social */}
          <div className="space-y-3">
            <h4 className="font-bold text-white uppercase tracking-wider text-xs">Pedidos & Contato</h4>
            <a
              href={`https://wa.me/${storeSettings.whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-md"
            >
              <Phone className="w-4 h-4" />
              <span>WhatsApp de Atendimento</span>
            </a>

            <div className="flex items-center gap-2 text-stone-400 pt-1 font-medium">
              <Instagram className="w-4 h-4 text-rose-400" />
              <span>{storeSettings.instagramHandle}</span>
            </div>

            <p className="text-[11px] text-stone-500 pt-1">
              Atendimento rápido para pedidos individuais, kits e encomendas de eventos.
            </p>
          </div>
        </div>

        {/* Bottom micro bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-stone-500 font-normal">
          <p>© {new Date().getFullYear()} {storeSettings.storeName}. Todos os direitos reservados.</p>
          
          {/* Admin merchant link */}
          <div className="flex items-center gap-3">
            {isAdminAuthenticated ? (
              <button
                type="button"
                onClick={onOpenAdminPanel}
                className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1.5 cursor-pointer text-xs"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Painel do Administrador Ativo</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onOpenAdminAuth}
                className="text-stone-600 hover:text-stone-400 font-medium flex items-center gap-1 cursor-pointer transition-colors"
                title="Acesso exclusivo para gerência e administração da loja"
              >
                <Lock className="w-3 h-3" />
                <span>Acesso do Lojista (Admin)</span>
              </button>
            )}
          </div>

          <p className="flex items-center gap-1">
            Feito com <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> para os amantes de sobremesas geladas
          </p>
        </div>
      </div>
    </footer>
  );
};
