import React, { useState, useMemo } from 'react';
import {
  X,
  ShoppingBag,
  Clock,
  Phone,
  MapPin,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Printer,
  MessageCircle,
  ChevronRight,
  TrendingUp,
  DollarSign,
  Package,
  Bike,
  ChefHat,
  Inbox,
  XCircle,
  Plus,
  Trash2,
  Download,
  Share2,
  ExternalLink,
  Edit3,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  Check,
  CreditCard,
  Banknote,
  Send,
  SlidersHorizontal,
  RefreshCw,
  Eye,
  User,
  ListFilter
} from 'lucide-react';
import {
  OrderRecord,
  OrderStatus,
  PaymentStatus,
  StoreSettings,
  GeladinhoProduct,
  PromoCombo,
  CustomerDetails,
  CartItem
} from '../types';
import {
  formatCurrency,
  formatPhoneDisplay,
  cleanPhone,
  buildWhatsAppUrl,
  generateCustomerStatusMessage,
  ORDER_STATUS_LABELS,
  generateShortOrderId
} from '../utils/whatsapp';

interface OrderManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  orders: OrderRecord[];
  storeSettings: StoreSettings;
  products: GeladinhoProduct[];
  combos: PromoCombo[];
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  onUpdatePaymentStatus: (orderId: string, newPaymentStatus: PaymentStatus) => void;
  onUpdateOrderDetails: (orderId: string, updates: Partial<OrderRecord>) => void;
  onDeleteOrder: (orderId: string) => void;
  onCreateManualOrder: (newOrder: OrderRecord) => void;
  onPrintReceipt: (order: OrderRecord) => void;
}

export const OrderManagerModal: React.FC<OrderManagerModalProps> = ({
  isOpen,
  onClose,
  orders,
  storeSettings,
  products,
  combos,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onUpdateOrderDetails,
  onDeleteOrder,
  onCreateManualOrder,
  onPrintReceipt,
}) => {
  // Navigation & View state
  const [activeTab, setActiveTab] = useState<'todos' | OrderStatus>('todos');
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState<'todos' | 'hoje' | 'ontem' | '7dias'>('todos');
  const [deliveryFilter, setDeliveryFilter] = useState<'todos' | 'delivery' | 'retirada'>('todos');
  const [paymentFilter, setPaymentFilter] = useState<'todos' | 'pendente' | 'pago'>('todos');

  // Modal sub-states
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<OrderRecord | null>(null);
  const [whatsappNotifyModalOrder, setWhatsappNotifyModalOrder] = useState<OrderRecord | null>(null);
  const [whatsappCustomMessage, setWhatsappCustomMessage] = useState('');
  const [whatsappTargetStatus, setWhatsappTargetStatus] = useState<OrderStatus>('em_preparo');
  const [isCreatingManualOrder, setIsCreatingManualOrder] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<OrderRecord | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Manual Order Form state
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [manualCustomerPhone, setManualCustomerPhone] = useState('');
  const [manualDeliveryType, setManualDeliveryType] = useState<'delivery' | 'retirada'>('delivery');
  const [manualStreet, setManualStreet] = useState('');
  const [manualNumber, setManualNumber] = useState('');
  const [manualNeighborhood, setManualNeighborhood] = useState('');
  const [manualComplement, setManualComplement] = useState('');
  const [manualPaymentMethod, setManualPaymentMethod] = useState<'pix' | 'cartao_entrega' | 'dinheiro'>('pix');
  const [manualChangeFor, setManualChangeFor] = useState('');
  const [manualDeliveryFee, setManualDeliveryFee] = useState(storeSettings.standardDeliveryFee || 6.0);
  const [manualItems, setManualItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [manualNotes, setManualNotes] = useState('');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 2500);
  };

  // Sound chime notification helper
  const playChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.3);
    } catch {
      // Audio not supported or blocked
    }
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const total = orders.length;
    const active = orders.filter(
      (o) => (o.status || 'recebido') === 'recebido' || (o.status || 'recebido') === 'em_preparo' || (o.status || 'recebido') === 'saiu_entrega' || (o.status || 'recebido') === 'pronto_retirada'
    ).length;

    const completed = orders.filter((o) => o.status === 'concluido').length;
    const cancelled = orders.filter((o) => o.status === 'cancelado').length;

    const totalRevenue = orders
      .filter((o) => o.status !== 'cancelado')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    const todayDateStr = new Date().toISOString().slice(0, 10);
    const todayOrders = orders.filter((o) => (o.createdAt || '').slice(0, 10) === todayDateStr && o.status !== 'cancelado');
    const todayRevenue = todayOrders.reduce((sum, o) => sum + (o.total || 0), 0);

    const avgTicket = total > 0 && (total - cancelled) > 0 ? totalRevenue / (total - cancelled) : 0;

    const countByStatus: Record<OrderStatus, number> = {
      recebido: 0,
      em_preparo: 0,
      saiu_entrega: 0,
      pronto_retirada: 0,
      concluido: 0,
      cancelado: 0,
    };

    orders.forEach((o) => {
      const s = o.status || 'recebido';
      if (countByStatus[s] !== undefined) {
        countByStatus[s]++;
      }
    });

    return {
      total,
      active,
      completed,
      cancelled,
      totalRevenue,
      todayRevenue,
      todayCount: todayOrders.length,
      avgTicket,
      countByStatus,
    };
  }, [orders]);

  // Filtered orders list
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Tab status filter
      if (activeTab !== 'todos') {
        const orderStatus = order.status || 'recebido';
        if (orderStatus !== activeTab) return false;
      }

      // Search query (name, phone, order ID, street, neighborhood)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const idMatch = (order.orderId || '').toLowerCase().includes(q);
        const nameMatch = (order.customer?.name || '').toLowerCase().includes(q);
        const phoneMatch = (order.customer?.phone || '').includes(q.replace(/\D/g, ''));
        const streetMatch = (order.customer?.street || '').toLowerCase().includes(q);
        const neighMatch = (order.customer?.neighborhood || '').toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !phoneMatch && !streetMatch && !neighMatch) {
          return false;
        }
      }

      // Date filter
      if (dateFilter !== 'todos' && order.createdAt) {
        const orderDate = new Date(order.createdAt);
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfYesterday = new Date(startOfToday.getTime() - 24 * 60 * 60 * 1000);
        const sevenDaysAgo = new Date(startOfToday.getTime() - 7 * 24 * 60 * 60 * 1000);

        if (dateFilter === 'hoje' && orderDate < startOfToday) return false;
        if (dateFilter === 'ontem' && (orderDate < startOfYesterday || orderDate >= startOfToday)) return false;
        if (dateFilter === '7dias' && orderDate < sevenDaysAgo) return false;
      }

      // Delivery filter
      if (deliveryFilter !== 'todos') {
        if (order.customer?.deliveryType !== deliveryFilter) return false;
      }

      // Payment filter
      if (paymentFilter !== 'todos') {
        const pStatus = order.paymentStatus || 'pendente';
        if (pStatus !== paymentFilter) return false;
      }

      return true;
    });
  }, [orders, activeTab, searchQuery, dateFilter, deliveryFilter, paymentFilter]);

  if (!isOpen) return null;

  // Next status progression helper
  const getNextStatus = (currentStatus: OrderStatus = 'recebido', deliveryType: 'delivery' | 'retirada' = 'delivery'): OrderStatus => {
    switch (currentStatus) {
      case 'recebido':
        return 'em_preparo';
      case 'em_preparo':
        return deliveryType === 'retirada' ? 'pronto_retirada' : 'saiu_entrega';
      case 'saiu_entrega':
      case 'pronto_retirada':
        return 'concluido';
      default:
        return 'concluido';
    }
  };

  const getNextStatusLabel = (currentStatus: OrderStatus = 'recebido', deliveryType: 'delivery' | 'retirada' = 'delivery'): string => {
    switch (currentStatus) {
      case 'recebido':
        return 'Iniciar Preparo 🍳';
      case 'em_preparo':
        return deliveryType === 'retirada' ? 'Pronto no Balcão 🛍️' : 'Despachar Entrega 🛵';
      case 'saiu_entrega':
      case 'pronto_retirada':
        return 'Concluir Pedido ✅';
      default:
        return 'Concluir';
    }
  };

  // Handle opening WhatsApp notification dialog
  const handleOpenWhatsAppNotify = (order: OrderRecord, targetStatus?: OrderStatus) => {
    const st = targetStatus || order.status || 'recebido';
    setWhatsappNotifyModalOrder(order);
    setWhatsappTargetStatus(st);
    setWhatsappCustomMessage(generateCustomerStatusMessage(order, st));
  };

  const handleSendWhatsAppNotification = () => {
    if (!whatsappNotifyModalOrder) return;
    const phone = cleanPhone(whatsappNotifyModalOrder.customer.phone);
    if (!phone) {
      alert('Número de WhatsApp do cliente não informado.');
      return;
    }
    const url = buildWhatsAppUrl(phone, whatsappCustomMessage);
    window.open(url, '_blank');
    showToast(`WhatsApp aberto para ${whatsappNotifyModalOrder.customer.name}!`);
    setWhatsappNotifyModalOrder(null);
  };

  // Export orders to CSV
  const handleExportCSV = () => {
    if (orders.length === 0) {
      alert('Nenhum pedido cadastrado para exportar.');
      return;
    }

    const headers = [
      'Pedido',
      'Data/Hora',
      'Status',
      'Pagamento',
      'Forma Pagto',
      'Tipo Entrega',
      'Cliente',
      'Telefone',
      'Endereço',
      'Bairro',
      'Subtotal',
      'Taxa Entrega',
      'Total',
      'Qtd Itens',
      'Entregador',
    ];

    const rows = orders.map((o) => {
      const dateStr = o.createdAt ? new Date(o.createdAt).toLocaleString('pt-BR') : '';
      const totalItemsCount =
        (o.items || []).reduce((acc, i) => acc + i.quantity, 0) +
        (o.combos || []).reduce((acc, c) => acc + c.quantity, 0);

      const addressStr = o.customer.deliveryType === 'delivery'
        ? `${o.customer.street}, ${o.customer.number} ${o.customer.complement || ''}`
        : 'Retirada no Balcão';

      return [
        `"#${o.orderId}"`,
        `"${dateStr}"`,
        `"${ORDER_STATUS_LABELS[o.status || 'recebido']?.label || o.status}"`,
        `"${o.paymentStatus === 'pago' ? 'Pago' : 'Pendente'}"`,
        `"${o.customer.paymentMethod}"`,
        `"${o.customer.deliveryType}"`,
        `"${o.customer.name.replace(/"/g, '""')}"`,
        `"${o.customer.phone}"`,
        `"${addressStr.replace(/"/g, '""')}"`,
        `"${(o.customer.neighborhood || '').replace(/"/g, '""')}"`,
        (o.subtotal || 0).toFixed(2),
        (o.deliveryFee || 0).toFixed(2),
        (o.total || 0).toFixed(2),
        totalItemsCount,
        `"${(o.courierName || '').replace(/"/g, '""')}"`,
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `pedidos_geladinhos_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Relatório CSV baixado com sucesso!');
  };

  // Manual order submission
  const handleSaveManualOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCustomerName.trim()) {
      alert('Por favor informe o nome do cliente.');
      return;
    }
    if (manualItems.length === 0) {
      alert('Adicione pelo menos 1 produto ao pedido.');
      return;
    }

    const compiledItems: CartItem[] = manualItems
      .map((mi) => {
        const prod = products.find((p) => p.id === mi.productId);
        if (!prod || mi.quantity <= 0) return null;
        return {
          product: prod,
          quantity: mi.quantity,
        };
      })
      .filter(Boolean) as CartItem[];

    const subtotal = compiledItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const fee = manualDeliveryType === 'delivery' ? manualDeliveryFee : 0;
    const total = subtotal + fee;
    const orderId = generateShortOrderId();

    const customerDetails: CustomerDetails = {
      name: manualCustomerName.trim(),
      phone: manualCustomerPhone.trim() || '11999999999',
      deliveryType: manualDeliveryType,
      street: manualStreet.trim(),
      number: manualNumber.trim(),
      neighborhood: manualNeighborhood.trim() || 'Centro',
      complement: manualComplement.trim(),
      city: storeSettings.city,
      paymentMethod: manualPaymentMethod,
      changeFor: manualPaymentMethod === 'dinheiro' && manualChangeFor.trim() ? manualChangeFor : undefined,
      deliveryOption: 'agora',
      notes: manualNotes.trim() ? manualNotes.trim() : undefined,
    };

    const newOrderRecord: OrderRecord = {
      id: `ord-manual-${Date.now()}`,
      orderId,
      createdAt: new Date().toISOString(),
      subtotal,
      deliveryFee: fee,
      discount: 0,
      total,
      customer: customerDetails,
      items: compiledItems,
      combos: [],
      storeSettings,
      status: 'recebido',
      paymentStatus: 'pendente',
      timeline: [
        {
          status: 'recebido',
          timestamp: new Date().toISOString(),
          note: 'Pedido manual cadastrado no painel',
        },
      ],
    };

    onCreateManualOrder(newOrderRecord);
    playChime();
    showToast(`Pedido #${orderId} criado com sucesso!`);
    setIsCreatingManualOrder(false);

    // Reset manual form
    setManualCustomerName('');
    setManualCustomerPhone('');
    setManualStreet('');
    setManualNumber('');
    setManualNeighborhood('');
    setManualComplement('');
    setManualItems([]);
    setManualNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-6xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[94vh] flex flex-col border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Alert */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Top Header */}
        <div className="p-4 sm:p-5 bg-white text-stone-900 flex items-center justify-between border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-xl sm:text-2xl text-stone-900 tracking-tight">
                  Gerenciamento de Pedidos
                </h2>
                {metrics.active > 0 && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500 text-white animate-pulse">
                    {metrics.active} {metrics.active === 1 ? 'Ativo' : 'Ativos'}
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 font-normal">
                Acompanhe o fluxo de preparo, entregas via WhatsApp e comprovantes térmicos.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* New Manual Order Button */}
            <button
              onClick={() => setIsCreatingManualOrder(true)}
              className="px-3 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Cadastrar pedido manual recebido por telefone ou balcão"
              id="btn-new-manual-order"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Novo Pedido Balcão</span>
              <span className="sm:hidden">Novo</span>
            </button>

            {/* Export CSV Button */}
            <button
              onClick={handleExportCSV}
              className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80 rounded-xl transition-all cursor-pointer"
              title="Exportar pedidos para Excel/CSV"
              aria-label="Exportar CSV"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              aria-label="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="bg-stone-50/90 px-4 sm:px-6 py-3 border-b border-stone-200/70 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 shrink-0">
          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Em Andamento
              </span>
              <span className="text-base sm:text-lg font-black text-stone-900 leading-none">
                {metrics.active} <span className="text-xs text-stone-400 font-normal">pedidos</span>
              </span>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Faturamento Hoje
              </span>
              <span className="text-base sm:text-lg font-black text-stone-900 leading-none">
                {formatCurrency(metrics.todayRevenue)}
              </span>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Ticket Médio
              </span>
              <span className="text-base sm:text-lg font-black text-stone-900 leading-none">
                {formatCurrency(metrics.avgTicket)}
              </span>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-3 rounded-2xl border border-stone-200/80 shadow-xs flex items-center gap-3">
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Package className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-stone-400 block tracking-wider">
                Total Geral
              </span>
              <span className="text-base sm:text-lg font-black text-stone-900 leading-none">
                {metrics.total} <span className="text-xs text-stone-400 font-normal">pedidos</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filters & Status Tabs */}
        <div className="bg-white px-4 sm:px-6 py-3 border-b border-stone-200/70 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
          {/* Status Tabs with badges */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            <button
              onClick={() => setActiveTab('todos')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'todos'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <span>Todos</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'todos' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                {metrics.total}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('recebido')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recebido'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>Recebidos</span>
              {metrics.countByStatus.recebido > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 text-white font-black">
                  {metrics.countByStatus.recebido}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('em_preparo')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'em_preparo'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-blue-700 hover:bg-blue-50'
              }`}
            >
              <ChefHat className="w-3.5 h-3.5" />
              <span>Em Preparo</span>
              {metrics.countByStatus.em_preparo > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 text-white font-black">
                  {metrics.countByStatus.em_preparo}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('saiu_entrega')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'saiu_entrega'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-purple-700 hover:bg-purple-50'
              }`}
            >
              <Bike className="w-3.5 h-3.5" />
              <span>A Caminho</span>
              {metrics.countByStatus.saiu_entrega > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 text-white font-black">
                  {metrics.countByStatus.saiu_entrega}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('pronto_retirada')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pronto_retirada'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-indigo-700 hover:bg-indigo-50'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>No Balcão</span>
              {metrics.countByStatus.pronto_retirada > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-white/30 text-white font-black">
                  {metrics.countByStatus.pronto_retirada}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('concluido')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'concluido'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 hover:bg-emerald-50'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Concluídos</span>
            </button>

            <button
              onClick={() => setActiveTab('cancelado')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cancelado'
                  ? 'bg-rose-500 text-white shadow-xs'
                  : 'text-rose-600 hover:bg-rose-50'
              }`}
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Cancelados</span>
            </button>
          </div>

          {/* Search, Filter selects & View toggles */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-48">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                placeholder="Buscar pedido ou cliente..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="bg-stone-50 border border-stone-200 text-stone-700 text-xs font-medium rounded-xl px-2.5 py-1.5 focus:outline-none"
            >
              <option value="todos">Todas Datas</option>
              <option value="hoje">Hoje</option>
              <option value="ontem">Ontem</option>
              <option value="7dias">Últimos 7 dias</option>
            </select>

            {/* View Mode toggle */}
            <div className="flex items-center bg-stone-100 p-0.5 rounded-xl border border-stone-200">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  viewMode === 'list' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Visualização em Lista Detalhada"
              >
                <ListFilter className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode('kanban')}
                className={`p-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  viewMode === 'kanban' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-500 hover:text-stone-900'
                }`}
                title="Visualização em Quadro Kanban"
              >
                <Layers className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Main Orders Display Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-stone-100/50">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-300 my-8">
              <div className="w-16 h-16 rounded-3xl bg-stone-50 border border-stone-200 flex items-center justify-center mx-auto mb-4 text-stone-400">
                <Inbox className="w-8 h-8" />
              </div>
              <h3 className="font-extrabold text-stone-800 text-base mb-1">
                Nenhum pedido encontrado
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mb-5">
                Não há pedidos cadastrados com os filtros atuais selecionados.
              </p>
              <button
                onClick={() => setIsCreatingManualOrder(true)}
                className="px-4 py-2 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Criar Novo Pedido Manual</span>
              </button>
            </div>
          ) : viewMode === 'kanban' ? (
            /* ============================================================ */
            /* KANBAN BOARD VIEW                                            */
            /* ============================================================ */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
              {/* Column: Recebido */}
              <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span className="font-extrabold text-xs text-stone-800 uppercase tracking-wider">
                      Recebidos ({filteredOrders.filter((o) => (o.status || 'recebido') === 'recebido').length})
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredOrders
                    .filter((o) => (o.status || 'recebido') === 'recebido')
                    .map((order) => (
                      <KanbanOrderCard
                        key={order.id || order.orderId}
                        order={order}
                        onUpdateOrderStatus={onUpdateOrderStatus}
                        onUpdatePaymentStatus={onUpdatePaymentStatus}
                        onPrintReceipt={onPrintReceipt}
                        onOpenWhatsAppNotify={handleOpenWhatsAppNotify}
                        onSelectDetails={setSelectedOrderForDetails}
                        onDeleteOrder={onDeleteOrder}
                        getNextStatus={getNextStatus}
                        getNextStatusLabel={getNextStatusLabel}
                      />
                    ))}
                </div>
              </div>

              {/* Column: Em Preparo */}
              <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="font-extrabold text-xs text-stone-800 uppercase tracking-wider">
                      Em Preparo ({filteredOrders.filter((o) => o.status === 'em_preparo').length})
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredOrders
                    .filter((o) => o.status === 'em_preparo')
                    .map((order) => (
                      <KanbanOrderCard
                        key={order.id || order.orderId}
                        order={order}
                        onUpdateOrderStatus={onUpdateOrderStatus}
                        onUpdatePaymentStatus={onUpdatePaymentStatus}
                        onPrintReceipt={onPrintReceipt}
                        onOpenWhatsAppNotify={handleOpenWhatsAppNotify}
                        onSelectDetails={setSelectedOrderForDetails}
                        onDeleteOrder={onDeleteOrder}
                        getNextStatus={getNextStatus}
                        getNextStatusLabel={getNextStatusLabel}
                      />
                    ))}
                </div>
              </div>

              {/* Column: Saiu p/ Entrega / Pronto Balcão */}
              <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                    <span className="font-extrabold text-xs text-stone-800 uppercase tracking-wider">
                      A Caminho / Balcão ({filteredOrders.filter((o) => o.status === 'saiu_entrega' || o.status === 'pronto_retirada').length})
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredOrders
                    .filter((o) => o.status === 'saiu_entrega' || o.status === 'pronto_retirada')
                    .map((order) => (
                      <KanbanOrderCard
                        key={order.id || order.orderId}
                        order={order}
                        onUpdateOrderStatus={onUpdateOrderStatus}
                        onUpdatePaymentStatus={onUpdatePaymentStatus}
                        onPrintReceipt={onPrintReceipt}
                        onOpenWhatsAppNotify={handleOpenWhatsAppNotify}
                        onSelectDetails={setSelectedOrderForDetails}
                        onDeleteOrder={onDeleteOrder}
                        getNextStatus={getNextStatus}
                        getNextStatusLabel={getNextStatusLabel}
                      />
                    ))}
                </div>
              </div>

              {/* Column: Concluídos */}
              <div className="bg-stone-50/80 rounded-2xl border border-stone-200 p-3 flex flex-col gap-3">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="font-extrabold text-xs text-stone-800 uppercase tracking-wider">
                      Concluídos ({filteredOrders.filter((o) => o.status === 'concluido').length})
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredOrders
                    .filter((o) => o.status === 'concluido')
                    .map((order) => (
                      <KanbanOrderCard
                        key={order.id || order.orderId}
                        order={order}
                        onUpdateOrderStatus={onUpdateOrderStatus}
                        onUpdatePaymentStatus={onUpdatePaymentStatus}
                        onPrintReceipt={onPrintReceipt}
                        onOpenWhatsAppNotify={handleOpenWhatsAppNotify}
                        onSelectDetails={setSelectedOrderForDetails}
                        onDeleteOrder={onDeleteOrder}
                        getNextStatus={getNextStatus}
                        getNextStatusLabel={getNextStatusLabel}
                      />
                    ))}
                </div>
              </div>
            </div>
          ) : (
            /* ============================================================ */
            /* DETAILED LIST VIEW                                           */
            /* ============================================================ */
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const currentStatus = order.status || 'recebido';
                const statusMeta = ORDER_STATUS_LABELS[currentStatus] || ORDER_STATUS_LABELS.recebido;
                const isPaid = order.paymentStatus === 'pago';
                const totalItemsCount =
                  (order.items || []).reduce((acc, i) => acc + i.quantity, 0) +
                  (order.combos || []).reduce((acc, c) => acc + c.quantity, 0);

                const nextStatus = getNextStatus(currentStatus, order.customer.deliveryType);
                const nextLabel = getNextStatusLabel(currentStatus, order.customer.deliveryType);
                const dateDisplay = order.createdAt
                  ? new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  : '';

                return (
                  <div
                    key={order.id || order.orderId}
                    className="bg-white rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all p-4 sm:p-5 flex flex-col gap-4"
                  >
                    {/* Card Top Row: Order ID, Status, Customer, Time */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-100">
                      <div className="flex items-center gap-2.5">
                        <span className="font-mono font-black text-sm sm:text-base text-stone-900 bg-stone-100 px-2.5 py-1 rounded-xl">
                          #{order.orderId}
                        </span>

                        <span className={`px-2.5 py-1 rounded-xl text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${statusMeta.badgeClass}`}>
                          <span>{statusMeta.label}</span>
                        </span>

                        <button
                          type="button"
                          onClick={() => {
                            const newPStatus = isPaid ? 'pendente' : 'pago';
                            onUpdatePaymentStatus(order.orderId, newPStatus);
                            showToast(`Status de pagamento: ${newPStatus === 'pago' ? 'PAGO' : 'PENDENTE'}`);
                          }}
                          className={`px-2.5 py-1 rounded-xl text-xs font-bold cursor-pointer transition-all border ${
                            isPaid
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                          }`}
                          title="Clique para alternar entre Pendente e Pago"
                        >
                          {isPaid ? '✓ Pago' : '⏳ Pagamento Pendente'}
                        </button>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-stone-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{dateDisplay}</span>
                        </div>

                        <span className="font-extrabold text-stone-900 text-sm sm:text-base">
                          {formatCurrency(order.total)}
                        </span>
                      </div>
                    </div>

                    {/* Middle: Customer Details & Items Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                      {/* Customer info column */}
                      <div className="md:col-span-5 space-y-1.5 text-xs text-stone-700">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-stone-900 text-sm">{order.customer.name}</span>
                          <a
                            href={`https://wa.me/${cleanPhone(order.customer.phone)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-emerald-600 hover:text-emerald-700 font-semibold inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100"
                            title="Abrir WhatsApp com cliente"
                          >
                            <Phone className="w-3 h-3" />
                            <span>{formatPhoneDisplay(order.customer.phone)}</span>
                          </a>
                        </div>

                        {order.customer.deliveryType === 'delivery' ? (
                          <div className="flex items-start gap-1.5 text-stone-600">
                            <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                            <span>
                              {order.customer.street}, nº {order.customer.number}
                              {order.customer.complement ? ` (${order.customer.complement})` : ''} -{' '}
                              <strong>{order.customer.neighborhood}</strong>
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-indigo-700 font-medium bg-indigo-50 px-2.5 py-1 rounded-xl w-fit">
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Retirada no Balcão da Loja</span>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-[11px] text-stone-500 pt-1">
                          <span className="font-semibold text-stone-700">Pagamento:</span>
                          <span className="capitalize font-medium">
                            {order.customer.paymentMethod === 'pix'
                              ? 'PIX'
                              : order.customer.paymentMethod === 'cartao_entrega'
                              ? 'Cartão na Entrega'
                              : `Dinheiro ${order.customer.changeFor ? `(Troco p/ ${order.customer.changeFor})` : ''}`}
                          </span>
                        </div>

                        {order.customer.notes && (
                          <div className="text-[11px] bg-amber-50/80 text-amber-900 border border-amber-200/70 p-2 rounded-xl">
                            <strong>Obs. do Cliente:</strong> {order.customer.notes}
                          </div>
                        )}

                        {/* Entregador field */}
                        <div className="flex items-center gap-2 pt-1">
                          <Bike className="w-3.5 h-3.5 text-stone-400" />
                          <input
                            type="text"
                            placeholder="Nome do entregador / motoboy..."
                            defaultValue={order.courierName || ''}
                            onBlur={(e) => {
                              onUpdateOrderDetails(order.orderId, { courierName: e.target.value });
                              if (e.target.value !== order.courierName) {
                                showToast('Entregador atualizado!');
                              }
                            }}
                            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1 text-stone-800 placeholder:text-stone-400 focus:bg-white focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Items & combos list column */}
                      <div className="md:col-span-7 bg-stone-50/70 p-3 rounded-2xl border border-stone-200/60 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                          <span>Itens do Pedido ({totalItemsCount})</span>
                          <span>Subtotal: {formatCurrency(order.subtotal)}</span>
                        </div>

                        <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                          {order.items?.map((item, idx) => (
                            <div
                              key={`item-${idx}`}
                              className="flex items-center justify-between text-xs py-1 border-b border-stone-100 last:border-0"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-stone-900 bg-white px-1.5 py-0.5 rounded-md border border-stone-200 text-[11px]">
                                  {item.quantity}x
                                </span>
                                <span className="font-medium text-stone-800">{item.product.name}</span>
                                {item.customNotes && (
                                  <span className="text-[10px] text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
                                    {item.customNotes}
                                  </span>
                                )}
                              </div>
                              <span className="text-stone-600 font-semibold">
                                {formatCurrency(item.product.price * item.quantity)}
                              </span>
                            </div>
                          ))}

                          {order.combos?.map((cItem, cIdx) => (
                            <div
                              key={`combo-${cIdx}`}
                              className="bg-white p-2 rounded-xl border border-rose-100 text-xs space-y-1"
                            >
                              <div className="flex items-center justify-between font-bold text-rose-900">
                                <span>
                                  🎁 {cItem.quantity}x {cItem.combo.title}
                                </span>
                                <span>{formatCurrency(cItem.combo.price * cItem.quantity)}</span>
                              </div>
                              {cItem.selectedFlavors && (
                                <div className="text-[10px] text-stone-500 flex flex-wrap gap-1">
                                  {cItem.selectedFlavors.map((sf, sfIdx) => (
                                    <span key={sfIdx} className="bg-stone-100 px-1.5 py-0.5 rounded">
                                      {sf.quantity}x {sf.product.name}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Bottom Actions Row: Progression buttons, WhatsApp updates, Print */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-stone-100">
                      {/* Status changer select */}
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-stone-500">Mudar Status:</span>
                        <select
                          value={currentStatus}
                          onChange={(e) => {
                            const newSt = e.target.value as OrderStatus;
                            onUpdateOrderStatus(order.orderId, newSt);
                            showToast(`Status atualizado para: ${ORDER_STATUS_LABELS[newSt]?.label}`);
                          }}
                          className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-1.5 font-bold text-stone-800 focus:outline-none"
                        >
                          <option value="recebido">Recebido / Novo</option>
                          <option value="em_preparo">Em Preparo</option>
                          <option value="saiu_entrega">Saiu p/ Entrega</option>
                          <option value="pronto_retirada">Pronto no Balcão</option>
                          <option value="concluido">Concluído</option>
                          <option value="cancelado">Cancelado</option>
                        </select>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Notify Customer on WhatsApp */}
                        <button
                          type="button"
                          onClick={() => handleOpenWhatsAppNotify(order, currentStatus)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/80 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                          title="Enviar aviso de status diretamente no WhatsApp do cliente"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Avisar Cliente</span>
                        </button>

                        {/* Print Receipt */}
                        <button
                          type="button"
                          onClick={() => onPrintReceipt(order)}
                          className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs"
                          title="Imprimir comprovante térmico para cozinha ou motoboy"
                        >
                          <Printer className="w-3.5 h-3.5 text-stone-600" />
                          <span>Imprimir Cupom</span>
                        </button>

                        {/* Advance to next status primary button */}
                        {currentStatus !== 'concluido' && currentStatus !== 'cancelado' && (
                          <button
                            type="button"
                            onClick={() => {
                              onUpdateOrderStatus(order.orderId, nextStatus);
                              showToast(`Pedido #${order.orderId} avançado para ${ORDER_STATUS_LABELS[nextStatus]?.label}`);
                              // Optionally ask to notify customer
                              handleOpenWhatsAppNotify(order, nextStatus);
                            }}
                            className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-xs active:scale-95"
                          >
                            <span>{nextLabel}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete order */}
                        <button
                          type="button"
                          onClick={() => {
                            setOrderToDelete(order);
                          }}
                          className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Excluir pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ============================================================ */}
        {/* SUB-MODAL: WHATSAPP CUSTOMER NOTIFICATION DIALOG            */}
        {/* ============================================================ */}
        {whatsappNotifyModalOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in">
            <div
              className="w-full max-w-lg bg-white rounded-3xl shadow-2xl p-5 sm:p-6 border border-stone-200 space-y-4 animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                    <MessageCircle className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-base">
                      Notificar Cliente via WhatsApp
                    </h3>
                    <p className="text-xs text-stone-500">
                      Pedido #{whatsappNotifyModalOrder.orderId} • {whatsappNotifyModalOrder.customer.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setWhatsappNotifyModalOrder(null)}
                  className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status preset buttons */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-700 block">
                  Escolha o Modelo de Mensagem:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappTargetStatus('em_preparo');
                      setWhatsappCustomMessage(generateCustomerStatusMessage(whatsappNotifyModalOrder, 'em_preparo'));
                    }}
                    className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                      whatsappTargetStatus === 'em_preparo'
                        ? 'bg-blue-50 text-blue-800 border-blue-300 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    🍳 Em Preparo
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappTargetStatus('saiu_entrega');
                      setWhatsappCustomMessage(generateCustomerStatusMessage(whatsappNotifyModalOrder, 'saiu_entrega'));
                    }}
                    className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                      whatsappTargetStatus === 'saiu_entrega'
                        ? 'bg-purple-50 text-purple-800 border-purple-300 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    🛵 Saiu p/ Entrega
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappTargetStatus('pronto_retirada');
                      setWhatsappCustomMessage(generateCustomerStatusMessage(whatsappNotifyModalOrder, 'pronto_retirada'));
                    }}
                    className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                      whatsappTargetStatus === 'pronto_retirada'
                        ? 'bg-indigo-50 text-indigo-800 border-indigo-300 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    🛍️ Pronto Balcão
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappTargetStatus('concluido');
                      setWhatsappCustomMessage(generateCustomerStatusMessage(whatsappNotifyModalOrder, 'concluido'));
                    }}
                    className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                      whatsappTargetStatus === 'concluido'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    ⭐ Concluído & Agradecimento
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappTargetStatus('recebido');
                      setWhatsappCustomMessage(generateCustomerStatusMessage(whatsappNotifyModalOrder, 'recebido'));
                    }}
                    className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                      whatsappTargetStatus === 'recebido'
                        ? 'bg-amber-50 text-amber-800 border-amber-300 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    📥 Recebido
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setWhatsappTargetStatus('cancelado');
                      setWhatsappCustomMessage(generateCustomerStatusMessage(whatsappNotifyModalOrder, 'cancelado'));
                    }}
                    className={`p-2 rounded-xl text-xs font-bold text-left border transition-all ${
                      whatsappTargetStatus === 'cancelado'
                        ? 'bg-rose-50 text-rose-800 border-rose-300 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    ❌ Cancelado
                  </button>
                </div>
              </div>

              {/* Message text area */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-stone-700 block">
                  Mensagem Formatada:
                </label>
                <textarea
                  rows={6}
                  value={whatsappCustomMessage}
                  onChange={(e) => setWhatsappCustomMessage(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-2xl p-3 text-xs text-stone-900 font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Modal footer buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setWhatsappNotifyModalOrder(null)}
                  className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSendWhatsAppNotification}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-2 shadow-md shadow-emerald-600/20 cursor-pointer active:scale-95 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Enviar no WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL: NOVO PEDIDO MANUAL (BALCÃO / TELEFONE)            */}
        {/* ============================================================ */}
        {isCreatingManualOrder && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in">
            <div
              className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-5 sm:p-6 border border-stone-200 max-h-[90vh] overflow-y-auto space-y-5 animate-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                    <Plus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-stone-900 text-lg">
                      Novo Pedido Manual
                    </h3>
                    <p className="text-xs text-stone-500">
                      Cadastre pedidos recebidos por telefone, WhatsApp ou balcão
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCreatingManualOrder(false)}
                  className="text-stone-400 hover:text-stone-700 p-1.5 rounded-xl hover:bg-stone-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveManualOrder} className="space-y-4">
                {/* Customer name & phone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      Nome do Cliente *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Carlos Silva"
                      value={manualCustomerName}
                      onChange={(e) => setManualCustomerName(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">
                      WhatsApp do Cliente
                    </label>
                    <input
                      type="tel"
                      placeholder="Ex: 11988887777"
                      value={manualCustomerPhone}
                      onChange={(e) => setManualCustomerPhone(e.target.value)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-none"
                    />
                  </div>
                </div>

                {/* Delivery Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-700 block">Tipo de Pedido:</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setManualDeliveryType('delivery')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        manualDeliveryType === 'delivery'
                          ? 'bg-rose-50 text-rose-900 border-rose-300 shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      <Bike className="w-4 h-4 text-rose-500" />
                      <span>Entrega Delivery</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setManualDeliveryType('retirada')}
                      className={`p-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-2 ${
                        manualDeliveryType === 'retirada'
                          ? 'bg-rose-50 text-rose-900 border-rose-300 shadow-xs'
                          : 'bg-stone-50 text-stone-600 border-stone-200'
                      }`}
                    >
                      <ShoppingBag className="w-4 h-4 text-rose-500" />
                      <span>Retirada no Balcão</span>
                    </button>
                  </div>
                </div>

                {/* Address fields if delivery */}
                {manualDeliveryType === 'delivery' && (
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">Rua / Av:</label>
                        <input
                          type="text"
                          placeholder="Ex: Rua das Flores"
                          value={manualStreet}
                          onChange={(e) => setManualStreet(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">Número:</label>
                        <input
                          type="text"
                          placeholder="123"
                          value={manualNumber}
                          onChange={(e) => setManualNumber(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">Bairro:</label>
                        <input
                          type="text"
                          placeholder="Ex: Centro"
                          value={manualNeighborhood}
                          onChange={(e) => setManualNeighborhood(e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-stone-700 block mb-1">Taxa Entrega (R$):</label>
                        <input
                          type="number"
                          step="0.5"
                          value={manualDeliveryFee}
                          onChange={(e) => setManualDeliveryFee(parseFloat(e.target.value) || 0)}
                          className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs text-stone-900 font-bold focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Items selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-stone-700">Sabores Selecionados:</label>
                    <span className="text-[11px] text-stone-500">Adicione os sabores e quantidades</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-stone-200 rounded-2xl bg-stone-50">
                    {products.map((prod) => {
                      const itemEntry = manualItems.find((mi) => mi.productId === prod.id);
                      const qty = itemEntry ? itemEntry.quantity : 0;

                      return (
                        <div
                          key={prod.id}
                          className="bg-white p-2 rounded-xl border border-stone-200/80 flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="font-bold text-xs text-stone-900 block truncate">{prod.name}</span>
                            <span className="text-[10px] text-stone-500">{formatCurrency(prod.price)}</span>
                          </div>

                          <div className="flex items-center bg-stone-100 rounded-lg p-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setManualItems((prev) => {
                                  const existing = prev.find((i) => i.productId === prod.id);
                                  if (!existing || existing.quantity <= 1) {
                                    return prev.filter((i) => i.productId !== prod.id);
                                  }
                                  return prev.map((i) => (i.productId === prod.id ? { ...i, quantity: i.quantity - 1 } : i));
                                });
                              }}
                              disabled={qty <= 0}
                              className="w-5 h-5 flex items-center justify-center font-bold text-stone-700 disabled:opacity-30 cursor-pointer"
                            >
                              -
                            </button>
                            <span className="text-xs font-extrabold px-2 text-stone-900">{qty}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setManualItems((prev) => {
                                  const existing = prev.find((i) => i.productId === prod.id);
                                  if (existing) {
                                    return prev.map((i) => (i.productId === prod.id ? { ...i, quantity: i.quantity + 1 } : i));
                                  }
                                  return [...prev, { productId: prod.id, quantity: 1 }];
                                });
                              }}
                              className="w-5 h-5 flex items-center justify-center font-bold text-rose-600 cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Payment Method */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-stone-700 block mb-1">Forma de Pagamento:</label>
                    <select
                      value={manualPaymentMethod}
                      onChange={(e) => setManualPaymentMethod(e.target.value as any)}
                      className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 font-medium focus:bg-white focus:outline-none"
                    >
                      <option value="pix">PIX</option>
                      <option value="cartao_entrega">Cartão (Débito/Crédito)</option>
                      <option value="dinheiro">Dinheiro</option>
                    </select>
                  </div>

                  {manualPaymentMethod === 'dinheiro' && (
                    <div>
                      <label className="text-xs font-bold text-stone-700 block mb-1">Troco para (R$):</label>
                      <input
                        type="text"
                        placeholder="Ex: R$ 50,00"
                        value={manualChangeFor}
                        onChange={(e) => setManualChangeFor(e.target.value)}
                        className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                {/* Internal notes */}
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">Observações Internas:</label>
                  <input
                    type="text"
                    placeholder="Ex: Pedido feito por ligação, cliente frequente"
                    value={manualNotes}
                    onChange={(e) => setManualNotes(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs text-stone-900 focus:bg-white focus:outline-none"
                  />
                </div>

                {/* Submit button */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => setIsCreatingManualOrder(false)}
                    className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-xl text-xs font-bold cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-extrabold shadow-md shadow-rose-500/20 active:scale-95 transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar e Cadastrar Pedido</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* SUB-MODAL: DELETE ORDER CONFIRMATION                         */}
        {/* ============================================================ */}
        {orderToDelete && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
            <div
              className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-stone-900 text-base">
                    Excluir Pedido #{orderToDelete.orderId}?
                  </h3>
                  <p className="text-xs text-stone-500 font-medium">
                    Cliente: {orderToDelete.customer.name}
                  </p>
                </div>
              </div>

              <p className="text-xs text-stone-600 leading-relaxed font-normal">
                Tem certeza que deseja remover este pedido permanentemente do painel de controle?
              </p>

              <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setOrderToDelete(null)}
                  className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const id = orderToDelete.orderId;
                    onDeleteOrder(id);
                    setOrderToDelete(null);
                    showToast(`Pedido #${id} removido com sucesso.`);
                  }}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Sim, Excluir Pedido</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ========================================================================= */
/* KANBAN ORDER CARD SUB-COMPONENT                                           */
/* ========================================================================= */
interface KanbanOrderCardProps {
  order: OrderRecord;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus, note?: string) => void;
  onUpdatePaymentStatus: (orderId: string, newPaymentStatus: PaymentStatus) => void;
  onPrintReceipt: (order: OrderRecord) => void;
  onOpenWhatsAppNotify: (order: OrderRecord, targetStatus?: OrderStatus) => void;
  onSelectDetails: (order: OrderRecord) => void;
  onDeleteOrder: (orderId: string) => void;
  getNextStatus: (currentStatus?: OrderStatus, deliveryType?: 'delivery' | 'retirada') => OrderStatus;
  getNextStatusLabel: (currentStatus?: OrderStatus, deliveryType?: 'delivery' | 'retirada') => string;
}

const KanbanOrderCard: React.FC<KanbanOrderCardProps> = ({
  order,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  onPrintReceipt,
  onOpenWhatsAppNotify,
  onSelectDetails,
  onDeleteOrder,
  getNextStatus,
  getNextStatusLabel,
}) => {
  const currentStatus = order.status || 'recebido';
  const isPaid = order.paymentStatus === 'pago';
  const totalItems =
    (order.items || []).reduce((acc, i) => acc + i.quantity, 0) +
    (order.combos || []).reduce((acc, c) => acc + c.quantity, 0);

  const nextStatus = getNextStatus(currentStatus, order.customer.deliveryType);
  const nextLabel = getNextStatusLabel(currentStatus, order.customer.deliveryType);

  const timeStr = order.createdAt
    ? new Date(order.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return (
    <div className="bg-white rounded-2xl border border-stone-200/90 shadow-xs hover:shadow-md transition-all p-3.5 flex flex-col gap-2.5">
      {/* Top row */}
      <div className="flex items-center justify-between">
        <span className="font-mono font-black text-xs text-stone-900 bg-stone-100 px-2 py-0.5 rounded-lg">
          #{order.orderId}
        </span>
        <span className="text-[11px] text-stone-400 font-medium">{timeStr}</span>
      </div>

      {/* Customer & address */}
      <div>
        <span className="font-bold text-xs text-stone-900 block truncate">{order.customer.name}</span>
        <span className="text-[11px] text-stone-500 block truncate">
          {order.customer.deliveryType === 'delivery'
            ? `${order.customer.neighborhood} (${order.customer.street})`
            : '🏬 Retirada no Balcão'}
        </span>
      </div>

      {/* Items preview */}
      <div className="bg-stone-50 p-2 rounded-xl text-[11px] text-stone-600 space-y-0.5">
        <div className="flex items-center justify-between font-bold text-stone-800">
          <span>{totalItems} itens</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        <div className="truncate text-stone-500">
          {order.items?.map((i) => `${i.quantity}x ${i.product.name}`).join(', ')}
        </div>
      </div>

      {/* Payment and quick actions */}
      <div className="flex items-center justify-between pt-1 border-t border-stone-100">
        <button
          type="button"
          onClick={() => onUpdatePaymentStatus(order.orderId, isPaid ? 'pendente' : 'pago')}
          className={`text-[10px] font-bold px-2 py-0.5 rounded-md border cursor-pointer ${
            isPaid
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}
        >
          {isPaid ? '✓ Pago' : '⏳ Pendente'}
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onOpenWhatsAppNotify(order, currentStatus)}
            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer transition-colors"
            title="Avisar no WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => onPrintReceipt(order)}
            className="p-1.5 text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer transition-colors"
            title="Imprimir Cupom"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Advance button */}
      {currentStatus !== 'concluido' && currentStatus !== 'cancelado' && (
        <button
          type="button"
          onClick={() => onUpdateOrderStatus(order.orderId, nextStatus)}
          className="w-full py-1.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 cursor-pointer transition-all active:scale-98"
        >
          <span>{nextLabel}</span>
          <ArrowRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
};
