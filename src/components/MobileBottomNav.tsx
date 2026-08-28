import React from 'react';
import { UtensilsCrossed, Sparkles, Flame, ShoppingBag, Search } from 'lucide-react';
import { formatCurrency } from '../utils/whatsapp';

interface MobileBottomNavProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
  onOpenQuiz: () => void;
  onScrollToCatalog: () => void;
  onScrollToCombos: () => void;
  onFocusSearch: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
  onOpenQuiz,
  onScrollToCatalog,
  onScrollToCombos,
  onFocusSearch,
}) => {
  return (
    <nav 
      aria-label="Navegação mobile"
      className="fixed bottom-0 left-0 right-0 z-40 sm:hidden bg-white/95 backdrop-blur-xl border-t border-stone-200/80 shadow-[0_-8px_25px_rgba(0,0,0,0.08)] pb-safe transition-all"
    >
      {/* Mini Cart highlight bar when items in cart */}
      {cartCount > 0 && (
        <div className="px-3 pt-2 pb-1 bg-stone-900 text-white flex items-center justify-between animate-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 text-xs">
            <span className="bg-rose-500 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-xs">
              {cartCount}
            </span>
            <span className="font-medium text-stone-200">
              Total: <strong className="text-white font-bold">{formatCurrency(cartTotal)}</strong>
            </span>
          </div>

          <button
            onClick={onOpenCart}
            className="px-3 py-1 bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-black text-[11px] rounded-lg shadow-sm flex items-center gap-1 transition-all cursor-pointer"
          >
            <span>Ver Sacola</span>
            <span>→</span>
          </button>
        </div>
      )}

      {/* Main 5-icon touch navigation bar */}
      <div className="grid grid-cols-5 h-14 items-center px-1">
        {/* 1. Cardápio */}
        <button
          onClick={onScrollToCatalog}
          className="flex flex-col items-center justify-center gap-0.5 text-stone-600 hover:text-stone-900 active:scale-90 transition-all cursor-pointer h-full"
          title="Ver Cardápio de Geladinhos"
        >
          <UtensilsCrossed className="w-4 h-4 text-stone-700" />
          <span className="text-[10px] font-bold tracking-tight">Sabores</span>
        </button>

        {/* 2. Combos */}
        <button
          onClick={onScrollToCombos}
          className="flex flex-col items-center justify-center gap-0.5 text-stone-600 hover:text-rose-600 active:scale-90 transition-all cursor-pointer h-full"
          title="Ver Kits e Promoções"
        >
          <Flame className="w-4 h-4 text-rose-500 fill-rose-500/20" />
          <span className="text-[10px] font-bold tracking-tight">Kits</span>
        </button>

        {/* 3. Buscar */}
        <button
          onClick={onFocusSearch}
          className="flex flex-col items-center justify-center gap-0.5 text-stone-600 hover:text-stone-900 active:scale-90 transition-all cursor-pointer h-full"
          title="Buscar Sabores"
        >
          <Search className="w-4 h-4 text-stone-700" />
          <span className="text-[10px] font-bold tracking-tight">Buscar</span>
        </button>

        {/* 4. Quiz */}
        <button
          onClick={onOpenQuiz}
          className="flex flex-col items-center justify-center gap-0.5 text-stone-600 hover:text-amber-600 active:scale-90 transition-all cursor-pointer h-full"
          title="Quiz de Recomendação de Sabor"
        >
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span className="text-[10px] font-bold tracking-tight">Quiz</span>
        </button>

        {/* 5. Sacola */}
        <button
          onClick={onOpenCart}
          className="relative flex flex-col items-center justify-center gap-0.5 text-stone-900 hover:text-rose-600 active:scale-90 transition-all cursor-pointer h-full"
          title="Abrir Sacola de Pedidos"
        >
          <div className="relative">
            <ShoppingBag className={`w-4 h-4 ${cartCount > 0 ? 'text-rose-600 fill-rose-600/20' : 'text-stone-700'}`} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {cartCount}
              </span>
            )}
          </div>
          <span className={`text-[10px] font-black tracking-tight ${cartCount > 0 ? 'text-rose-600' : 'text-stone-700'}`}>
            Sacola
          </span>
        </button>
      </div>
    </nav>
  );
};
