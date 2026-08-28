import { CartItem, CartComboItem, CustomerDetails, StoreSettings, OrderRecord, OrderStatus, PaymentStatus } from '../types';

export function formatCurrency(value: number | undefined | null): string {
  const num = typeof value === 'number' && !isNaN(value) ? value : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(num);
}

export function cleanPhone(phone: string | undefined | null): string {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/\D/g, '');
}

export function formatPhoneDisplay(phone: string | undefined | null): string {
  const digits = cleanPhone(phone);
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone || '';
}

export interface OrderSummaryData {
  items: CartItem[];
  combos: CartComboItem[];
  customer: CustomerDetails;
  deliveryFee: number;
  subtotal: number;
  discount: number;
  total: number;
  storeSettings: StoreSettings;
  orderId: string;
}

export function generateWhatsAppMessage(data: OrderSummaryData): string {
  const { items, combos, customer, deliveryFee, subtotal, discount, total, storeSettings, orderId } = data;

  const now = new Date();
  const dateStr = now.toLocaleDateString('pt-BR');
  const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  let text = `🍨 *NOVO PEDIDO - ${storeSettings.storeName.toUpperCase()}*\n`;
  text += `🔖 *Pedido Nº:* #${orderId}\n`;
  text += `📅 *Data/Hora:* ${dateStr} às ${timeStr}\n`;
  text += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  text += `👤 *DADOS DO CLIENTE:*\n`;
  text += `• *Nome:* ${customer.name}\n`;
  text += `• *WhatsApp:* ${formatPhoneDisplay(customer.phone)}\n\n`;

  text += `🛍️ *ITENS DO PEDIDO:*\n`;

  // List individual items
  if (items && items.length > 0) {
    items.forEach((item) => {
      if (!item || !item.product) return;
      const price = typeof item.product.price === 'number' ? item.product.price : 0;
      const qty = typeof item.quantity === 'number' ? item.quantity : 1;
      const itemTotal = price * qty;
      text += `▫️ *${qty}x* ${item.product.name || 'Geladinho'} (${formatCurrency(price)} un) = *${formatCurrency(itemTotal)}*\n`;
      if (item.customNotes) {
        text += `   ↳ _Obs: ${item.customNotes}_\n`;
      }
    });
  }

  // List combos
  if (combos && combos.length > 0) {
    combos.forEach((comboItem) => {
      if (!comboItem || !comboItem.combo) return;
      const price = typeof comboItem.combo.price === 'number' ? comboItem.combo.price : 0;
      const qty = typeof comboItem.quantity === 'number' ? comboItem.quantity : 1;
      const comboTotal = price * qty;
      text += `🎁 *${qty}x COMBO: ${comboItem.combo.title || 'Kit'}* = *${formatCurrency(comboTotal)}*\n`;
      if (comboItem.selectedFlavors && comboItem.selectedFlavors.length > 0) {
        text += `   _Sabores do Kit:_\n`;
        comboItem.selectedFlavors.forEach(f => {
          if (f && f.product) {
            text += `   - ${f.quantity || 1}x ${f.product.name}\n`;
          }
        });
      }
      if (comboItem.combo.includesThermalBag) {
        text += `   📦 _Inclui Caixa Térmica de Isopor_\n`;
      }
    });
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `💰 *VALORES:*\n`;
  text += `• Subtotal: ${formatCurrency(subtotal)}\n`;
  if (discount > 0) {
    text += `• Desconto Especial: -${formatCurrency(discount)}\n`;
  }

  if (customer.deliveryType === 'delivery') {
    text += `• Taxa de Entrega: ${deliveryFee > 0 ? formatCurrency(deliveryFee) : 'GRÁTIS'}\n`;
  } else {
    text += `• Retirada no Balcão: R$ 0,00\n`;
  }

  text += `⭐ *TOTAL GERAL: ${formatCurrency(total)}*\n\n`;

  text += `━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `📍 *FORMA DE ENTREGA:*\n`;
  if (customer.deliveryType === 'delivery') {
    text += `🛵 *Tipo:* Entrega Delivery\n`;
    text += `🏠 *Endereço:* ${customer.street}, nº ${customer.number}\n`;
    text += `🏙️ *Bairro:* ${customer.neighborhood} - ${customer.city || storeSettings.city}\n`;
    if (customer.complement) text += `🏢 *Complemento:* ${customer.complement}\n`;
    if (customer.reference) text += `📌 *Ponto de Ref.:* ${customer.reference}\n`;
    if (customer.deliveryOption === 'agendado' && customer.scheduledDate && customer.scheduledTime) {
      text += `⏰ *Agendamento:* ${customer.scheduledDate} às ${customer.scheduledTime}\n`;
    } else {
      text += `⚡ *Horário:* Entregar assim que possível (congelado)\n`;
    }
  } else {
    text += `🏬 *Tipo:* Retirada no Balcão\n`;
    text += `📍 *Local de Retirada:* ${storeSettings.address} - ${storeSettings.city}\n`;
  }

  text += `\n💳 *FORMA DE PAGAMENTO:*\n`;
  if (customer.paymentMethod === 'pix') {
    text += `⚡ *PIX* (Chave ${storeSettings.pixKeyType}: ${storeSettings.pixKey})\n`;
    text += `_Envio o comprovante logo após a confirmação._\n`;
  } else if (customer.paymentMethod === 'cartao_entrega') {
    text += `💳 *Cartão (Débito/Crédito na Entrega)* - Levar maquininha\n`;
  } else if (customer.paymentMethod === 'dinheiro') {
    text += `💵 *Dinheiro*`;
    if (customer.changeFor && customer.changeFor.trim() !== '') {
      text += ` (Troco para ${customer.changeFor})`;
    } else {
      text += ` (Sem troco / Valor exato)`;
    }
    text += `\n`;
  }

  if (customer.notes && customer.notes.trim() !== '') {
    text += `\n📝 *OBSERVAÇÕES ADICIONAIS:*\n${customer.notes}\n`;
  }

  text += `\n━━━━━━━━━━━━━━━━━━━━━\n`;
  text += `❄️ *Aguardando confirmação do pedido pelo atendente!* 🙏🍦`;

  return text;
}

export function buildWhatsAppUrl(phoneNumber: string, message: string): string {
  const cleanNumber = cleanPhone(phoneNumber);
  const encoded = encodeURIComponent(message);
  return `https://api.whatsapp.com/send?phone=${cleanNumber}&text=${encoded}`;
}

export function generateShortOrderId(): string {
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${random}`;
}

export function generateCustomerStatusMessage(
  order: OrderRecord,
  status: OrderStatus,
  customNote?: string
): string {
  const storeName = order.storeSettings?.storeName || 'Geladinhos Gourmet';
  const customerName = order.customer.name;
  const orderId = order.orderId;

  if (customNote && customNote.trim()) {
    return `Olá, *${customerName}*! 👋\n\nSobre seu pedido *#${orderId}* na *${storeName}*:\n\n${customNote.trim()}\n\nQualquer dúvida, estamos à disposição! 🍧`;
  }

  switch (status) {
    case 'em_preparo':
      return `Olá, *${customerName}*! 🍧\n\nSeu pedido *#${orderId}* foi confirmado e já está *EM PREPARO* com muito carinho e cuidado! ❄️\n\nAssim que sair para entrega, avisaremos por aqui. Obrigado pela preferência na *${storeName}*! ✨`;

    case 'saiu_entrega':
      const courierInfo = order.courierName ? ` com nosso entregador *${order.courierName}*` : '';
      const addressInfo = order.customer.deliveryType === 'delivery'
        ? `\n📍 *Endereço:* ${order.customer.street}, nº ${order.customer.number} (${order.customer.neighborhood})`
        : '';
      return `Olá, *${customerName}*! 🛵💨\n\nBoas notícias: seu pedido *#${orderId}* acabou de *SAIR PARA ENTREGA*${courierInfo}!${addressInfo}\n\nPor favor, fique atento(a) para receber seus geladinhos bem congelados! 😋❄️`;

    case 'pronto_retirada':
      const storeAddress = order.storeSettings?.address || 'Nosso balcão';
      return `Olá, *${customerName}*! 🛍️✨\n\nSeu pedido *#${orderId}* já está *PRONTO PARA RETIRADA* no balcão da *${storeName}*!\n\n📍 *Endereço para retirada:* ${storeAddress}\n\nAguardamos você! 🍦`;

    case 'concluido':
      return `Olá, *${customerName}*! ⭐\n\nSeu pedido *#${orderId}* foi *FINALIZADO E ENTREGUE* com sucesso! 🎉\n\nEsperamos que você e sua família adorem nossos geladinhos artesanais. Muito obrigado pela preferência e até a próxima! 🍧❤️`;

    case 'cancelado':
      return `Olá, *${customerName}*.\n\nInformamos que seu pedido *#${orderId}* na *${storeName}* precisou ser *CANCELADO*.\n\nSe tiver qualquer dúvida ou desejar realizar um novo pedido, estamos à disposição por aqui! 🙏`;

    case 'recebido':
    default:
      return `Olá, *${customerName}*! 👋\n\nRecebemos seu pedido *#${orderId}* com sucesso na *${storeName}*!\n💰 *Total:* ${formatCurrency(order.total)}\n💳 *Pagamento:* ${order.customer.paymentMethod === 'pix' ? 'PIX' : order.customer.paymentMethod === 'cartao_entrega' ? 'Cartão' : 'Dinheiro'}\n\nJá estamos conferindo para iniciar o preparo! 🍧`;
  }
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, { label: string; badgeClass: string; bgSoft: string; textClass: string; borderClass: string; iconName: string }> = {
  recebido: {
    label: 'Recebido / Novo',
    badgeClass: 'bg-amber-500 text-white',
    bgSoft: 'bg-amber-50',
    textClass: 'text-amber-700',
    borderClass: 'border-amber-200',
    iconName: 'Inbox',
  },
  em_preparo: {
    label: 'Em Preparo',
    badgeClass: 'bg-blue-500 text-white',
    bgSoft: 'bg-blue-50',
    textClass: 'text-blue-700',
    borderClass: 'border-blue-200',
    iconName: 'ChefHat',
  },
  saiu_entrega: {
    label: 'Saiu p/ Entrega',
    badgeClass: 'bg-purple-500 text-white',
    bgSoft: 'bg-purple-50',
    textClass: 'text-purple-700',
    borderClass: 'border-purple-200',
    iconName: 'Bike',
  },
  pronto_retirada: {
    label: 'Pronto Retirada',
    badgeClass: 'bg-indigo-500 text-white',
    bgSoft: 'bg-indigo-50',
    textClass: 'text-indigo-700',
    borderClass: 'border-indigo-200',
    iconName: 'ShoppingBag',
  },
  concluido: {
    label: 'Concluído / Entregue',
    badgeClass: 'bg-emerald-600 text-white',
    bgSoft: 'bg-emerald-50',
    textClass: 'text-emerald-700',
    borderClass: 'border-emerald-200',
    iconName: 'CheckCircle2',
  },
  cancelado: {
    label: 'Cancelado',
    badgeClass: 'bg-rose-500 text-white',
    bgSoft: 'bg-rose-50',
    textClass: 'text-rose-700',
    borderClass: 'border-rose-200',
    iconName: 'XCircle',
  },
};
