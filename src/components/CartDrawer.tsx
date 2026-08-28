import React from 'react';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles, Package, ShieldCheck } from 'lucide-react';
import { CartItem, CartComboItem, StoreSettings } from '../types';
import { formatCurrency } from '../utils/whatsapp';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  combos: CartComboItem[];
  storeSettings: StoreSettings;
  onUpdateItemQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onRemoveCombo: (index: number) => void;
  onProceedToCheckout: () => void;
  onClearCart: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  combos,
  storeSettings,
  onUpdateItemQuantity,
  onRemoveItem,
  onRemoveCombo,
  onProceedToCheckout,
  onClearCart,
}) => {
  if (!isOpen) return null;

  const validItems = (items || []).filter((i) => i && i.product);
  const validCombos = (combos || []).filter((c) => c && c.combo);

  const itemsTotal = validItems.reduce((acc, i) => {
    const price = typeof i.product?.price === 'number' ? i.product.price : 0;
    const qty = typeof i.quantity === 'number' ? i.quantity : 1;
    return acc + (price * qty);
  }, 0);

  const combosTotal = validCombos.reduce((acc, c) => {
    const price = typeof c.combo?.price === 'number' ? c.combo.price : 0;
    const qty = typeof c.quantity === 'number' ? c.quantity : 1;
    return acc + (price * qty);
  }, 0);

  const subtotal = itemsTotal + combosTotal;

  const totalUnits = validItems.reduce((acc, i) => acc + (i.quantity || 0), 0) + 
    validCombos.reduce((acc, c) => acc + ((c.combo?.itemsCount || 0) * (c.quantity || 0)), 0);

  const freeDeliveryThreshold = storeSettings?.freeDeliveryThreshold ?? 70;
  const minOrderValue = storeSettings?.minOrderValue ?? 15;

  const missingForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const freeDeliveryProgress = freeDeliveryThreshold > 0 ? Math.min(100, (subtotal / freeDeliveryThreshold) * 100) : 100;

  const isMinOrderMet = subtotal >= minOrderValue;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-stone-950/40 backdrop-blur-xs animate-in fade-in duration-200">
      {/* Backdrop click */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div 
        className="relative w-full max-w-md bg-[#FAF9F6] h-full shadow-2xl flex flex-col border-l border-stone-200/80 animate-in slide-in-from-right duration-300"
        id="cart-drawer-container"
      >
        {/* Top Drawer Header */}
        <div className="p-4 sm:p-5 bg-white text-stone-900 flex items-center justify-between border-b border-stone-200/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-stone-900 tracking-tight">Sua Sacola</h2>
              <p className="text-xs text-stone-500 font-medium">
                {totalUnits} {totalUnits === 1 ? 'unidade selecionada' : 'unidades selecionadas'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            aria-label="Fechar sacola"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Delivery / Free Delivery Bar */}
        {storeSettings?.deliveryEnabled === false ? (
          <div className="p-3.5 bg-amber-50/80 border-b border-amber-200/80">
            <div className="flex items-center gap-2 text-xs text-amber-900 font-medium">
              <span className="text-base">🏬</span>
              <div>
                <p className="font-bold text-amber-950">Atendimento Hoje: Retirada no Balcão</p>
                <p className="text-[11px] text-amber-800">
                  {storeSettings?.deliveryDisabledMessage || 'Entregas por delivery temporariamente pausadas. Venha retirar seu pedido fresquinho!'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-white border-b border-stone-200/80">
            <div className="flex items-center justify-between text-xs mb-2 font-medium">
              {missingForFreeDelivery > 0 ? (
                <span className="text-stone-600 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Faltam <strong className="text-stone-900">{formatCurrency(missingForFreeDelivery)}</strong> para Frete Grátis
                </span>
              ) : (
                <span className="text-emerald-700 font-bold flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  Parabéns! Você ganhou <strong>ENTREGA GRÁTIS</strong>!
                </span>
              )}
              <span className="text-stone-400 font-bold text-[11px]">{Math.round(freeDeliveryProgress)}%</span>
            </div>

            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 rounded-full ${
                  missingForFreeDelivery === 0 ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${freeDeliveryProgress}%` }}
              />
            </div>
          </div>
        )}

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 && combos.length === 0 ? (
            <div className="py-16 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-white border border-stone-200 text-stone-400 mx-auto flex items-center justify-center text-3xl shadow-xs">
                🍦
              </div>
              <div>
                <h3 className="font-extrabold text-lg text-stone-900">Sua sacola está vazia</h3>
                <p className="text-xs text-stone-500 max-w-xs mx-auto mt-1 font-normal">
                  Adicione seus sabores favoritos ou aproveite os combos com desconto para começar!
                </p>
              </div>
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
              >
                Ver Sabores Disponíveis
              </button>
            </div>
          ) : (
            <>
              {/* Individual items list */}
              {validItems.map((item) => {
                if (!item?.product) return null;
                const isTracked = item.product.trackStock !== false;
                const currentStock = isTracked ? (item.product.stockQuantity ?? 0) : 999;
                const isMaxReached = isTracked && (item.quantity || 1) >= currentStock;
                const price = typeof item.product.price === 'number' ? item.product.price : 0;
                const qty = item.quantity || 1;

                return (
                  <div key={item.product.id} className="bg-white p-3 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-13 h-13 rounded-xl object-cover shrink-0 border border-stone-100"
                      referrerPolicy="no-referrer"
                    />

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 font-medium">
                        {formatCurrency(price)} cada
                        {isTracked && (
                          <span className="text-[10px] text-stone-400 ml-1">
                            ({currentStock} em estoque)
                          </span>
                        )}
                      </p>
                      {item.customNotes && (
                        <p className="text-[10px] text-rose-600 italic truncate font-medium">
                          ↳ {item.customNotes}
                        </p>
                      )}
                    </div>

                    {/* Quantity control */}
                    <div className="flex items-center gap-1 bg-stone-100 rounded-xl p-1 shrink-0">
                      <button
                        onClick={() => onUpdateItemQuantity(item.product.id, qty - 1)}
                        className="w-6 h-6 flex items-center justify-center rounded-lg bg-white hover:bg-stone-50 text-stone-700 font-bold transition-colors cursor-pointer shadow-xs"
                        aria-label="Diminuir"
                      >
                        <Minus className="w-3 h-3" />
                      </button>

                      <span className="w-5 text-center text-xs font-bold text-stone-900">
                        {qty}
                      </span>

                      <button
                        onClick={() => {
                          if (!isMaxReached) {
                            onUpdateItemQuantity(item.product.id, qty + 1);
                          }
                        }}
                        disabled={isMaxReached}
                        className={`w-6 h-6 flex items-center justify-center rounded-lg font-bold transition-colors shadow-xs ${
                          isMaxReached
                            ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                            : 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer'
                        }`}
                        title={isMaxReached ? `Limite de estoque (${currentStock} un.)` : 'Aumentar'}
                        aria-label="Aumentar"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Total item & remove */}
                    <div className="text-right shrink-0">
                      <span className="text-xs font-bold text-stone-900 block">
                        {formatCurrency(price * qty)}
                      </span>
                      <button
                        onClick={() => onRemoveItem(item.product.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Remover item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Combos list */}
              {validCombos.map((comboItem, idx) => {
                if (!comboItem?.combo) return null;
                return (
                  <div key={idx} className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-xs space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-rose-500 shrink-0" />
                        <div>
                          <h4 className="text-xs font-bold text-stone-900">
                            {comboItem.combo.title}
                          </h4>
                          <span className="text-[11px] font-bold text-rose-600">
                            {formatCurrency(comboItem.combo.price)}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => onRemoveCombo(idx)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors cursor-pointer"
                        title="Remover combo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Selected flavors inside combo */}
                    {comboItem.selectedFlavors && comboItem.selectedFlavors.length > 0 && (
                      <div className="text-[10px] text-stone-600 space-y-0.5 pl-3 border-l border-stone-200 font-medium">
                        {comboItem.selectedFlavors.map((f, i) => (
                          <div key={i} className="flex justify-between">
                            <span>{f?.quantity || 1}x {f?.product?.name || 'Sabor do Kit'}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Bottom Checkout & Total Section */}
        {subtotal > 0 && (
          <div className="p-4 sm:p-5 bg-white border-t border-stone-200/80 space-y-3">
            {/* Subtotal review */}
            <div className="space-y-1.5 text-xs text-stone-600">
              <div className="flex justify-between">
                <span>Subtotal dos itens</span>
                <span className="font-bold text-stone-900">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Taxa de entrega</span>
                <span className="font-semibold text-emerald-700">
                  {missingForFreeDelivery === 0 ? 'GRÁTIS' : 'Calculada no checkout'}
                </span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-stone-900 pt-2 border-t border-stone-100">
                <span>Total Estimado</span>
                <span className="text-lg text-rose-600">{formatCurrency(subtotal)}</span>
              </div>
            </div>

            {/* Min order check */}
            {!isMinOrderMet && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold text-center">
                ⚠️ Pedido mínimo: {formatCurrency(storeSettings.minOrderValue)}. Adicione mais {formatCurrency(storeSettings.minOrderValue - subtotal)}.
              </div>
            )}

            {/* CTAs */}
            <div className="space-y-2">
              <button
                onClick={onProceedToCheckout}
                disabled={!isMinOrderMet}
                className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm shadow-xs active:scale-98 transition-all flex items-center justify-center gap-2 ${
                  isMinOrderMet
                    ? 'bg-rose-600 hover:bg-rose-500 text-white cursor-pointer shadow-md shadow-rose-600/20'
                    : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                }`}
                id="cart-proceed-checkout-btn"
              >
                <span>Avançar para Pedido</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1 font-medium">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Envio seguro no WhatsApp
                </span>

                <button
                  onClick={onClearCart}
                  className="text-stone-400 hover:text-rose-600 underline cursor-pointer"
                >
                  Esvaziar sacola
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
