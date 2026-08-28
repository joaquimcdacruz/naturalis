import React, { useState } from 'react';
import { X, Check, Plus, Minus, Package, Sparkles } from 'lucide-react';
import { PromoCombo, GeladinhoProduct } from '../types';
import { formatCurrency } from '../utils/whatsapp';

interface ComboCustomizerModalProps {
  combo: PromoCombo | null;
  allProducts: GeladinhoProduct[];
  onClose: () => void;
  onConfirmCombo: (combo: PromoCombo, selectedFlavors: { product: GeladinhoProduct; quantity: number }[]) => void;
}

export const ComboCustomizerModal: React.FC<ComboCustomizerModalProps> = ({
  combo,
  allProducts,
  onClose,
  onConfirmCombo,
}) => {
  const [flavorSelections, setFlavorSelections] = useState<Record<string, number>>({});

  if (!combo) return null;

  const totalSelected = Object.values(flavorSelections).reduce<number>((a, b) => a + Number(b), 0);
  const remaining = combo.itemsCount - totalSelected;

  const handleUpdate = (productId: string, delta: number) => {
    const product = allProducts.find((p) => p.id === productId);
    const isTracked = product?.trackStock !== false;
    const currentStock = isTracked ? (product?.stockQuantity ?? 0) : 999;

    const current = flavorSelections[productId] || 0;
    const next = current + delta;
    if (next < 0) return;
    if (delta > 0 && totalSelected >= combo.itemsCount) return;
    if (delta > 0 && isTracked && next > currentStock) return;

    const updated = { ...flavorSelections };
    if (next === 0) {
      delete updated[productId];
    } else {
      updated[productId] = next;
    }
    setFlavorSelections(updated);
  };

  const handleAutoFillPopular = () => {
    // Pick the most popular available flavors with stock to fill up to itemsCount
    const populars = allProducts
      .filter((p) => {
        const isTracked = p.trackStock !== false;
        const currentStock = isTracked ? (p.stockQuantity ?? 0) : 999;
        return p.isAvailable !== false && currentStock > 0;
      })
      .sort((a, b) => b.rating - a.rating);

    const newMap: Record<string, number> = {};
    let count = 0;

    // Distribute among available products respecting individual stock limits
    for (const p of populars) {
      const isTracked = p.trackStock !== false;
      const currentStock = isTracked ? (p.stockQuantity ?? 0) : 999;
      
      while (count < combo.itemsCount && (newMap[p.id] || 0) < currentStock && (newMap[p.id] || 0) < 2) {
        newMap[p.id] = (newMap[p.id] || 0) + 1;
        count++;
      }
      if (count >= combo.itemsCount) break;
    }

    // If still need more, allow repeating available
    if (count < combo.itemsCount) {
      for (const p of populars) {
        const isTracked = p.trackStock !== false;
        const currentStock = isTracked ? (p.stockQuantity ?? 0) : 999;
        while (count < combo.itemsCount && (newMap[p.id] || 0) < currentStock) {
          newMap[p.id] = (newMap[p.id] || 0) + 1;
          count++;
        }
        if (count >= combo.itemsCount) break;
      }
    }

    setFlavorSelections(newMap);
  };

  const handleConfirm = () => {
    if (totalSelected !== combo.itemsCount) return;
    const itemsList: { product: GeladinhoProduct; quantity: number }[] = [];
    Object.entries(flavorSelections).forEach(([productId, quantity]) => {
      const product = allProducts.find((p) => p && p.id === productId);
      if (product && quantity > 0) {
        itemsList.push({ product, quantity });
      }
    });
    if (itemsList.length === 0) return;
    onConfirmCombo(combo, itemsList);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col border-t sm:border border-stone-200 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 bg-white text-stone-900 flex items-center justify-between border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <Package className="w-4 h-4 text-rose-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                Monte o seu Kit
              </span>
            </div>
            <h2 className="font-extrabold text-xl sm:text-2xl mt-0.5 tracking-tight text-stone-900">
              {combo.title}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Counter banner */}
        <div className="bg-stone-50 px-5 py-3 border-b border-stone-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-stone-700">Progresso do kit:</span>
            <span className="font-bold text-xs px-2.5 py-0.5 rounded-full bg-stone-900 text-white">
              {totalSelected} / {combo.itemsCount} escolhidos
            </span>
            {remaining > 0 ? (
              <span className="text-stone-500 font-medium">
                (Faltam {remaining} {remaining === 1 ? 'sabor' : 'sabores'})
              </span>
            ) : (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" /> Kit completo!
              </span>
            )}
          </div>

          <button
            onClick={handleAutoFillPopular}
            className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Preencher com os Mais Vendidos</span>
          </button>
        </div>

        {/* Flavor Selection List */}
        <div className="overflow-y-auto flex-1 p-5 divide-y divide-stone-100">
          {allProducts.map((product) => {
            const count = flavorSelections[product.id] || 0;
            const isTracked = product.trackStock !== false;
            const currentStock = isTracked ? (product.stockQuantity ?? 0) : 999;
            const isSoldOut = product.isAvailable === false || (isTracked && currentStock <= 0);
            const isLowStock = isTracked && !isSoldOut && currentStock <= (product.minStockAlert || 5);
            const isMaxReached = isTracked && count >= currentStock;
            const isAvailable = !isSoldOut;

            return (
              <div
                key={product.id}
                className={`py-3 flex items-center justify-between gap-3 px-3 rounded-2xl transition-colors ${
                  isAvailable ? 'hover:bg-stone-50/70' : 'opacity-60 bg-stone-50/50'
                }`}
              >
                {/* Thumbnail & Info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-stone-200">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    {isSoldOut && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-[8px] font-bold text-white uppercase text-center p-0.5">
                        Esgotado
                      </div>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-stone-900 truncate">
                        {product.name}
                      </h4>
                      {isSoldOut ? (
                        <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                          Esgotado
                        </span>
                      ) : isTracked ? (
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded ${
                          isLowStock ? 'text-amber-700 bg-amber-50' : 'text-emerald-700 bg-emerald-50'
                        }`}>
                          {currentStock} disp.
                        </span>
                      ) : null}
                    </div>
                    <p className="text-[11px] text-stone-500 line-clamp-1 font-normal">
                      {product.tagline}
                    </p>
                    <span className="text-[11px] font-semibold text-rose-600">
                      {formatCurrency(product.price)} (incluso no kit)
                    </span>
                  </div>
                </div>

                {/* Counter Control */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleUpdate(product.id, -1)}
                    disabled={count === 0}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors cursor-pointer ${
                      count > 0 ? 'bg-white border border-stone-200 text-stone-700 hover:bg-stone-100' : 'opacity-30 cursor-not-allowed bg-stone-100 text-stone-400'
                    }`}
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>

                  <span className="w-6 text-center text-xs font-bold text-stone-900">
                    {count}
                  </span>

                  <button
                    onClick={() => handleUpdate(product.id, 1)}
                    disabled={!isAvailable || totalSelected >= combo.itemsCount || isMaxReached}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors cursor-pointer ${
                      isAvailable && totalSelected < combo.itemsCount && !isMaxReached
                        ? 'bg-stone-900 hover:bg-stone-800 text-white shadow-xs'
                        : 'opacity-30 cursor-not-allowed bg-stone-200 text-stone-400'
                    }`}
                    title={isMaxReached ? `Limite de estoque (${currentStock} un.)` : 'Adicionar ao kit'}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-stone-100 flex items-center justify-between gap-3 pb-safe">
          <div>
            <span className="text-xs text-stone-500 font-medium block">Total do Kit Promocional</span>
            <span className="text-2xl font-extrabold text-stone-900">
              {formatCurrency(combo.price)}
            </span>
          </div>

          <button
            onClick={handleConfirm}
            disabled={totalSelected !== combo.itemsCount}
            className={`px-6 py-3.5 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-all flex items-center gap-2 ${
              totalSelected === combo.itemsCount
                ? 'bg-rose-500 hover:bg-rose-600 text-white cursor-pointer shadow-lg shadow-rose-500/20'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Adicionar Kit à Sacola</span>
          </button>
        </div>
      </div>
    </div>
  );
};
