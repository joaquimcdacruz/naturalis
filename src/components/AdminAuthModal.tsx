import React, { useState } from 'react';
import { Lock, X, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import { NaturalisLogo } from './NaturalisLogo';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPin?: string;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  currentPin = '1234',
}) => {
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetPin = currentPin || '1234';

    if (pin.trim() === targetPin.trim()) {
      setError(false);
      setPin('');
      onSuccess();
    } else {
      setError(true);
      setPin('');
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 6) {
      const nextPin = pin + digit;
      setPin(nextPin);
      setError(false);
      const targetPin = currentPin || '1234';
      if (nextPin === targetPin) {
        setTimeout(() => {
          setPin('');
          onSuccess();
        }, 150);
      }
    }
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(false);
  };

  const handleClear = () => {
    setPin('');
    setError(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Lock className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-white tracking-tight">
                Acesso do Lojista
              </h2>
              <p className="text-[11px] text-stone-400 font-normal">
                Área restrita à administração da loja
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center">
          <div className="mb-3">
            <NaturalisLogo size={56} className="drop-shadow-sm" />
          </div>

          <p className="text-xs text-stone-600 text-center mb-4 leading-relaxed font-medium">
            Digite a senha PIN de 4 dígitos para gerenciar a <strong>Naturalis Gourmet</strong> (pedidos, cardápio, estoque e frete).
          </p>

          {/* PIN Input Display */}
          <form onSubmit={handleSubmit} className="w-full flex flex-col items-center mb-5">
            <div className="flex items-center justify-center gap-3 mb-2">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-11 h-12 rounded-xl border-2 flex items-center justify-center text-xl font-bold font-mono transition-all ${
                    error
                      ? 'border-rose-500 bg-rose-50 text-rose-700 animate-shake'
                      : pin.length > index
                      ? 'border-stone-900 bg-stone-900 text-white shadow-xs'
                      : 'border-stone-200 bg-stone-50 text-stone-400'
                  }`}
                >
                  {pin.length > index ? '•' : ''}
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-xs text-rose-600 font-bold animate-in fade-in duration-150">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Senha PIN incorreta. Tente novamente.</span>
              </div>
            )}
          </form>

          {/* Numeric Keypad for fast mobile/touch & desktop click */}
          <div className="grid grid-cols-3 gap-2 w-full max-w-[260px] mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleKeypadPress(digit)}
                className="py-3 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 font-extrabold text-base rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleClear}
              className="py-3 bg-stone-50 hover:bg-stone-100 active:bg-stone-200 text-stone-500 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => handleKeypadPress('0')}
              className="py-3 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 text-stone-800 font-extrabold text-base rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              0
            </button>
            <button
              type="button"
              onClick={handleBackspace}
              className="py-3 bg-stone-50 hover:bg-stone-100 active:bg-stone-200 text-stone-500 font-semibold text-xs rounded-xl transition-all cursor-pointer"
            >
              ⌫
            </button>
          </div>

          {/* Submit Button */}
          <div className="w-full mt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="flex-1 py-2.5 px-3 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Entrar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
