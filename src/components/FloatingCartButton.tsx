import React from 'react';
import { ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import { formatCurrency } from '../utils/whatsapp';

interface FloatingCartButtonProps {
  cartCount: number;
  cartTotal: number;
  onOpenCart: () => void;
}

export const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({
  cartCount,
  cartTotal,
  onOpenCart,
}) => {
  if (cartCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 sm:hidden animate-in slide-in-from-bottom-5 duration-300">
      <button
        onClick={onOpenCart}
        className="w-full py-4 px-5 rounded-2xl bg-gradient-to-r from-stone-950 via-stone-900 to-stone-950 text-white font-black shadow-2xl shadow-stone-950/40 flex items-center justify-between active:scale-98 transition-transform cursor-pointer border border-stone-850"
        id="floating-mobile-cart-btn"
      >
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-white/10 text-rose-300">
            <ShoppingBag className="w-5 h-5" />
            <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
              {cartCount}
            </span>
          </div>
          <div className="text-left">
            <span className="text-xs text-stone-300 block font-normal leading-none mb-0.5">Sua Sacola</span>
            <span className="text-sm font-black text-white">Finalizar Pedido</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-black bg-white/15 px-3 py-1.5 rounded-xl text-white backdrop-blur-md">
            {formatCurrency(cartTotal)}
          </span>
          <ArrowRight className="w-4 h-4 text-rose-300" />
        </div>
      </button>
    </div>
  );
};
