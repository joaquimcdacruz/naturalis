import React, { useState } from 'react';
import { 
  Printer, 
  X, 
  Copy, 
  Check, 
  Download, 
  FileText, 
  ChefHat, 
  Truck, 
  User, 
  ExternalLink,
  Smartphone,
  ChevronDown,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { OrderRecord, StoreSettings } from '../types';
import { formatCurrency, formatPhoneDisplay } from '../utils/whatsapp';
import { generateThermalPlainText, ThermalCopyMode, ThermalWidth } from '../utils/thermalReceipt';
import { executeThermalPrint, openReceiptInNewTab } from '../utils/printReceiptHelper';

export interface ThermalReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  order?: OrderRecord | any | null;
  storeSettings: StoreSettings;
  recentOrders?: OrderRecord[];
  pastOrders?: OrderRecord[];
  onSelectOrder?: (order: OrderRecord) => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  isOpen,
  onClose,
  order: propOrder,
  storeSettings,
  recentOrders = [],
  pastOrders = [],
  onSelectOrder,
}) => {
  const [copyMode, setCopyMode] = useState<ThermalCopyMode>('cliente');
  const [paperWidth, setPaperWidth] = useState<ThermalWidth>('80mm');
  const [copiedText, setCopiedText] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printSuccessMsg, setPrintSuccessMsg] = useState<string | null>(null);

  const allRecentOrders = recentOrders.length > 0 ? recentOrders : pastOrders;

  // Fallback demo order if user clicked printer before any order was placed
  const fallbackOrder: OrderRecord = {
    id: 'demo-print-order',
    orderId: '1001',
    createdAt: new Date().toISOString(),
    status: 'recebido',
    paymentStatus: 'pago',
    subtotal: 39.50,
    deliveryFee: 5.00,
    discount: 0,
    total: 44.50,
    customer: {
      name: 'Cliente Demonstração',
      phone: '11987654321',
      deliveryType: 'delivery',
      street: 'Rua das Palmeiras',
      number: '120',
      neighborhood: 'Jardins',
      complement: 'Apto 42',
      city: storeSettings?.city || 'São Paulo - SP',
      paymentMethod: 'pix',
      deliveryOption: 'agora',
      notes: 'Entregar na portaria.',
    },
    items: [
      {
        product: {
          id: 'sabor-1787757735535',
          name: 'Maracuja Cremoso',
          tagline: 'Delícia cremosa com polpa natural',
          description: 'Cremoso à base de leite e maracujá da fruta.',
          category: 'classicos-cremosos',
          price: 7.50,
          image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN8eyfMapjBB_Bm4-YLEsXtWqTwVU5VUwnPMOBBfVgtA&s=10',
          badges: ['Mais Vendido', 'Fruta de Verdade'],
          ingredients: ['Leite integral', 'Açúcar', 'Polpa de maracujá'],
          allergens: ['Contém Leite'],
          isAvailable: true,
          volumeMl: 150,
          stockQuantity: 20,
          rating: 5.0,
          reviewsCount: 1,
          flavorProfile: { sweetness: 4, creaminess: 4, fruitiness: 3 },
        },
        quantity: 2,
      },
      {
        product: {
          id: 'maracuja-trufado',
          name: 'Maracujá Trufado Gourmet',
          tagline: 'Cremoso com ganache',
          description: 'Maracujá com calda de chocolate trufado.',
          category: 'frutas-ninho',
          price: 8.50,
          image: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=400&q=80',
          badges: ['Queridinho'],
          ingredients: ['Maracujá', 'Chocolate 50%'],
          allergens: ['Leite'],
          isAvailable: true,
          volumeMl: 150,
          stockQuantity: 25,
          rating: 4.9,
          reviewsCount: 88,
          flavorProfile: { sweetness: 4, creaminess: 4, fruitiness: 5 },
        },
        quantity: 1,
      },
      {
        product: {
          id: 'pistache-nobre',
          name: 'Pistache Nobre Italiano',
          tagline: 'Edição Gourmet',
          description: 'Pistache importado com calda artesanal.',
          category: 'premium-especiais',
          price: 12.00,
          image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=400&q=80',
          badges: ['Edição Especial'],
          ingredients: ['Pistache Puro', 'Leite Condensado'],
          allergens: ['Pistache', 'Leite'],
          isAvailable: true,
          volumeMl: 150,
          stockQuantity: 15,
          rating: 5.0,
          reviewsCount: 64,
          flavorProfile: { sweetness: 4, creaminess: 5, fruitiness: 1 },
        },
        quantity: 1,
      },
    ],
    combos: [],
    storeSettings,
  };

  const activeOrder = propOrder || (allRecentOrders.length > 0 ? allRecentOrders[0] : fallbackOrder);

  if (!isOpen) return null;

  const currentSettings = storeSettings || activeOrder.storeSettings;
  const rawThermalText = generateThermalPlainText(activeOrder, copyMode, paperWidth, currentSettings);

  const handlePrint = async () => {
    setIsPrinting(true);
    setPrintSuccessMsg('Enviando comando para a impressora...');

    try {
      await executeThermalPrint(activeOrder, copyMode, paperWidth, currentSettings);
      setPrintSuccessMsg('Comprovante gerado com sucesso!');
    } catch (err) {
      console.error(err);
      window.print();
    } finally {
      setTimeout(() => {
        setIsPrinting(false);
        setTimeout(() => setPrintSuccessMsg(null), 3000);
      }, 500);
    }
  };

  const handleOpenNewTab = () => {
    openReceiptInNewTab(activeOrder, copyMode, paperWidth, currentSettings);
  };

  const handleCopyPlainText = () => {
    navigator.clipboard.writeText(rawThermalText);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([rawThermalText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `comprovante-termico-${paperWidth}-pedido-${activeOrder.orderId || '0000'}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const now = activeOrder.createdAt ? new Date(activeOrder.createdAt) : new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  return (
    <>
      {/* Visual Interactive Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-xs animate-in fade-in duration-200 print:hidden">
        <div 
          className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col border border-stone-200 animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <Printer className="w-5 h-5 text-rose-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                    Impressão Térmica de Cupom
                  </h2>
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/30">
                    ESC/POS {paperWidth}
                  </span>
                </div>
                <p className="text-xs text-stone-400 font-normal">
                  Compatível com impressoras térmicas USB, Rede, Wi-Fi e Bluetooth (80mm / 58mm)
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

          {/* Controls Bar */}
          <div className="p-3 sm:p-4 bg-stone-100/90 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Mode selection tabs */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-stone-200/90 shadow-2xs">
              <button
                type="button"
                onClick={() => setCopyMode('cliente')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  copyMode === 'cliente'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Via do Cliente</span>
              </button>
              <button
                type="button"
                onClick={() => setCopyMode('producao')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  copyMode === 'producao'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <ChefHat className="w-3.5 h-3.5" />
                <span>Via de Cozinha</span>
              </button>
              <button
                type="button"
                onClick={() => setCopyMode('entrega')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  copyMode === 'entrega'
                    ? 'bg-stone-900 text-white shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
                }`}
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Via do Motoboy</span>
              </button>
            </div>

            {/* Width selection & Order picker */}
            <div className="flex items-center gap-2 flex-wrap">
              {allRecentOrders.length > 1 && onSelectOrder && (
                <div className="relative">
                  <select
                    value={activeOrder.orderId}
                    onChange={(e) => {
                      const found = allRecentOrders.find((o) => o.orderId === e.target.value);
                      if (found) onSelectOrder(found);
                    }}
                    className="bg-white border border-stone-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    {allRecentOrders.map((o) => (
                      <option key={o.id || o.orderId} value={o.orderId}>
                        Pedido #{o.orderId} - {o.customer?.name} ({formatCurrency(o.total)})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center bg-white p-1 rounded-xl border border-stone-200 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setPaperWidth('80mm')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    paperWidth === '80mm'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  80mm (Padrão)
                </button>
                <button
                  type="button"
                  onClick={() => setPaperWidth('58mm')}
                  className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    paperWidth === '58mm'
                      ? 'bg-rose-500 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  58mm (Mini)
                </button>
              </div>
            </div>
          </div>

          {/* Toast Notification Banner */}
          {printSuccessMsg && (
            <div className="bg-emerald-500 text-white text-xs font-bold py-2 px-4 text-center flex items-center justify-center gap-2 animate-in slide-in-from-top-2">
              <Check className="w-4 h-4" />
              <span>{printSuccessMsg}</span>
            </div>
          )}

          {/* Main Body - Paper Preview & Actions */}
          <div className="overflow-y-auto flex-1 p-4 sm:p-6 bg-stone-200/50 flex flex-col md:flex-row gap-6 items-start justify-center">
            {/* Visual Paper Slip Mockup */}
            <div className="w-full flex justify-center">
              <div 
                className={`bg-white text-stone-950 shadow-xl rounded-sm p-5 border border-stone-300 font-mono text-xs leading-tight transition-all relative ${
                  paperWidth === '80mm' ? 'max-w-[360px] w-full' : 'max-w-[280px] w-full'
                }`}
                style={{
                  boxShadow: '0 4px 20px rgba(0,0,0,0.12), 0 1px 3px rgba(0,0,0,0.06)',
                  backgroundColor: '#ffffff'
                }}
              >
                {/* Printable Content Replica */}
                <div className="text-center space-y-1 pb-3 border-b-2 border-dashed border-stone-400">
                  <h3 className="font-black text-sm tracking-tighter uppercase text-black">
                    {currentSettings.storeName}
                  </h3>
                  <p className="text-[10px] text-stone-600 font-medium">
                    {currentSettings.tagline}
                  </p>
                  {currentSettings.thermalCnpjCpf && (
                    <p className="text-[9px] text-stone-600">
                      CNPJ/CPF: {currentSettings.thermalCnpjCpf}
                    </p>
                  )}
                  <p className="text-[9px] text-stone-600">
                    {currentSettings.address} - {currentSettings.city}
                  </p>
                  <p className="text-[9px] font-bold text-black">
                    WhatsApp: {formatPhoneDisplay(currentSettings.whatsappNumber)}
                  </p>
                </div>

                {/* Mode & Order Number */}
                <div className="py-2.5 my-2 border-y border-stone-300 text-center bg-stone-100/80">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider block text-stone-800">
                    {copyMode === 'producao' ? 'VIA DE PRODUÇÃO / COZINHA' : copyMode === 'entrega' ? 'VIA DO ENTREGADOR / MOTOBOY' : 'COMPROVANTE DO CLIENTE'}
                  </span>
                  <div className="text-lg font-black tracking-tight text-black mt-0.5">
                    PEDIDO #{activeOrder.orderId || '0000'}
                  </div>
                  <div className="text-[9px] text-stone-600 flex justify-between px-2 mt-1">
                    <span>{dateFormatted} {timeFormatted}</span>
                    <span className="font-bold uppercase">
                      {activeOrder.customer?.deliveryType === 'delivery' ? '🛵 DELIVERY' : '🏬 RETIRADA'}
                    </span>
                  </div>
                </div>

                {/* Customer Data */}
                <div className="py-2 border-b border-dashed border-stone-400 space-y-0.5 text-[10px]">
                  <div className="font-bold text-black">
                    CLIENTE: <span className="font-normal">{activeOrder.customer?.name}</span>
                  </div>
                  <div className="font-bold text-black">
                    CONTATO: <span className="font-normal">{formatPhoneDisplay(activeOrder.customer?.phone || '')}</span>
                  </div>

                  {activeOrder.customer?.deliveryType === 'delivery' ? (
                    <div className="pt-1 mt-1 border-t border-stone-200">
                      <div className="font-bold text-black">ENDEREÇO DE ENTREGA:</div>
                      <div>{activeOrder.customer?.street}, nº {activeOrder.customer?.number}</div>
                      <div>Bairro: {activeOrder.customer?.neighborhood} - {activeOrder.customer?.city || currentSettings.city}</div>
                      {activeOrder.customer?.complement && (
                        <div>Compl: {activeOrder.customer?.complement}</div>
                      )}
                      {activeOrder.customer?.reference && (
                        <div>Ref: {activeOrder.customer?.reference}</div>
                      )}
                      {activeOrder.customer?.deliveryOption === 'agendado' && activeOrder.customer?.scheduledDate && (
                        <div className="font-bold text-black mt-0.5 bg-stone-200 px-1 py-0.5 rounded">
                          ⏰ AGENDADO: {activeOrder.customer.scheduledDate} às {activeOrder.customer.scheduledTime}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="pt-1 mt-1 border-t border-stone-200">
                      <div className="font-bold text-black">RETIRADA NO BALCÃO:</div>
                      <div>{currentSettings.address}</div>
                    </div>
                  )}
                </div>

                {/* Items Breakdown */}
                <div className="py-2 border-b-2 border-stone-400 space-y-1 text-[10px]">
                  <div className="flex justify-between font-bold text-black pb-1 border-b border-stone-300">
                    <span>QTD ITEM</span>
                    {copyMode !== 'producao' && <span>TOTAL</span>}
                  </div>

                  {/* Individual Products */}
                  {activeOrder.items && activeOrder.items.map((item: any, idx: number) => {
                    const itemTotal = (item.product?.price || 0) * item.quantity;
                    return (
                      <div key={idx} className="space-y-0.5">
                        <div className="flex justify-between items-baseline font-medium text-black">
                          <span className="pr-1">
                            {copyMode === 'producao' && <span className="font-bold">[ ] </span>}
                            <strong>{item.quantity}x</strong> {item.product?.name}
                          </span>
                          {copyMode !== 'producao' && (
                            <span className="font-bold shrink-0">{formatCurrency(itemTotal)}</span>
                          )}
                        </div>
                        {item.customNotes && (
                          <div className="text-[9px] text-stone-600 pl-4 italic">
                            ↳ Obs: {item.customNotes}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Combos */}
                  {activeOrder.combos && activeOrder.combos.map((comboItem: any, idx: number) => {
                    const comboTotal = (comboItem.combo?.price || 0) * comboItem.quantity;
                    return (
                      <div key={idx} className="pt-1 mt-1 border-t border-stone-200 space-y-0.5">
                        <div className="flex justify-between items-baseline font-bold text-black">
                          <span>
                            {copyMode === 'producao' && <span>[ ] </span>}
                            {comboItem.quantity}x [KIT] {comboItem.combo?.title}
                          </span>
                          {copyMode !== 'producao' && (
                            <span>{formatCurrency(comboTotal)}</span>
                          )}
                        </div>
                        {comboItem.selectedFlavors && (
                          <div className="text-[9px] text-stone-700 pl-2 space-y-0.5">
                            {comboItem.selectedFlavors.map((f: any, fIdx: number) => (
                              <div key={fIdx}>- {f.quantity}x {f.product?.name}</div>
                            ))}
                          </div>
                        )}
                        {comboItem.combo?.includesThermalBag && (
                          <div className="text-[8px] text-stone-600 pl-2">
                            * Inclui Embalagem Térmica *
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Financial Summary */}
                {copyMode !== 'producao' && (
                  <div className="py-2 border-b-2 border-dashed border-stone-400 space-y-1 text-[10px]">
                    <div className="flex justify-between text-stone-700">
                      <span>Subtotal:</span>
                      <span>{formatCurrency(activeOrder.subtotal || 0)}</span>
                    </div>

                    {activeOrder.discount > 0 && (
                      <div className="flex justify-between text-stone-700">
                        <span>Desconto:</span>
                        <span>-{formatCurrency(activeOrder.discount)}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-stone-700">
                      <span>Taxa de Entrega:</span>
                      <span>{activeOrder.deliveryFee > 0 ? formatCurrency(activeOrder.deliveryFee) : 'GRÁTIS'}</span>
                    </div>

                    <div className="flex justify-between text-xs font-black text-black pt-1 mt-1 border-t-2 border-black bg-stone-100 p-1">
                      <span>TOTAL GERAL:</span>
                      <span>{formatCurrency(activeOrder.total || 0)}</span>
                    </div>
                  </div>
                )}

                {/* Payment Info */}
                {copyMode !== 'producao' && (
                  <div className="py-2 border-b border-dashed border-stone-400 space-y-0.5 text-[10px]">
                    <div className="font-bold text-black">FORMA DE PAGAMENTO:</div>
                    {activeOrder.customer?.paymentMethod === 'pix' && (
                      <div className="text-stone-800">
                        <div>⚡ PAGAMENTO VIA PIX</div>
                        <div className="text-[9px] font-mono text-stone-700">
                          Chave {currentSettings.pixKeyType}: {currentSettings.pixKey}
                        </div>
                      </div>
                    )}
                    {activeOrder.customer?.paymentMethod === 'cartao_entrega' && (
                      <div className="text-stone-800">
                        <div>💳 CARTÃO NA ENTREGA</div>
                        <div className="text-[9px]">(Levar máquina débito/crédito)</div>
                      </div>
                    )}
                    {activeOrder.customer?.paymentMethod === 'dinheiro' && (
                      <div className="text-stone-800">
                        <div>💵 DINHEIRO</div>
                        {activeOrder.customer?.changeFor ? (
                          <div className="font-bold">Troco para: {activeOrder.customer.changeFor}</div>
                        ) : (
                          <div>(Valor exato / Sem troco)</div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Customer Notes */}
                {activeOrder.customer?.notes && (
                  <div className="py-2 border-b border-stone-300 text-[10px]">
                    <div className="font-bold text-black">OBSERVAÇÕES:</div>
                    <div className="italic text-stone-700">{activeOrder.customer.notes}</div>
                  </div>
                )}

                {/* Footer Message */}
                <div className="pt-3 text-center space-y-1 text-[9px] text-stone-600">
                  <p>{currentSettings.thermalCustomFooter || 'Conserve no congelador a -18°C.'}</p>
                  <p className="font-bold text-black">Obrigado pela preferência!</p>
                  <div className="pt-2 text-[8px] text-stone-400 tracking-widest">
                    - - - - - CORTE AQUI ✂ - - - - -
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions & ESC/POS Plain Text Preview Column */}
            <div className="w-full md:w-80 flex flex-col gap-3 shrink-0">
              {/* Main Print Button with Immediate Trigger */}
              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="w-full py-4 px-5 rounded-2xl bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold text-sm sm:text-base shadow-lg shadow-rose-500/25 active:scale-98 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-75"
                id="thermal-print-now-btn"
              >
                <Printer className="w-5 h-5 text-white" />
                <span>{isPrinting ? 'Preparando Impressão...' : `Imprimir Agora (${paperWidth})`}</span>
              </button>

              {/* Open in New Tab Option (Bypasses any iframe limitations) */}
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Abre o cupom limpo em nova aba com diálogo de impressão direto"
              >
                <ExternalLink className="w-3.5 h-3.5 text-rose-400" />
                <span>Abrir Cupom em Nova Aba</span>
              </button>

              {/* Secondary Action Buttons */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleCopyPlainText}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-bold text-xs shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Copiar texto puro para enviar a impressoras Bluetooth ou apps como RawBT"
                >
                  {copiedText ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-stone-600" />}
                  <span>{copiedText ? 'Copiado!' : 'Copiar Texto'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="py-2.5 px-3 rounded-xl bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 font-bold text-xs shadow-xs active:scale-98 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Baixar arquivo TXT para spooler de impressão térmica"
                >
                  <Download className="w-4 h-4 text-stone-700" />
                  <span>Baixar .TXT</span>
                </button>
              </div>

              {/* Instructions Box */}
              <div className="p-3.5 bg-white rounded-2xl border border-stone-200 space-y-2 text-xs text-stone-600 shadow-xs">
                <div className="flex items-center gap-2 font-bold text-stone-900">
                  <Smartphone className="w-4 h-4 text-rose-500" />
                  <span>Dicas de Impressão Térmica:</span>
                </div>
                <ul className="space-y-1 text-[11px] list-disc list-inside text-stone-600 leading-relaxed">
                  <li>
                    <strong>Impressoras USB/Rede:</strong> Clique em <em>Imprimir Agora</em> e selecione sua impressora de 80mm ou 58mm.
                  </li>
                  <li>
                    <strong>Impressoras Bluetooth/Celular:</strong> Copie o texto térmico e cole em apps como <em>RawBT</em> ou <em>QuickPrinter</em>.
                  </li>
                  <li>
                    Nas opções de impressão do navegador, desmarque <em>"Cabeçalhos e rodapés"</em>.
                  </li>
                </ul>
              </div>

              {/* Monospace Plaintext Code Preview */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold text-stone-700 px-1">
                  <span>Texto ESC/POS:</span>
                  <span className="text-[10px] text-stone-500 font-mono">{paperWidth === '80mm' ? '44 cols' : '32 cols'}</span>
                </div>
                <pre className="p-3 bg-stone-900 text-stone-200 rounded-xl text-[10px] font-mono whitespace-pre overflow-x-auto max-h-36 leading-tight border border-stone-800">
                  {rawThermalText}
                </pre>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-white border-t border-stone-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
            >
              Fechar
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleOpenNewTab}
                className="px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5 text-stone-600" />
                <span>Nova Aba</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                disabled={isPrinting}
                className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-75"
              >
                <Printer className="w-4 h-4 text-rose-400" />
                <span>Imprimir Cupom {paperWidth}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
