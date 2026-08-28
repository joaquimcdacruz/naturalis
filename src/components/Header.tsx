import React from 'react';
import { ShoppingBag, Sparkles, Clock, Phone, MapPin, Shield, Lock } from 'lucide-react';
import { StoreSettings } from '../types';
import { formatCurrency } from '../utils/whatsapp';
import { NaturalisLogo } from './NaturalisLogo';

interface HeaderProps {
  storeSettings: StoreSettings;
  cartCount: number;
  cartTotal: number;
  isAdminAuthenticated?: boolean;
  onOpenCart: () => void;
  onOpenQuiz: () => void;
  onOpenSettings?: () => void;
  onOpenAdminAuth?: () => void;
  onOpenAdminPanel?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  storeSettings,
  cartCount,
  cartTotal,
  isAdminAuthenticated = false,
  onOpenCart,
  onOpenQuiz,
  onOpenSettings,
  onOpenAdminAuth,
  onOpenAdminPanel,
}) => {
  const handleLocationClick = () => {
    if (onOpenSettings) {
      onOpenSettings();
    } else if (onOpenAdminAuth) {
      onOpenAdminAuth();
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-stone-200/70 shadow-xs transition-all">
      {/* Top micro announcement bar */}
      <div className="bg-stone-900 text-stone-200 text-xs font-medium py-1.5 px-4 border-b border-stone-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {storeSettings.deliveryEnabled === false ? (
              <>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] uppercase tracking-wider font-bold">
                  🏬 Apenas Retirada
                </span>
                <span className="text-amber-200 text-xs font-medium">
                  Entregas por delivery pausadas • <strong>Retiradas no balcão abertas!</strong>
                </span>
              </>
            ) : (
              <>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] uppercase tracking-wider font-bold">
                  ✨ Destaque
                </span>
                <span className="text-stone-300 text-xs">
                  Entrega <strong>GRÁTIS</strong> para pedidos acima de <span className="text-white font-bold">{formatCurrency(storeSettings.freeDeliveryThreshold)}</span>
                </span>
              </>
            )}
          </div>
          <div className="hidden md:flex items-center gap-4 text-stone-400 text-xs">
            <button
              type="button"
              onClick={handleLocationClick}
              className="flex items-center gap-1.5 hover:text-stone-200 transition-colors cursor-pointer"
              title="Clique para alterar horários nas Configurações"
            >
              <Clock className="w-3.5 h-3.5 text-stone-400" />
              <span>{storeSettings.openingHoursText}</span>
            </button>
            <span className="text-stone-700">•</span>
            <button
              type="button"
              onClick={handleLocationClick}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer group"
              title="Clique para alterar a cidade nas Configurações da Loja"
              id="header-city-location-btn"
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400 group-hover:scale-110 transition-transform" />
              <span className="group-hover:underline">{storeSettings.city}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 flex items-center justify-between gap-3 sm:gap-6">
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-3.5 sm:gap-5">
          <div className="relative group cursor-pointer shrink-0 transition-transform hover:scale-105">
            <NaturalisLogo className="w-22 h-22 sm:w-28 sm:h-28 md:w-36 md:h-36 lg:w-40 lg:h-40 drop-shadow-lg" priority />
            <div
              className={`absolute bottom-1 right-1 w-4.5 h-4.5 sm:w-5 sm:h-5 ${
                storeSettings.isOpen ? 'bg-emerald-500' : 'bg-rose-500'
              } border-2 border-white rounded-full shadow-xs`}
              title={storeSettings.isOpen ? 'Loja Aberta para Pedidos' : 'Loja Temporariamente Fechada'}
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl sm:text-2xl md:text-3xl text-stone-900 tracking-tight leading-none font-serif">
                {storeSettings.storeName}
              </span>
              <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs">
                Artesanal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500 hidden sm:block font-medium mt-1">
              {storeSettings.tagline}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Admin Mode active badge button (if logged in) */}
          {isAdminAuthenticated ? (
            <button
              onClick={onOpenAdminPanel}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200/80 border border-amber-300 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              title="Painel do Administrador Ativo"
              id="header-admin-active-btn"
            >
              <Shield className="w-3.5 h-3.5 text-amber-700" />
              <span className="hidden sm:inline">Modo Lojista</span>
              <span className="sm:hidden">Admin</span>
            </button>
          ) : null}

          {/* Quiz Button for Customers */}
          <button
            onClick={onOpenQuiz}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-stone-100/80 hover:bg-stone-200/80 hover:text-stone-900 border border-stone-200/80 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            title="Descubra o sabor perfeito para o seu paladar"
            id="header-quiz-btn"
          >
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Descobrir Sabor</span>
          </button>

          {/* WhatsApp Direct contact for Customers */}
          <a
            href={`https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de tirar uma dúvida sobre os geladinhos gourmet.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 rounded-xl transition-all shadow-xs"
            id="header-whatsapp-btn"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp Direto</span>
          </a>

          {/* Customer Cart Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs sm:text-sm shadow-md shadow-stone-900/10 active:scale-95 transition-all cursor-pointer"
            id="header-cart-button"
            aria-label="Ver sacola de pedidos"
          >
            <ShoppingBag className="w-4 h-4 text-rose-400" />
            <span className="hidden sm:inline">Sacola</span>
            
            {cartCount > 0 && (
              <span className="bg-rose-500 text-white text-[11px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center shadow-xs">
                {cartCount}
              </span>
            )}

            {cartTotal > 0 && (
              <span className="hidden md:inline text-xs font-bold text-stone-300 pl-1 border-l border-stone-700">
                {formatCurrency(cartTotal)}
              </span>
            )}
          </button>

          {/* Subtle Merchant Access Icon for store manager if not logged in */}
          {!isAdminAuthenticated && onOpenAdminAuth && (
            <button
              onClick={onOpenAdminAuth}
              className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
              title="Acesso do Lojista / Painel Admin"
              aria-label="Acesso do Lojista"
              id="header-admin-login-btn"
            >
              <Lock className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
