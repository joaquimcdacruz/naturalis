import React, { useState } from 'react';
import { X, Star, Plus, Minus, Check, AlertTriangle, Sparkles, Heart, ShoppingBag } from 'lucide-react';
import { GeladinhoProduct } from '../types';
import { formatCurrency } from '../utils/whatsapp';

interface ProductDetailModalProps {
  product: GeladinhoProduct | null;
  onClose: () => void;
  onAddToCart: (product: GeladinhoProduct, quantity: number, customNotes?: string) => void;
  isFavorite: boolean;
  onToggleFavorite: (productId: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  isFavorite,
  onToggleFavorite,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!product) return null;

  const isTracked = product.trackStock !== false;
  const currentStock = isTracked ? (product.stockQuantity ?? 0) : 999;
  const isSoldOut = product.isAvailable === false || (isTracked && currentStock <= 0);
  const isLowStock = isTracked && !isSoldOut && currentStock <= (product.minStockAlert || 5);
  const maxAvailable = isTracked ? currentStock : 99;

  const handleAdd = () => {
    onAddToCart(product, Math.min(quantity, maxAvailable), notes.trim() ? notes : undefined);
    setAddedSuccess(true);
    setTimeout(() => {
      setAddedSuccess(false);
      onClose();
    }, 600);
  };

  const totalPrice = product.price * quantity;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col border-t sm:border border-stone-200 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-20 p-2 rounded-full bg-stone-900/40 text-white hover:bg-stone-900/70 backdrop-blur-md transition-colors cursor-pointer"
          aria-label="Fechar detalhes"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Scrollable Area */}
        <div className="overflow-y-auto flex-1">
          {/* Cover Image */}
          <div className="relative h-64 sm:h-72 w-full bg-stone-100">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent" />
            
            {/* Badges on image */}
            <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
              {isSoldOut && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white shadow-sm">
                  ESGOTADO
                </span>
              )}
              {isLowStock && (
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500 text-white shadow-sm animate-pulse">
                  ⚡ Restam apenas {currentStock} un.
                </span>
              )}
              {(product.badges || []).map((b, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/95 text-stone-800 shadow-sm backdrop-blur-xs"
                >
                  {b}
                </span>
              ))}
            </div>

            {/* Bottom title on image */}
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <div className="flex items-center gap-2 mb-1.5">
                <div className="flex items-center gap-1 bg-amber-400 text-stone-900 px-2 py-0.5 rounded-lg text-xs font-bold">
                  <Star className="w-3.5 h-3.5 fill-stone-900" />
                  <span>{(product.rating || 5).toFixed(1)}</span>
                </div>
                <span className="text-xs text-white/80 font-normal">({product.reviewsCount || 0} avaliações)</span>
                <span className="text-white/60">•</span>
                <span className="text-xs text-stone-200 font-semibold">{product.volumeMl}ml</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight text-white">
                {product.name}
              </h2>
            </div>
          </div>

          {/* Modal Content */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Stock status indicator bar */}
            {isTracked && (
              <div className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                isSoldOut
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : isLowStock
                  ? 'bg-amber-50 border-amber-200 text-amber-800'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-800'
              }`}>
                <div className="flex items-center gap-2 font-medium">
                  <span className={`w-2 h-2 rounded-full ${
                    isSoldOut ? 'bg-rose-500' : isLowStock ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <span>
                    {isSoldOut
                      ? 'Produto esgotado no estoque no momento.'
                      : isLowStock
                      ? `Atenção: Estoque baixo! Apenas ${currentStock} unidades restantes.`
                      : `Disponibilidade imediata: ${currentStock} unidades em estoque.`}
                  </span>
                </div>
                <span className="font-bold text-[11px] uppercase tracking-wider">
                  {isSoldOut ? 'Sem estoque' : `${currentStock} un.`}
                </span>
              </div>
            )}

            {/* Tagline & Description */}
            <div>
              <p className="text-sm font-semibold text-stone-900 bg-stone-50 p-3 rounded-xl border border-stone-200/70 mb-3">
                ✨ {product.tagline}
              </p>
              <p className="text-sm text-stone-600 leading-relaxed font-normal">
                {product.description}
              </p>
            </div>

            {/* Flavor Profile meters */}
            {product.flavorProfile && (
              <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200/70 space-y-2.5">
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                  Perfil de Sabor & Textura
                </span>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <span className="text-[11px] text-stone-500 font-medium block mb-1">Doçura</span>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <span
                          key={level}
                          className={`w-2.5 h-2 rounded-full ${
                            level <= (product.flavorProfile?.sweetness ?? 3) ? 'bg-amber-400' : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-500 font-medium block mb-1">Cremosidade</span>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <span
                          key={level}
                          className={`w-2.5 h-2 rounded-full ${
                            level <= (product.flavorProfile?.creaminess ?? 3) ? 'bg-rose-500' : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-[11px] text-stone-500 font-medium block mb-1">Frutado</span>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((level) => (
                        <span
                          key={level}
                          className={`w-2.5 h-2 rounded-full ${
                            level <= (product.flavorProfile?.fruitiness ?? 3) ? 'bg-emerald-500' : 'bg-stone-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Ingredients */}
            {Array.isArray(product.ingredients) && product.ingredients.length > 0 && (
              <div>
                <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
                  Ingredientes Selecionados
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map((ing, i) => (
                    <span
                      key={i}
                      className="text-xs bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg font-medium"
                    >
                      ✓ {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Allergens warning */}
            {Array.isArray(product.allergens) && product.allergens.length > 0 && (
              <div className="flex items-start gap-2.5 bg-rose-50/60 p-3 rounded-xl border border-rose-200/80 text-xs text-rose-700">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Informações para Alérgicos: </strong>
                  <span className="font-normal">{product.allergens.join(', ')}.</span>
                </div>
              </div>
            )}

            {/* Optional observation note */}
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1.5">
                Alguma observação para este item? (Opcional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Enviar em saquinho extra, bem gelado, etc."
                className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-stone-100 flex items-center justify-between gap-2.5 sm:gap-3 pb-safe">
          {/* Favorite button */}
          <button
            onClick={() => onToggleFavorite(product.id)}
            className={`p-3 rounded-xl border transition-colors cursor-pointer ${
              isFavorite
                ? 'bg-rose-50 border-rose-200 text-rose-500'
                : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
            }`}
            title={isFavorite ? 'Remover dos favoritos' : 'Favoritar'}
            aria-label="Favoritar"
          >
            <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-500' : ''}`} />
          </button>

          {isSoldOut ? (
            <div className="flex-1 py-3 px-4 rounded-xl bg-stone-100 text-stone-500 font-bold text-xs text-center border border-stone-200">
              Sabor Esgotado no Estoque
            </div>
          ) : (
            <>
              {/* Quantity Controls */}
              <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-200 rounded-xl p-1 shadow-xs">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-stone-200 text-stone-700 font-bold hover:bg-stone-100 transition-colors cursor-pointer"
                  aria-label="Diminuir"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center text-sm font-bold text-stone-900">
                  {quantity}
                </span>
                <button
                  onClick={() => {
                    if (quantity < maxAvailable) {
                      setQuantity(quantity + 1);
                    }
                  }}
                  disabled={quantity >= maxAvailable}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg font-bold transition-colors shadow-xs ${
                    quantity >= maxAvailable
                      ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                      : 'bg-stone-900 text-white hover:bg-stone-800 cursor-pointer'
                  }`}
                  aria-label="Aumentar"
                  title={quantity >= maxAvailable ? `Máximo em estoque (${maxAvailable})` : 'Aumentar'}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              {/* Add to Cart CTA */}
              <button
                onClick={handleAdd}
                className="flex-1 py-3.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {addedSuccess ? (
                  <>
                    <Check className="w-4 h-4 text-white" />
                    <span>Adicionado!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Adicionar • {formatCurrency(totalPrice)}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
