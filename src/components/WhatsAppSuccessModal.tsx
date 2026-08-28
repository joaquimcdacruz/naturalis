import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Copy, Check, QrCode, ExternalLink, RotateCcw, Heart, Printer, Boxes } from 'lucide-react';
import { StoreSettings } from '../types';
import { formatCurrency } from '../utils/whatsapp';
import { NaturalisLogo } from './NaturalisLogo';

interface WhatsAppSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderSummary: any;
  whatsappUrl: string;
  rawMessage: string;
  storeSettings: StoreSettings;
  onNewOrder: () => void;
  onOpenThermalPrint?: () => void;
}

export const WhatsAppSuccessModal: React.FC<WhatsAppSuccessModalProps> = ({
  isOpen,
  onClose,
  whatsappUrl,
  rawMessage,
  orderSummary,
  storeSettings,
  onNewOrder,
  onOpenThermalPrint,
}) => {
  const [copiedMessage, setCopiedMessage] = useState(false);
  const [copiedPix, setCopiedPix] = useState(false);

  if (!isOpen) return null;

  const handleCopyMessage = () => {
    if (rawMessage && navigator.clipboard) {
      navigator.clipboard.writeText(rawMessage);
      setCopiedMessage(true);
      setTimeout(() => setCopiedMessage(false), 2000);
    }
  };

  const handleCopyPix = () => {
    if (storeSettings?.pixKey && navigator.clipboard) {
      navigator.clipboard.writeText(storeSettings.pixKey);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  const handleOpenWhatsApp = () => {
    if (whatsappUrl) {
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[92vh] flex flex-col border-t sm:border border-stone-200 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Top Success Header */}
        <div className="p-6 bg-white text-stone-900 text-center border-b border-stone-100">
          <div className="flex items-center justify-center gap-3 mb-2">
            <NaturalisLogo size={48} className="drop-shadow-xs" />
            <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
              <CheckCircle2 className="w-7 h-7 text-emerald-600" />
            </div>
          </div>
          <h2 className="font-extrabold text-2xl tracking-tight text-stone-900">
            Pedido Gerado com Sucesso!
          </h2>
          <p className="text-xs text-stone-500 mt-1 max-w-xs mx-auto font-normal">
            Seu pedido na <strong>Naturalis Gourmet</strong> (#{orderSummary?.orderId || '0000'}) está pronto para ser enviado pelo WhatsApp.
          </p>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* WhatsApp Direct Action Button */}
          <button
            onClick={handleOpenWhatsApp}
            className="w-full py-4 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
            <span>Abrir WhatsApp para Enviar</span>
            <ExternalLink className="w-4 h-4 text-white/80" />
          </button>

          {/* Thermal Print 80mm Direct Button */}
          {onOpenThermalPrint && (
            <button
              onClick={onOpenThermalPrint}
              className="w-full py-3 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm border border-stone-800 shadow-md active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
              id="success-print-thermal-btn"
            >
              <Printer className="w-4 h-4 text-rose-400" />
              <span>Imprimir Cupom Térmico (80mm)</span>
            </button>
          )}

          {/* If PIX payment */}
          {orderSummary?.customer?.paymentMethod === 'pix' && (
            <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-2">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
                <QrCode className="w-4 h-4 text-emerald-600" />
                <span>Dados para Pagamento via PIX:</span>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-200/80">
                <div className="text-xs">
                  <span className="text-[10px] text-stone-500 block font-medium">Chave {storeSettings?.pixKeyType || 'PIX'}:</span>
                  <span className="font-mono font-bold text-emerald-700 select-all">{storeSettings?.pixKey || ''}</span>
                </div>
                <button
                  onClick={handleCopyPix}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                >
                  {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
              <p className="text-[11px] text-emerald-800 font-medium">
                Valor Total do Pedido: <strong className="font-bold">{formatCurrency(orderSummary?.total || 0)}</strong>
              </p>
            </div>
          )}

          {/* Automatic Inventory Deduction Feedback */}
          {orderSummary?.stockDeductions && orderSummary.stockDeductions.length > 0 && (
            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-800">
                <span className="flex items-center gap-1.5 text-stone-900">
                  <Boxes className="w-4 h-4 text-rose-500" />
                  <span>Baixa Automática no Estoque Concluída</span>
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Atualizado
                </span>
              </div>
              <div className="space-y-1 text-xs">
                {orderSummary.stockDeductions.map((d: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between py-0.5 text-stone-600">
                    <span className="truncate pr-2">
                      • {d.productName}: <strong className="text-rose-600 font-semibold">-{d.quantityDeducted} un.</strong>
                    </span>
                    <span className="text-[11px] text-stone-500 shrink-0 font-mono">
                      (saldo: {d.remainingStock} un.)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Formatted Message Box Preview with Copy */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-stone-700">Mensagem Formatada do Pedido:</span>
              <button
                onClick={handleCopyMessage}
                className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1 cursor-pointer"
              >
                {copiedMessage ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedMessage ? 'Copiada!' : 'Copiar Mensagem'}</span>
              </button>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 max-h-48 overflow-y-auto text-[11px] text-stone-700 font-mono whitespace-pre-wrap leading-relaxed">
              {rawMessage}
            </div>
          </div>

          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-600 font-normal flex items-start gap-2.5">
            <Heart className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <p>
              Ao abrir o WhatsApp, basta clicar em <strong className="font-semibold text-stone-800">Enviar</strong> para receber a confirmação do atendente e o tempo estimado de entrega.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 bg-white border-t border-stone-100 flex items-center justify-between pb-safe">
          <button
            onClick={onNewOrder}
            className="text-xs font-semibold text-stone-600 hover:text-stone-900 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Fazer Novo Pedido</span>
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
          >
            OK, Abrir WhatsApp
          </button>
        </div>
      </div>
    </div>
  );
};
