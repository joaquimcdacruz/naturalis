import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  ShoppingBag, 
  CreditCard, 
  Banknote, 
  QrCode, 
  Send, 
  Clock, 
  Building2, 
  Check, 
  Copy, 
  AlertCircle,
  Sparkles,
  Phone,
  User,
  Calendar
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { CartItem, CartComboItem, CustomerDetails, StoreSettings, DeliveryType, PaymentMethod, NeighborhoodFee } from '../types';
import { NEIGHBORHOODS_DATA } from '../data/products';
import { formatCurrency, generateWhatsAppMessage, buildWhatsAppUrl, generateShortOrderId } from '../utils/whatsapp';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  combos: CartComboItem[];
  storeSettings: StoreSettings;
  neighborhoods?: NeighborhoodFee[];
  onOrderCompleted: (orderSummary: any, whatsappUrl: string, rawMessage: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  items = [],
  combos = [],
  storeSettings,
  neighborhoods = NEIGHBORHOODS_DATA,
  onOrderCompleted,
}) => {
  const activeNeighborhoods = React.useMemo(() => {
    const rawList = Array.isArray(neighborhoods) && neighborhoods.length > 0 ? neighborhoods : NEIGHBORHOODS_DATA;
    const list = rawList.filter((n) => n && typeof n.name === 'string' && n.isActive !== false);
    return list.length > 0 ? list : NEIGHBORHOODS_DATA;
  }, [neighborhoods]);

  // Compute lowest delivery fee among active neighborhoods
  const lowestDeliveryFee = React.useMemo(() => {
    if (!activeNeighborhoods || activeNeighborhoods.length === 0) {
      return storeSettings?.standardDeliveryFee ?? 4.0;
    }
    const fees = activeNeighborhoods
      .filter((n) => n && typeof n.fee === 'number' && !isNaN(n.fee))
      .map((n) => n.fee);
    return fees.length > 0 ? Math.min(...fees) : (storeSettings?.standardDeliveryFee ?? 4.0);
  }, [activeNeighborhoods, storeSettings?.standardDeliveryFee]);

  // Check if delivery is enabled in store settings
  const isDeliveryEnabled = storeSettings?.deliveryEnabled !== false;

  const [deliveryType, setDeliveryType] = useState<DeliveryType>(() => (
    storeSettings?.deliveryEnabled === false ? 'retirada' : 'delivery'
  ));
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [neighborhood, setNeighborhood] = useState(() => activeNeighborhoods[0]?.name || 'Centro');
  const [complement, setComplement] = useState('');
  const [reference, setReference] = useState('');
  const [city, setCity] = useState(storeSettings?.city || 'Olímpia - SP');
  
  const [deliveryOption, setDeliveryOption] = useState<'agora' | 'agendado'>('agora');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [changeFor, setChangeFor] = useState('');
  const [notes, setNotes] = useState('');

  const [copiedPix, setCopiedPix] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Enforce pickup if delivery is turned off in store settings
  React.useEffect(() => {
    if (!isDeliveryEnabled && deliveryType === 'delivery') {
      setDeliveryType('retirada');
    }
  }, [isDeliveryEnabled, deliveryType]);

  // Keep neighborhood selected in sync if activeNeighborhoods change
  React.useEffect(() => {
    if (activeNeighborhoods.length > 0 && !activeNeighborhoods.some((n) => n.name === neighborhood)) {
      setNeighborhood(activeNeighborhoods[0].name);
    }
  }, [activeNeighborhoods, neighborhood]);

  // Keep city in sync with storeSettings
  React.useEffect(() => {
    if (storeSettings?.city) {
      setCity(storeSettings.city);
    }
  }, [storeSettings?.city]);

  if (!isOpen) return null;

  // Calculate values safely
  const validItems = (items || []).filter((i) => i && i.product);
  const validCombos = (combos || []).filter((c) => c && c.combo);

  const itemsSubtotal = validItems.reduce((acc, i) => {
    const price = typeof i.product?.price === 'number' ? i.product.price : 0;
    const qty = typeof i.quantity === 'number' ? i.quantity : 1;
    return acc + (price * qty);
  }, 0);

  const combosSubtotal = validCombos.reduce((acc, c) => {
    const price = typeof c.combo?.price === 'number' ? c.combo.price : 0;
    const qty = typeof c.quantity === 'number' ? c.quantity : 1;
    return acc + (price * qty);
  }, 0);

  const subtotal = itemsSubtotal + combosSubtotal;
  const freeThreshold = storeSettings?.freeDeliveryThreshold ?? 70;
  const isFreeDelivery = subtotal >= freeThreshold;

  // Selected neighborhood fee
  const selectedNeighborhoodObj = activeNeighborhoods.find((n) => n.name === neighborhood) ||
    (Array.isArray(neighborhoods) ? neighborhoods.find((n) => n && n.name === neighborhood) : undefined) ||
    activeNeighborhoods[0];

  const rawDeliveryFee = deliveryType === 'delivery'
    ? (selectedNeighborhoodObj && typeof selectedNeighborhoodObj.fee === 'number' ? selectedNeighborhoodObj.fee : (storeSettings?.standardDeliveryFee ?? 4.0))
    : 0;
  const deliveryFee = isFreeDelivery || deliveryType === 'retirada' ? 0 : rawDeliveryFee;

  const total = subtotal + deliveryFee;

  const handleCopyPix = () => {
    if (storeSettings?.pixKey && navigator.clipboard) {
      navigator.clipboard.writeText(storeSettings.pixKey);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 2000);
    }
  };

  const handleFinishOrder = () => {
    setErrorMessage('');

    // Validations
    if (!name.trim()) {
      setErrorMessage('Por favor, informe o seu nome.');
      return;
    }
    if (!phone.trim() || phone.replace(/\D/g, '').length < 10) {
      setErrorMessage('Por favor, informe um número de WhatsApp válido com DDD.');
      return;
    }

    if (deliveryType === 'delivery') {
      if (!street.trim() || !number.trim()) {
        setErrorMessage('Por favor, informe a Rua e o Número para a entrega.');
        return;
      }
      if (!neighborhood.trim()) {
        setErrorMessage('Por favor, selecione ou informe o seu Bairro.');
        return;
      }
      if (selectedNeighborhoodObj?.minOrderValue && subtotal < selectedNeighborhoodObj.minOrderValue) {
        setErrorMessage(`O pedido mínimo para o bairro "${selectedNeighborhoodObj.name}" é de ${formatCurrency(selectedNeighborhoodObj.minOrderValue)}.`);
        return;
      }
    }

    if (deliveryOption === 'agendado' && (!scheduledDate || !scheduledTime)) {
      setErrorMessage('Por favor, informe a data e o horário desejado para a entrega agendada.');
      return;
    }

    const customerDetails: CustomerDetails = {
      name: name.trim(),
      phone: phone.trim(),
      deliveryType,
      street: street.trim(),
      number: number.trim(),
      neighborhood: neighborhood.trim(),
      complement: complement.trim(),
      reference: reference.trim(),
      city: city.trim(),
      paymentMethod,
      changeFor: paymentMethod === 'dinheiro' ? changeFor : undefined,
      deliveryOption,
      scheduledDate: deliveryOption === 'agendado' ? scheduledDate : undefined,
      scheduledTime: deliveryOption === 'agendado' ? scheduledTime : undefined,
      notes: notes.trim() ? notes.trim() : undefined,
    };

    const orderId = generateShortOrderId();

    const summaryData = {
      items,
      combos,
      customer: customerDetails,
      deliveryFee,
      subtotal,
      discount: 0,
      total,
      storeSettings,
      orderId,
    };

    const formattedMessage = generateWhatsAppMessage(summaryData);
    const whatsappUrl = buildWhatsAppUrl(storeSettings?.whatsappNumber || '5517999999999', formattedMessage);

    // Fire celebratory confetti!
    try {
      if (typeof confetti === 'function') {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      }
    } catch {}

    onOrderCompleted(summaryData, whatsappUrl, formattedMessage);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] sm:max-h-[92vh] flex flex-col border-t sm:border border-stone-200 animate-in slide-in-from-bottom-6 sm:zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile drag handle indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto my-2.5 sm:hidden shrink-0" />

        {/* Modal Top Banner */}
        <div className="p-4 sm:p-5 bg-white text-stone-900 flex items-center justify-between border-b border-stone-100">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-xl text-stone-900 tracking-tight">Finalizar Pedido</h2>
              <p className="text-xs text-stone-500 font-normal">
                Receba seu pedido geladinho rapidamente via WhatsApp!
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

        {/* Scrollable Form Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 space-y-6">
          {/* Error notification banner if any */}
          {errorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700 animate-in shake">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Delivery Paused Banner if delivery is disabled */}
          {!isDeliveryEnabled && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold text-amber-950">Apenas Retirada no Balcão</p>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  {storeSettings?.deliveryDisabledMessage || 'No momento as entregas por delivery estão temporariamente pausadas. Seu pedido será embalado para retirada rápida em nosso balcão!'}
                </p>
              </div>
            </div>
          )}

          {/* 1. Delivery Type Switcher */}
          <div>
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block mb-2">
              1. Como deseja receber seu pedido?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                disabled={!isDeliveryEnabled}
                onClick={() => {
                  if (isDeliveryEnabled) {
                    setDeliveryType('delivery');
                  }
                }}
                className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 ${
                  !isDeliveryEnabled
                    ? 'opacity-60 bg-stone-50 border-stone-200 cursor-not-allowed text-stone-400'
                    : deliveryType === 'delivery'
                    ? 'border-rose-500 bg-rose-50/50 text-stone-900 shadow-xs cursor-pointer'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white cursor-pointer'
                }`}
                title={!isDeliveryEnabled ? 'Entrega por delivery temporariamente desativada' : 'Receber em casa'}
              >
                <div className={`p-2 rounded-xl ${
                  !isDeliveryEnabled
                    ? 'bg-stone-200 text-stone-500'
                    : deliveryType === 'delivery'
                    ? 'bg-rose-500 text-white'
                    : 'bg-stone-100 text-stone-600'
                }`}>
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs sm:text-sm text-stone-900">Entrega Delivery</p>
                    {!isDeliveryEnabled && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                        Pausado
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-500 font-medium">
                    {!isDeliveryEnabled
                      ? 'Indisponível hoje'
                      : isFreeDelivery
                      ? '🎉 Frete Grátis!'
                      : lowestDeliveryFee === 0
                      ? 'Grátis'
                      : `A partir de ${formatCurrency(lowestDeliveryFee)}`}
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('retirada')}
                className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                  deliveryType === 'retirada'
                    ? 'border-rose-500 bg-rose-50/50 text-stone-900 shadow-xs ring-1 ring-rose-500/20'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                }`}
              >
                <div className={`p-2 rounded-xl ${deliveryType === 'retirada' ? 'bg-rose-500 text-white' : 'bg-stone-100 text-stone-600'}`}>
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="font-bold text-xs sm:text-sm text-stone-900">Retirada no Balcão</p>
                    {!isDeliveryEnabled && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Ativo
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-600 font-semibold">Grátis • Sem taxa</p>
                </div>
              </button>
            </div>

            {deliveryType === 'retirada' && (
              <div className="mt-2.5 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs text-stone-700 font-medium flex items-center gap-2">
                <span className="shrink-0">📍</span>
                <span><strong>Local de Retirada:</strong> {storeSettings?.address || 'Centro'} ({storeSettings?.city || 'Olímpia - SP'})</span>
              </div>
            )}
          </div>

          {/* 2. Customer Contact Info */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              2. Seus Dados de Contato
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Seu Nome Completo *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Maria Silva"
                    className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  WhatsApp com DDD *
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Ex: (11) 99999-8888"
                    className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-2.5 text-xs text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 3. Address Information (If delivery) */}
          {deliveryType === 'delivery' && (
            <div className="space-y-3">
              <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
                3. Endereço de Entrega
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                {/* Street */}
                <div className="sm:col-span-8">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Rua / Avenida *
                  </label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    placeholder="Ex: Rua das Flores"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                {/* Number */}
                <div className="sm:col-span-4">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Número *
                  </label>
                  <input
                    type="text"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    placeholder="Ex: 123 ou S/N"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                {/* Neighborhood selector */}
                <div className="sm:col-span-6">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Bairro (com taxa de entrega) *
                  </label>
                  <select
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer"
                  >
                    {activeNeighborhoods.map((n) => (
                      <option key={n.id || n.name} value={n.name}>
                        {n.name} ({isFreeDelivery ? 'Frete Grátis' : n.fee === 0 ? 'Grátis' : formatCurrency(n.fee)}) • ~{n.estimatedTimeMin || 30} min
                      </option>
                    ))}
                  </select>
                  {selectedNeighborhoodObj?.notes && (
                    <p className="text-[11px] text-stone-500 mt-1">
                      💡 {selectedNeighborhoodObj.notes}
                    </p>
                  )}
                  {selectedNeighborhoodObj?.minOrderValue && selectedNeighborhoodObj.minOrderValue > 0 && (
                    <p className="text-[11px] text-amber-700 mt-0.5">
                      ⚠️ Pedido mínimo para este bairro: {formatCurrency(selectedNeighborhoodObj.minOrderValue)}
                    </p>
                  )}
                </div>

                {/* Complement */}
                <div className="sm:col-span-6">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Complemento (Apto, Bloco, Casa 2)
                  </label>
                  <input
                    type="text"
                    value={complement}
                    onChange={(e) => setComplement(e.target.value)}
                    placeholder="Ex: Bloco B Apto 42"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>

                {/* Reference point */}
                <div className="sm:col-span-12">
                  <label className="text-xs font-semibold text-stone-700 block mb-1">
                    Ponto de Referência
                  </label>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value)}
                    placeholder="Ex: Próximo à padaria central, casa com portão branco"
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-2.5 text-xs text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 4. Delivery Schedule */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              4. Quando deseja receber?
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryOption('agora')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  deliveryOption === 'agora'
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 text-stone-700 bg-white hover:bg-stone-50'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>O quanto antes (hoje)</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryOption('agendado')}
                className={`p-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  deliveryOption === 'agendado'
                    ? 'border-stone-900 bg-stone-900 text-white'
                    : 'border-stone-200 text-stone-700 bg-white hover:bg-stone-50'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Agendar data / hora</span>
              </button>
            </div>

            {deliveryOption === 'agendado' && (
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-stone-50 rounded-xl border border-stone-200 animate-in fade-in">
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Data Desejada
                  </label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-stone-700 block mb-1">
                    Horário Aproximado
                  </label>
                  <input
                    type="time"
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 font-medium focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 5. Payment Method */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-stone-500 uppercase tracking-wider block">
              5. Forma de Pagamento
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('pix')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'pix'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-800 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                }`}
              >
                <QrCode className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <span className="text-xs font-bold block">PIX</span>
                <span className="text-[10px] text-emerald-700 font-medium">Mais Rápido</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('cartao_entrega')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'cartao_entrega'
                    ? 'border-rose-500 bg-rose-50 text-rose-700 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                }`}
              >
                <CreditCard className="w-5 h-5 mx-auto mb-1 text-rose-500" />
                <span className="text-xs font-bold block">Cartão</span>
                <span className="text-[10px] text-stone-500 font-medium">Na Entrega</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('dinheiro')}
                className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                  paymentMethod === 'dinheiro'
                    ? 'border-amber-500 bg-amber-50 text-amber-800 shadow-xs'
                    : 'border-stone-200 hover:border-stone-300 text-stone-700 bg-white'
                }`}
              >
                <Banknote className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <span className="text-xs font-bold block">Dinheiro</span>
                <span className="text-[10px] text-stone-500 font-medium">Com Troco</span>
              </button>
            </div>

            {/* Pix key copy preview */}
            {paymentMethod === 'pix' && (
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-stone-500 font-medium text-[11px] block">
                    Chave PIX ({storeSettings?.pixKeyType || 'Celular'}):
                  </span>
                  <span className="font-mono font-bold text-emerald-800 select-all">
                    {storeSettings?.pixKey || '11999998888'}
                  </span>
                  <span className="text-[10px] text-stone-500 block font-medium">
                    Titular: {storeSettings?.pixName || 'Naturalis Gourmet'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyPix}
                  className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center gap-1 shadow-xs cursor-pointer"
                >
                  {copiedPix ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                </button>
              </div>
            )}

            {/* Change for cash */}
            {paymentMethod === 'dinheiro' && (
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200">
                <label className="text-xs font-semibold text-stone-700 block mb-1">
                  Precisa de troco para quanto?
                </label>
                <input
                  type="text"
                  value={changeFor}
                  onChange={(e) => setChangeFor(e.target.value)}
                  placeholder="Ex: Troco para R$ 50,00 (ou deixe em branco se não precisar)"
                  className="w-full bg-white border border-stone-200 rounded-lg px-3 py-2 text-xs text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>
            )}
          </div>

          {/* 6. General observations */}
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">
              Observações Gerais do Pedido (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Ex: Chamar no interfone 102, enviar colherzinha descartável, etc."
              className="w-full bg-white border border-stone-200 rounded-xl p-3 text-xs text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
            />
          </div>
        </div>

        {/* Modal Bottom Summary & WhatsApp Submit */}
        <div className="p-3.5 sm:p-5 bg-white border-t border-stone-100 space-y-3 pb-safe">
          {/* Order Totals Recap */}
          <div className="bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-stone-600 font-medium">
              <span>Subtotal dos Geladinhos:</span>
              <span className="font-bold text-stone-900">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-stone-600 font-medium">
              <span>Taxa de Entrega ({deliveryType === 'delivery' ? neighborhood : 'Retirada'}):</span>
              <span className="font-bold text-stone-900">
                {deliveryFee === 0 ? (
                  <span className="text-emerald-700 font-bold">GRÁTIS</span>
                ) : (
                  formatCurrency(deliveryFee)
                )}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-stone-900 pt-1.5 border-t border-stone-200/60">
              <span>Total a Pagar:</span>
              <span className="text-rose-600 text-lg">{formatCurrency(total)}</span>
            </div>
          </div>

          {/* Big Green WhatsApp Send Action */}
          <button
            onClick={handleFinishOrder}
            className="w-full py-4 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            id="checkout-send-whatsapp-btn"
          >
            <Send className="w-5 h-5" />
            <span>Enviar Pedido para o WhatsApp</span>
          </button>
        </div>
      </div>
    </div>
  );
};
