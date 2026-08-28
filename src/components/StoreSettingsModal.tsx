import React, { useState, useEffect } from 'react';
import { X, Settings, Save, Check, Phone, DollarSign, Store, QrCode, Printer, Truck, Lock, Shield, MapPin, Bike, Building2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { StoreSettings } from '../types';
import { NaturalisLogo } from './NaturalisLogo';

interface StoreSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: StoreSettings;
  onSaveSettings: (newSettings: StoreSettings) => void;
  onOpenNeighborhoods?: () => void;
  onLogoutAdmin?: () => void;
}

export const StoreSettingsModal: React.FC<StoreSettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
  onOpenNeighborhoods,
  onLogoutAdmin,
}) => {
  const [formData, setFormData] = useState<StoreSettings>(settings);
  const [standardFeeStr, setStandardFeeStr] = useState(String(settings.standardDeliveryFee ?? 4.0));
  const [minOrderStr, setMinOrderStr] = useState(String(settings.minOrderValue ?? 15.0));
  const [freeThresholdStr, setFreeThresholdStr] = useState(String(settings.freeDeliveryThreshold ?? 70.0));
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Sync state whenever modal opens or settings change from outside
  useEffect(() => {
    if (isOpen) {
      setFormData(settings);
      setStandardFeeStr(String(settings.standardDeliveryFee ?? 4.0));
      setMinOrderStr(String(settings.minOrderValue ?? 15.0));
      setFreeThresholdStr(String(settings.freeDeliveryThreshold ?? 70.0));
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStandardFee = Math.max(0, parseFloat(standardFeeStr.replace(',', '.')) || 0);
    const finalMinOrder = Math.max(0, parseFloat(minOrderStr.replace(',', '.')) || 0);
    const finalFreeThreshold = Math.max(0, parseFloat(freeThresholdStr.replace(',', '.')) || 0);

    const updatedSettings: StoreSettings = {
      ...formData,
      standardDeliveryFee: finalStandardFee,
      minOrderValue: finalMinOrder,
      freeDeliveryThreshold: finalFreeThreshold,
    };

    onSaveSettings(updatedSettings);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 bg-white text-stone-900 flex items-center justify-between border-b border-stone-100">
          <div className="flex items-center gap-3">
            <NaturalisLogo size={42} className="drop-shadow-xs" />
            <div>
              <h2 className="font-extrabold text-lg text-stone-900 tracking-tight">Configurações da Loja</h2>
              <p className="text-xs text-stone-500 font-normal">
                Altere WhatsApp de atendimento, valores de entrega, PIX e dados da marca
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto flex-1 p-5 space-y-4">
          {/* WhatsApp Phone */}
          <div className="p-4 bg-emerald-50/40 rounded-2xl border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800">
              <Phone className="w-4 h-4 text-emerald-600" />
              <span>Número do WhatsApp da Loja (Para Receber os Pedidos)</span>
            </div>
            <input
              type="text"
              value={formData.whatsappNumber}
              onChange={(e) => setFormData({ ...formData, whatsappNumber: e.target.value })}
              placeholder="Ex: 5511999998888 (DDI + DDD + Número)"
              className="w-full bg-white border border-emerald-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-emerald-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
            <p className="text-[11px] text-emerald-700 font-medium">
              Insira com código do país (55 para Brasil) + DDD + dígitos (sem espaços ou traços).
            </p>
          </div>

          {/* Store Name & Tagline */}
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Nome da Loja
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Slogan / Descrição Curta
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Store Operation & Delivery Mode */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>Modalidade de Entrega por Delivery</span>
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${
                formData.deliveryEnabled !== false
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {formData.deliveryEnabled !== false ? '🛵 Delivery Ativo' : '🏬 Apenas Retirada'}
              </span>
            </div>

            {/* Main Delivery Switch */}
            <div className="p-3 bg-white rounded-xl border border-stone-200 flex items-center justify-between gap-3">
              <div className="space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-stone-900">
                    {formData.deliveryEnabled !== false ? 'Entrega a Domicílio Disponível' : 'Entrega a Domicílio Pausada'}
                  </span>
                </div>
                <p className="text-[11px] text-stone-500">
                  {formData.deliveryEnabled !== false
                    ? 'Clientes podem escolher entre entrega em casa ou retirada no balcão.'
                    : 'O checkout aceitará exclusivamente pedidos para retirada no balcão.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, deliveryEnabled: formData.deliveryEnabled === false })}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.deliveryEnabled !== false ? 'bg-emerald-600' : 'bg-stone-300'
                }`}
                role="switch"
                aria-checked={formData.deliveryEnabled !== false}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    formData.deliveryEnabled !== false ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* If delivery is disabled, show warning and message box */}
            {formData.deliveryEnabled === false && (
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>Aviso exibido aos clientes no Checkout e Carrinho</span>
                </div>
                <input
                  type="text"
                  value={formData.deliveryDisabledMessage || ''}
                  onChange={(e) => setFormData({ ...formData, deliveryDisabledMessage: e.target.value })}
                  placeholder="Ex: Entregas por delivery temporariamente pausadas hoje. Aceitamos pedidos para retirada no balcão!"
                  className="w-full bg-white border border-amber-300 rounded-lg px-3 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}
          </div>

          {/* Values, Delivery & Thresholds */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <DollarSign className="w-4 h-4 text-rose-500" />
              <span>Valores, Taxas de Entrega & Limites</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Taxa de Entrega Padrão (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={standardFeeStr}
                  onChange={(e) => setStandardFeeStr(e.target.value)}
                  placeholder="6.00"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Pedido Mínimo (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={minOrderStr}
                  onChange={(e) => setMinOrderStr(e.target.value)}
                  placeholder="15.00"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Frete Grátis a partir de (R$)
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  value={freeThresholdStr}
                  onChange={(e) => setFreeThresholdStr(e.target.value)}
                  placeholder="70.00"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            {onOpenNeighborhoods && (
              <div className="pt-2 border-t border-stone-200 flex items-center justify-between gap-3">
                <div className="text-[11px] text-stone-600">
                  📍 <strong>Taxas por Bairro:</strong> Personalize o valor e tempo para cada bairro individualmente.
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenNeighborhoods();
                  }}
                  className="px-3 py-1.5 bg-white hover:bg-stone-100 border border-stone-300 rounded-xl text-xs font-bold text-stone-800 flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors shrink-0"
                >
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Gerenciar Bairros</span>
                </button>
              </div>
            )}
          </div>

          {/* PIX Key Settings */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <QrCode className="w-4 h-4 text-rose-500" />
              <span>Configurações do PIX</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">
                  Tipo de Chave
                </label>
                <select
                  value={formData.pixKeyType}
                  onChange={(e) => setFormData({ ...formData, pixKeyType: e.target.value as any })}
                  className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                >
                  <option value="Celular">Celular</option>
                  <option value="CPF/CNPJ">CPF/CNPJ</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Chave Aleatória">Chave Aleatória</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-medium text-stone-600 block mb-1">
                  Chave PIX
                </label>
                <input
                  type="text"
                  value={formData.pixKey}
                  onChange={(e) => setFormData({ ...formData, pixKey: e.target.value })}
                  placeholder="suachave@email.com"
                  className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs text-stone-900 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-medium text-stone-600 block mb-1">
                Nome do Titular da Conta PIX
              </label>
              <input
                type="text"
                value={formData.pixName}
                onChange={(e) => setFormData({ ...formData, pixName: e.target.value })}
                className="w-full bg-white border border-stone-200 rounded-xl px-2.5 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
          </div>

          {/* Address, City, Hours & Social */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <MapPin className="w-4 h-4 text-rose-500" />
              <span>Localização, Cidade & Atendimento</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Cidade e Estado (Exibido no Cabeçalho e Rodapé)
                </label>
                <input
                  type="text"
                  value={formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Ex: São Paulo - SP ou Curitiba - PR"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
                <p className="text-[10px] text-stone-500 mt-1">
                  Aparece no topo da loja ao lado dos horários de funcionamento.
                </p>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                  Instagram da Loja (@seuinstagram)
                </label>
                <input
                  type="text"
                  value={formData.instagramHandle || ''}
                  onChange={(e) => setFormData({ ...formData, instagramHandle: e.target.value })}
                  placeholder="@seunome.geladinhos"
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Endereço da Loja (Para Retiradas e Balcão)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ex: Rua das Palmeiras, 340 - Centro"
                className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                Horário de Atendimento
              </label>
              <input
                type="text"
                value={formData.openingHoursText}
                onChange={(e) => setFormData({ ...formData, openingHoursText: e.target.value })}
                placeholder="Ex: Segunda à Domingo: 8:00 às 20:00"
                className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
              />
            </div>
          </div>

          {/* Thermal Receipt Settings */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-stone-800">
              <Printer className="w-4 h-4 text-rose-500" />
              <span>Configurações do Cupom Térmico (80mm)</span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                CNPJ ou CPF (Opcional - Sai no cabeçalho do cupom)
              </label>
              <input
                type="text"
                value={formData.thermalCnpjCpf || ''}
                onChange={(e) => setFormData({ ...formData, thermalCnpjCpf: e.target.value })}
                placeholder="Ex: 12.345.678/0001-90"
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-600 block mb-1">
                Mensagem no Rodapé do Cupom
              </label>
              <input
                type="text"
                value={formData.thermalCustomFooter || ''}
                onChange={(e) => setFormData({ ...formData, thermalCustomFooter: e.target.value })}
                placeholder="Ex: Conserve no congelador a -18°C. Obrigado pela preferência!"
                className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              <div>
                <span className="text-xs font-semibold text-stone-800 block">Abrir impressão automática</span>
                <span className="text-[10px] text-stone-500">Abrir tela de impressão assim que gerar o pedido</span>
              </div>
              <input
                type="checkbox"
                checked={formData.thermalAutoOpenPrint || false}
                onChange={(e) => setFormData({ ...formData, thermalAutoOpenPrint: e.target.checked })}
                className="w-4 h-4 accent-rose-500 rounded cursor-pointer"
              />
            </div>
          </div>

          {/* Admin Security PIN Settings */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <Lock className="w-4 h-4 text-amber-600" />
                <span>Segurança & Senha do Administrador (PIN)</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Proteção do Sistema
              </span>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                PIN de Acesso Admin (4 dígitos)
              </label>
              <input
                type="text"
                maxLength={8}
                value={formData.adminPin || '1234'}
                onChange={(e) => setFormData({ ...formData, adminPin: e.target.value })}
                placeholder="1234"
                className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs text-stone-900 font-mono font-bold tracking-widest focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
              <p className="text-[10px] text-stone-500 mt-1">
                Esta senha é exigida para acessar o gerenciamento de pedidos, cardápio, estoque e configurações.
              </p>
            </div>

            {onLogoutAdmin && (
              <div className="pt-2 border-t border-amber-200/80 flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogoutAdmin();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 text-[11px] font-bold transition-all cursor-pointer"
                >
                  Encerrar Sessão de Administrador
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 px-4 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Configurações Salvas com Sucesso!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-stone-300" />
                  <span>Salvar Alterações</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

