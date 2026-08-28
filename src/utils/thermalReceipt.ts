import { OrderRecord, StoreSettings } from '../types';
import { formatCurrency, formatPhoneDisplay } from './whatsapp';

export type ThermalCopyMode = 'cliente' | 'producao' | 'entrega';
export type ThermalWidth = '80mm' | '58mm';

export function padCenter(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  const left = Math.floor((width - text.length) / 2);
  const right = width - text.length - left;
  return ' '.repeat(left) + text + ' '.repeat(right);
}

export function padBetween(left: string, right: string, width: number): string {
  const spaceNeeded = width - left.length - right.length;
  if (spaceNeeded <= 0) return (left + ' ' + right).slice(0, width);
  return left + ' '.repeat(spaceNeeded) + right;
}

export function generateThermalPlainText(
  order: OrderRecord | any,
  mode: ThermalCopyMode = 'cliente',
  paperWidth: ThermalWidth = '80mm',
  storeSettings?: StoreSettings
): string {
  const store = storeSettings || order.storeSettings || {
    storeName: 'DELICIAS GELADAS GOURMET',
    tagline: 'Geladinhos Artesanais Nobres',
    whatsappNumber: '5511999998888',
    address: 'Rua das Palmeiras, 340',
    city: 'São Paulo - SP',
    pixKey: '11999998888',
    pixKeyType: 'Celular',
    thermalCnpjCpf: '12.345.678/0001-90',
    thermalCustomFooter: 'Conserve no congelador a -18°C. Obrigado!',
  };

  const cols = paperWidth === '80mm' ? 44 : 32;
  const line = '='.repeat(cols);
  const dash = '-'.repeat(cols);
  const dotLine = '.'.repeat(cols);

  const now = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const lines: string[] = [];

  // Top Header
  lines.push(padCenter(store.storeName.toUpperCase(), cols));
  if (store.tagline) {
    lines.push(padCenter(store.tagline, cols));
  }
  if (store.thermalCnpjCpf) {
    lines.push(padCenter(`CNPJ/CPF: ${store.thermalCnpjCpf}`, cols));
  }
  if (store.address) {
    lines.push(padCenter(store.address, cols));
  }
  if (store.city) {
    lines.push(padCenter(store.city, cols));
  }
  if (store.whatsappNumber) {
    lines.push(padCenter(`WhatsApp: ${formatPhoneDisplay(store.whatsappNumber)}`, cols));
  }

  lines.push(line);

  // Document Title & Mode
  const modeTitle = 
    mode === 'producao' ? 'VIA DE PRODUCAO / COZINHA' :
    mode === 'entrega' ? 'VIA DO ENTREGADOR / MOTOBOY' : 
    'COMPROVANTE DE PEDIDO (80MM)';

  lines.push(padCenter(`[ ${modeTitle} ]`, cols));
  lines.push(padBetween(`PEDIDO: #${order.orderId || '0000'}`, `DATA: ${dateFormatted}`, cols));
  lines.push(padBetween(`HORA: ${timeFormatted}`, `TIPO: ${order.customer?.deliveryType === 'delivery' ? 'DELIVERY' : 'RETIRADA'}`, cols));
  lines.push(line);

  // Customer Info
  lines.push('DADOS DO CLIENTE:');
  lines.push(`Cliente: ${order.customer?.name || 'Consumidor'}`);
  lines.push(`WhatsApp: ${formatPhoneDisplay(order.customer?.phone || '')}`);

  if (order.customer?.deliveryType === 'delivery') {
    lines.push(dash);
    lines.push('ENDERECO DE ENTREGA:');
    lines.push(`Rua: ${order.customer?.street || ''}, No ${order.customer?.number || 'S/N'}`);
    lines.push(`Bairro: ${order.customer?.neighborhood || ''}`);
    if (order.customer?.complement) {
      lines.push(`Compl: ${order.customer?.complement}`);
    }
    if (order.customer?.reference) {
      lines.push(`Ref: ${order.customer?.reference}`);
    }
    lines.push(`Cidade: ${order.customer?.city || store.city}`);
    
    if (order.customer?.deliveryOption === 'agendado' && order.customer?.scheduledDate) {
      lines.push(dash);
      lines.push(`AGENDAMENTO: ${order.customer?.scheduledDate} as ${order.customer?.scheduledTime || ''}`);
    }
  } else {
    lines.push(dash);
    lines.push('MODALIDADE: RETIRADA NO BALCAO');
    lines.push(`Local: ${store.address} - ${store.city}`);
  }

  lines.push(line);

  // Items List
  if (mode === 'producao') {
    lines.push(padCenter('ITENS PARA SEPARACAO / FREEZER', cols));
  } else {
    lines.push(padBetween('QTD ITEM', 'TOTAL', cols));
  }
  lines.push(dash);

  // Individual Items
  if (order.items && order.items.length > 0) {
    order.items.forEach((item: any) => {
      const itemTotal = item.product.price * item.quantity;
      const title = `${item.quantity}x ${item.product.name}`;
      if (mode === 'producao') {
        lines.push(`[ ] ${item.quantity}x ${item.product.name}`);
      } else {
        lines.push(padBetween(title, formatCurrency(itemTotal), cols));
      }
      if (item.customNotes) {
        lines.push(`    Obs: ${item.customNotes}`);
      }
    });
  }

  // Combos
  if (order.combos && order.combos.length > 0) {
    order.combos.forEach((comboItem: any) => {
      const comboTotal = comboItem.combo.price * comboItem.quantity;
      const title = `[KIT] ${comboItem.quantity}x ${comboItem.combo.title}`;
      if (mode === 'producao') {
        lines.push(dash);
        lines.push(`[ ] ${title}`);
      } else {
        lines.push(padBetween(title, formatCurrency(comboTotal), cols));
      }

      if (comboItem.selectedFlavors && comboItem.selectedFlavors.length > 0) {
        lines.push('    Sabores do Kit:');
        comboItem.selectedFlavors.forEach((f: any) => {
          lines.push(`    - ${f.quantity}x ${f.product.name}`);
        });
      }
      if (comboItem.combo.includesThermalBag) {
        lines.push('    * Inclui Embalagem Termica *');
      }
    });
  }

  lines.push(line);

  // Financials (Customer and Delivery modes)
  if (mode !== 'producao') {
    lines.push(padBetween('Subtotal:', formatCurrency(order.subtotal || 0), cols));
    if (order.discount && order.discount > 0) {
      lines.push(padBetween('Desconto:', `-${formatCurrency(order.discount)}`, cols));
    }
    lines.push(
      padBetween(
        'Taxa de Entrega:',
        order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : 'GRATIS',
        cols
      )
    );
    lines.push(dash);
    lines.push(padBetween('TOTAL GERAL:', formatCurrency(order.total || 0), cols));
    lines.push(line);

    // Payment method
    lines.push('FORMA DE PAGAMENTO:');
    if (order.customer?.paymentMethod === 'pix') {
      lines.push('>> PAGAMENTO VIA PIX <<');
      lines.push(`Chave ${store.pixKeyType}: ${store.pixKey}`);
      if (store.pixName) lines.push(`Titular: ${store.pixName}`);
    } else if (order.customer?.paymentMethod === 'cartao_entrega') {
      lines.push('>> CARTAO NA ENTREGA <<');
      lines.push('(Levar maquina de debito/credito)');
    } else if (order.customer?.paymentMethod === 'dinheiro') {
      lines.push('>> PAGAMENTO EM DINHEIRO <<');
      if (order.customer?.changeFor && order.customer?.changeFor.trim() !== '') {
        lines.push(`Troco solicitado para: ${order.customer?.changeFor}`);
      } else {
        lines.push('Valor exato / Sem necessidade de troco');
      }
    }
    lines.push(dash);
  }

  // Customer notes
  if (order.customer?.notes && order.customer?.notes.trim() !== '') {
    lines.push('OBSERVACOES DO PEDIDO:');
    lines.push(order.customer.notes);
    lines.push(dash);
  }

  // Footer Message
  if (store.thermalCustomFooter) {
    lines.push(padCenter(store.thermalCustomFooter, cols));
  } else {
    lines.push(padCenter('Mantenha congelado a -18C.', cols));
    lines.push(padCenter('Obrigado pela preferencia!', cols));
  }

  lines.push(dotLine);
  lines.push(padCenter('--- CORTE AQUI [ESC/POS 80MM] ---', cols));
  lines.push('');

  return lines.join('\n');
}
