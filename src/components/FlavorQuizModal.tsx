import React, { useState } from 'react';
import { X, Sparkles, ArrowRight, RotateCcw, Check, ShoppingBag } from 'lucide-react';
import { GeladinhoProduct } from '../types';
import { formatCurrency } from '../utils/whatsapp';

interface FlavorQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  allProducts: GeladinhoProduct[];
  onAddToCart: (product: GeladinhoProduct) => void;
}

export const FlavorQuizModal: React.FC<FlavorQuizModalProps> = ({
  isOpen,
  onClose,
  allProducts,
  onAddToCart,
}) => {
  const [step, setStep] = useState(1);
  const [craving, setCraving] = useState<string>('');
  const [sweetness, setSweetness] = useState<string>('');
  const [recommendation, setRecommendation] = useState<GeladinhoProduct | null>(null);
  const [added, setAdded] = useState(false);

  if (!isOpen) return null;

  const handleSelectCraving = (c: string) => {
    setCraving(c);
    setStep(2);
  };

  const handleSelectSweetness = (s: string) => {
    setSweetness(s);

    // Compute best recommendation dynamically
    let bestMatch = allProducts[0];

    if (craving === 'chocolate') {
      bestMatch = allProducts.find((p) => p.name.toLowerCase().includes('chocolate') || p.name.toLowerCase().includes('cacau')) || allProducts[0];
    } else if (craving === 'fruta') {
      bestMatch = allProducts.find((p) => (p.flavorProfile?.fruitiness ?? 0) >= 3 || p.badges.includes('Fruta de Verdade')) || allProducts[0];
    } else if (craving === 'fit') {
      bestMatch = allProducts.find((p) => p.category === 'fit-zero' || p.name.toLowerCase().includes('fit') || p.name.toLowerCase().includes('limão')) || allProducts[0];
    } else if (craving === 'drink') {
      bestMatch = allProducts.find((p) => p.category === 'alcoolicos') || allProducts[0];
    } else {
      bestMatch = allProducts.find((p) => (p.flavorProfile?.creaminess ?? 0) >= 4) || allProducts[0];
    }

    setRecommendation(bestMatch);
    setStep(3);
  };

  const handleReset = () => {
    setStep(1);
    setCraving('');
    setSweetness('');
    setRecommendation(null);
    setAdded(false);
  };

  const handleAddRecommended = () => {
    if (recommendation) {
      onAddToCart(recommendation);
      setAdded(true);
      setTimeout(() => {
        setAdded(false);
        onClose();
      }, 700);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col border-t sm:border border-stone-200 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Header */}
        <div className="p-4 sm:p-5 bg-white text-stone-900 flex items-center justify-between border-b border-stone-100">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-500" />
            <h2 className="font-extrabold text-base sm:text-lg text-stone-900 tracking-tight">Descubra seu Sabor Ideal</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quiz Steps */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 pb-safe">
          {step === 1 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                  Passo 1 de 2
                </span>
                <h3 className="font-extrabold text-xl text-stone-900 mt-2 tracking-tight">
                  O que você está com mais vontade hoje?
                </h3>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  { id: 'chocolate', title: '🍫 Muito Doce & Nutella', desc: 'Chocolates nobres, Ninho, Nutella pura' },
                  { id: 'fruta', title: '🍓 Fruta Cítrica & Tropical', desc: 'Maracujá com ganache, Morango com ninho' },
                  { id: 'fit', title: '🌿 Zero Açúcar ou Fruta Pura', desc: 'Opção leve, saudável e refrescante' },
                  { id: 'drink', title: '🍸 Drink Especial Alcoólico (18+)', desc: 'Caipirinha, Espanhola com vinho' },
                  { id: 'gourmet', title: '👑 Experiência Gourmet Nobre', desc: 'Pistache italiano, Ferrero Rocher' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectCraving(opt.id)}
                    className="w-full text-left p-3.5 rounded-2xl border border-stone-200 bg-white hover:bg-rose-50/40 hover:border-rose-300 transition-all flex items-center justify-between cursor-pointer group shadow-xs"
                  >
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-stone-800 group-hover:text-rose-600">
                        {opt.title}
                      </p>
                      <p className="text-[11px] text-stone-500 font-normal">{opt.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div className="text-center">
                <span className="text-xs font-semibold text-rose-600 uppercase tracking-wider bg-rose-50 px-3 py-1 rounded-full border border-rose-100">
                  Passo 2 de 2
                </span>
                <h3 className="font-extrabold text-xl text-stone-900 mt-2 tracking-tight">
                  Qual nível de doçura você prefere?
                </h3>
              </div>

              <div className="space-y-2.5 pt-2">
                {[
                  { id: 'intenso', title: '🍯 Bem Doce e Cremoso', desc: 'Leite condensado e bastante recheio farto' },
                  { id: 'equilibrado', title: '⚖️ Equilíbrio Perfeito', desc: 'Fruta com toque doce e ganache' },
                  { id: 'suave', title: '🍃 Suave e Refrescante', desc: 'Foco no sabor natural dos ingredientes' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectSweetness(opt.id)}
                    className="w-full text-left p-3.5 rounded-2xl border border-stone-200 bg-white hover:bg-rose-50/40 hover:border-rose-300 transition-all flex items-center justify-between cursor-pointer group shadow-xs"
                  >
                    <div>
                      <p className="font-bold text-xs sm:text-sm text-stone-800 group-hover:text-rose-600">
                        {opt.title}
                      </p>
                      <p className="text-[11px] text-stone-500 font-normal">{opt.desc}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-stone-400 group-hover:text-rose-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && recommendation && (
            <div className="text-center space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-600 text-xs font-semibold border border-rose-100">
                <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                <span>Combinação Perfeita Encontrada!</span>
              </div>

              <div className="bg-white p-4 rounded-3xl border border-stone-200 space-y-3 shadow-xs">
                <div className="h-44 w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200/60">
                  <img
                    src={recommendation.image}
                    alt={recommendation.name}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>

                <div>
                  <h4 className="font-extrabold text-xl text-stone-900 tracking-tight">
                    {recommendation.name}
                  </h4>
                  <p className="text-xs text-stone-500 mt-1 font-normal">
                    {recommendation.tagline}
                  </p>
                  <span className="text-xl font-extrabold text-rose-600 block mt-1">
                    {formatCurrency(recommendation.price)}
                  </span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleAddRecommended}
                  className="w-full py-3.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm shadow-md shadow-rose-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {added ? (
                    <>
                      <Check className="w-4 h-4 text-white" />
                      <span>Adicionado à Sacola!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4" />
                      <span>Adicionar à Sacola Agora</span>
                    </>
                  )}
                </button>

                <button
                  onClick={handleReset}
                  className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center justify-center gap-1 mx-auto pt-1 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Refazer teste</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
