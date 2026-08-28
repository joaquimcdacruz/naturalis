import React from 'react';
import { 
  Shield, 
  ClipboardList, 
  UtensilsCrossed, 
  Settings, 
  Printer, 
  LogOut,
  Sparkles,
  MapPin,
  Truck,
  Cloud,
  CloudCheck
} from 'lucide-react';
import { StoreSettings } from '../types';

interface AdminBarProps {
  storeSettings: StoreSettings;
  activeOrdersCount: number;
  isCloudSynced?: boolean;
  onOpenOrders: () => void;
  onOpenMenu: () => void;
  onOpenNeighborhoods: () => void;
  onOpenSettings: () => void;
  onOpenThermal: () => void;
  onToggleDelivery?: () => void;
  onLogout: () => void;
}

export const AdminBar: React.FC<AdminBarProps> = ({
  storeSettings,
  activeOrdersCount,
  isCloudSynced = true,
  onOpenOrders,
  onOpenMenu,
  onOpenNeighborhoods,
  onOpenSettings,
  onOpenThermal,
  onToggleDelivery,
  onLogout,
}) => {
  const isDeliveryActive = storeSettings.deliveryEnabled !== false;

  return (
    <div className="bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md sticky top-0 z-50 animate-in slide-in-from-top-2 duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Left Badges */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30 text-[11px]">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>PAINEL DO LOJISTA (ADMIN)</span>
          </div>

          {/* Cloud Database Live Sync Indicator */}
          <div 
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-500/15 text-blue-300 font-medium border border-blue-500/30 text-[11px]"
            title="Banco de Dados Firebase em Nuvem ativo e sincronizando entre navegadores e dispositivos em tempo real"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <Cloud className="w-3 h-3 text-blue-400" />
            <span className="hidden sm:inline">Nuvem Sincronizada</span>
            <span className="sm:hidden">Nuvem On</span>
          </div>
          
          {/* Quick Delivery Switch Button */}
          {onToggleDelivery && (
            <button
              type="button"
              onClick={onToggleDelivery}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-bold text-[11px] border transition-all cursor-pointer shadow-2xs ${
                isDeliveryActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
              }`}
              title={isDeliveryActive ? 'Clique para pausar entregas por delivery' : 'Clique para ativar entregas por delivery'}
            >
              <Truck className="w-3.5 h-3.5" />
              <span>Delivery: {isDeliveryActive ? '🟢 ATIVO' : '⛔ PAUSADO'}</span>
            </button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Orders Button */}
          <button
            type="button"
            onClick={onOpenOrders}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-extrabold transition-all cursor-pointer shadow-xs active:scale-95 text-xs"
            id="admin-bar-orders-btn"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Pedidos</span>
            {activeOrdersCount > 0 && (
              <span className="bg-stone-950 text-amber-400 text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {activeOrdersCount}
              </span>
            )}
          </button>

          {/* Menu Manager Button */}
          <button
            type="button"
            onClick={onOpenMenu}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold transition-all cursor-pointer border border-stone-700 active:scale-95 text-xs"
            id="admin-bar-menu-btn"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-rose-400" />
            <span>Cardápio & Estoque</span>
          </button>

          {/* Neighborhoods & Delivery Zones Button */}
          <button
            type="button"
            onClick={onOpenNeighborhoods}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold transition-all cursor-pointer border border-stone-700 active:scale-95 text-xs"
            id="admin-bar-neighborhoods-btn"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Bairros & Frete</span>
          </button>

          {/* Settings Button */}
          <button
            type="button"
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white font-bold transition-all cursor-pointer border border-stone-700 active:scale-95 text-xs"
            id="admin-bar-settings-btn"
          >
            <Settings className="w-3.5 h-3.5 text-stone-300" />
            <span className="hidden sm:inline">Configurações da Loja</span>
            <span className="sm:hidden">Config</span>
          </button>

          {/* Thermal Receipt Button */}
          <button
            type="button"
            onClick={onOpenThermal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white font-medium transition-all cursor-pointer border border-stone-700 text-xs"
            title="Impressão Térmica 80mm / 58mm"
            id="admin-bar-thermal-btn"
          >
            <Printer className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden md:inline">Cupom Térmico</span>
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 hover:text-rose-200 font-bold transition-all cursor-pointer border border-rose-500/30 text-xs ml-1"
            title="Sair do Modo Administrador"
            id="admin-bar-logout-btn"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
};
