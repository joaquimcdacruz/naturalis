import React from 'react';
import { Flame, ShoppingBag, CheckCircle2, Sparkles, Package, Gift, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { PromoCombo } from '../types';
import { formatCurrency } from '../utils/whatsapp';

interface PromoCombosProps {
  combos: PromoCombo[];
  onSelectCombo: (combo: PromoCombo) => void;
}

export const PromoCombos: React.FC<PromoCombosProps> = ({ combos, onSelectCombo }) => {
  return (
    <section id="secao-combos" className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-xs font-black uppercase tracking-wider mb-2">
            <Flame className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
            <span>Kits Promocionais & Presentes</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
            Combos Especiais com Desconto
          </h2>
          <p className="text-sm text-stone-500 mt-1 font-normal">
            Mais unidades, mais economia e embalagens térmicas para presentear ou dividir com a galera.
          </p>
        </div>
      </div>

      {/* Combos Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {combos.map((combo) => {
          const discountVal = combo.originalPrice - combo.price;
          const discountPercent = Math.round((discountVal / combo.originalPrice) * 100);
          const isBestSeller = combo.badge.includes('Popular') || combo.badge.includes('Vendido') || combo.badge.includes('Gourmet');

          return (
            <div
              key={combo.id}
              className={`group relative bg-white rounded-3xl p-5 sm:p-6 border transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-xs hover-card-glow ${
                isBestSeller 
                  ? 'border-rose-300 ring-2 ring-rose-500/10' 
                  : 'border-stone-200/80 hover:border-stone-300'
              }`}
            >
              {/* Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gradient-to-r from-rose-600 to-rose-500 text-white text-[11px] font-black shadow-md shadow-rose-500/20">
                  <Sparkles className="w-3 h-3" />
                  {combo.badge}
                </span>
              </div>

              {/* Combo Image with overlay */}
              <div className="relative h-48 w-full rounded-2xl overflow-hidden bg-stone-100 mb-4 border border-stone-100">
                <img
                  src={combo.image}
                  alt={combo.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                
                {/* Save amount pill */}
                <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md text-stone-900 px-3 py-1 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-sm">
                  <Zap className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                  <span>Economize {formatCurrency(discountVal)} (-{discountPercent}%)</span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                  <Package className="w-4 h-4" />
                  <span>{combo.itemsCount} Geladinhos Gourmet</span>
                  {combo.includesThermalBag && (
                    <span className="text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2.5 py-0.5 rounded-md font-bold text-[11px]">
                      + Caixa Térmica Grátis
                    </span>
                  )}
                </div>

                <h3 className="font-black text-xl text-stone-900 group-hover:text-rose-600 transition-colors leading-tight">
                  {combo.title}
                </h3>

                <p className="text-xs text-stone-500 leading-relaxed font-normal">
                  {combo.description}
                </p>

                {combo.isCustomizable ? (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold pt-1 bg-emerald-50/70 p-2 rounded-xl border border-emerald-100">
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                    <span>Personalize 100%: Você escolhe os sabores do kit!</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs text-stone-600 font-semibold pt-1 bg-stone-50 p-2 rounded-xl border border-stone-100">
                    <Gift className="w-4 h-4 shrink-0 text-amber-500" />
                    <span>Seleção exclusiva dos nossos sabores mais premiados</span>
                  </div>
                )}
              </div>

              {/* Price & Action */}
              <div className="mt-5 pt-4 border-t border-stone-100 flex items-center justify-between gap-3">
                <div>
                  <span className="text-xs text-stone-400 line-through block font-semibold">
                    {formatCurrency(combo.originalPrice)}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                      {formatCurrency(combo.price)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => onSelectCombo(combo)}
                  className="px-5 py-3 rounded-2xl bg-stone-900 hover:bg-rose-600 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-stone-900/10 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
                  id={`combo-btn-${combo.id}`}
                >
                  <ShoppingBag className="w-4 h-4 text-rose-300 group-hover:text-white" />
                  <span>{combo.isCustomizable ? 'Montar Meu Kit' : 'Adicionar'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
