import { OrderRecord, StoreSettings } from '../types';
import { ThermalCopyMode, ThermalWidth } from './thermalReceipt';
import { formatCurrency, formatPhoneDisplay } from './whatsapp';

/**
 * Generates the clean HTML string formatted specifically for 80mm or 58mm thermal receipt printers
 */
export function buildThermalReceiptHtml(
  order: OrderRecord | any,
  mode: ThermalCopyMode = 'cliente',
  paperWidth: ThermalWidth = '80mm',
  storeSettings?: StoreSettings
): string {
  const store = storeSettings || order.storeSettings || {
    storeName: 'DELÍCIAS GELADAS GOURMET',
    tagline: 'Geladinhos Artesanais Nobres',
    whatsappNumber: '5511999998888',
    address: 'Rua das Palmeiras, 340',
    city: 'São Paulo - SP',
    pixKey: '11999998888',
    pixKeyType: 'Celular',
    thermalCnpjCpf: '12.345.678/0001-90',
    thermalCustomFooter: 'Conserve no congelador a -18°C. Obrigado pela preferência!',
  };

  const now = order.createdAt ? new Date(order.createdAt) : new Date();
  const dateFormatted = now.toLocaleDateString('pt-BR');
  const timeFormatted = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

  const widthMm = paperWidth === '58mm' ? '58mm' : '80mm';
  const fontSize = paperWidth === '58mm' ? '11px' : '12px';

  const modeTitle =
    mode === 'producao'
      ? 'VIA DE PRODUÇÃO / COZINHA'
      : mode === 'entrega'
      ? 'VIA DO ENTREGADOR / MOTOBOY'
      : 'COMPROVANTE DO CLIENTE';

  const itemsHtml = (order.items || [])
    .map((item: any) => {
      const total = item.product?.price ? item.product.price * item.quantity : 0;
      return `
        <div style="margin-bottom: 4px;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>${mode === 'producao' ? '[ ] ' : ''}${item.quantity}x ${item.product?.name || 'Geladinho'}</span>
            ${mode !== 'producao' ? `<span>${formatCurrency(total)}</span>` : ''}
          </div>
          ${item.customNotes ? `<div style="font-size: 10px; font-style: italic; padding-left: 8px;">↳ Obs: ${item.customNotes}</div>` : ''}
        </div>
      `;
    })
    .join('');

  const combosHtml = (order.combos || [])
    .map((cItem: any) => {
      const total = cItem.combo?.price ? cItem.combo.price * cItem.quantity : 0;
      const flavors = (cItem.selectedFlavors || [])
        .map((f: any) => `<div style="padding-left: 10px; font-size: 10px;">- ${f.quantity}x ${f.product?.name}</div>`)
        .join('');
      return `
        <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dotted #888;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span>${mode === 'producao' ? '[ ] ' : ''}${cItem.quantity}x [KIT] ${cItem.combo?.title || 'Combo'}</span>
            ${mode !== 'producao' ? `<span>${formatCurrency(total)}</span>` : ''}
          </div>
          ${flavors}
          ${cItem.combo?.includesThermalBag ? `<div style="font-size: 9px; padding-left: 10px;">* Inclui Embalagem Térmica *</div>` : ''}
        </div>
      `;
    })
    .join('');

  const financialsHtml =
    mode !== 'producao'
      ? `
        <div style="margin-top: 8px; padding-top: 6px; border-top: 1px dashed #000; font-size: ${fontSize};">
          <div style="display: flex; justify-content: space-between;">
            <span>Subtotal:</span>
            <span>${formatCurrency(order.subtotal || 0)}</span>
          </div>
          ${
            order.discount > 0
              ? `<div style="display: flex; justify-content: space-between;">
                  <span>Desconto:</span>
                  <span>-${formatCurrency(order.discount)}</span>
                </div>`
              : ''
          }
          <div style="display: flex; justify-content: space-between;">
            <span>Taxa de Entrega:</span>
            <span>${order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : 'GRÁTIS'}</span>
          </div>
          <div style="display: flex; justify-content: space-between; font-weight: 900; font-size: 14px; margin-top: 4px; padding-top: 4px; border-top: 1.5px solid #000;">
            <span>TOTAL:</span>
            <span>${formatCurrency(order.total || 0)}</span>
          </div>
        </div>
      `
      : '';

  const paymentHtml =
    mode !== 'producao'
      ? `
        <div style="margin-top: 6px; padding-top: 6px; border-top: 1px dashed #000; font-size: 11px;">
          <div style="font-weight: bold;">PAGAMENTO:</div>
          ${
            order.customer?.paymentMethod === 'pix'
              ? `<div>PIX - Chave ${store.pixKeyType}: <strong>${store.pixKey}</strong></div>`
              : order.customer?.paymentMethod === 'cartao_entrega'
              ? `<div>CARTÃO NA ENTREGA (Levar maquininha)</div>`
              : `<div>DINHEIRO ${order.customer?.changeFor ? `- Troco p/ ${order.customer.changeFor}` : '(Valor Exato)'}</div>`
          }
        </div>
      `
      : '';

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Cupom Pedido #${order.orderId || '0000'}</title>
  <style>
    @page {
      size: ${widthMm} auto;
      margin: 0mm;
    }
    *, *:before, *:after {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      margin: 0;
      padding: 3mm 2mm;
      width: ${widthMm};
      max-width: ${widthMm};
      background: #ffffff;
      color: #000000;
      font-family: 'Courier New', Courier, monospace, monospace;
      font-size: ${fontSize};
      line-height: 1.25;
    }
    .text-center { text-align: center; }
    .bold { font-weight: bold; }
    .divider { border-top: 1px dashed #000; margin: 6px 0; }
    .divider-solid { border-top: 1.5px solid #000; margin: 6px 0; }
    .divider-double { border-top: 2px solid #000; margin: 6px 0; }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="text-center">
    <div style="font-size: 15px; font-weight: 900; text-transform: uppercase;">${store.storeName}</div>
    ${store.tagline ? `<div style="font-size: 10px;">${store.tagline}</div>` : ''}
    ${store.thermalCnpjCpf ? `<div style="font-size: 10px;">CNPJ/CPF: ${store.thermalCnpjCpf}</div>` : ''}
    ${store.address ? `<div style="font-size: 10px;">${store.address} - ${store.city}</div>` : ''}
    ${store.whatsappNumber ? `<div style="font-size: 10px; font-weight: bold;">WhatsApp: ${formatPhoneDisplay(store.whatsappNumber)}</div>` : ''}
  </div>

  <div class="divider-solid"></div>

  <!-- Mode & Order Identification -->
  <div class="text-center">
    <div style="font-weight: 800; font-size: 11px; text-transform: uppercase;">[ ${modeTitle} ]</div>
    <div style="font-size: 18px; font-weight: 900; margin: 2px 0;">PEDIDO #${order.orderId || '0000'}</div>
    <div style="display: flex; justify-content: space-between; font-size: 10px;">
      <span>${dateFormatted} ${timeFormatted}</span>
      <span style="font-weight: bold; text-transform: uppercase;">${order.customer?.deliveryType === 'delivery' ? '🛵 DELIVERY' : '🏬 RETIRADA'}</span>
    </div>
  </div>

  <div class="divider"></div>

  <!-- Customer Data -->
  <div style="font-size: 11px;">
    <div><strong>Cliente:</strong> ${order.customer?.name || 'Cliente'}</div>
    <div><strong>WhatsApp:</strong> ${formatPhoneDisplay(order.customer?.phone || '')}</div>
    ${
      order.customer?.deliveryType === 'delivery'
        ? `
          <div style="margin-top: 3px;">
            <div><strong>Endereço:</strong> ${order.customer?.street || ''}, nº ${order.customer?.number || 'S/N'}</div>
            <div><strong>Bairro:</strong> ${order.customer?.neighborhood || ''} - ${order.customer?.city || store.city}</div>
            ${order.customer?.complement ? `<div><strong>Compl:</strong> ${order.customer?.complement}</div>` : ''}
            ${order.customer?.reference ? `<div><strong>Ref:</strong> ${order.customer?.reference}</div>` : ''}
            ${
              order.customer?.deliveryOption === 'agendado' && order.customer?.scheduledDate
                ? `<div style="font-weight: bold; margin-top: 2px;">⏰ AGENDADO: ${order.customer.scheduledDate} às ${order.customer.scheduledTime}</div>`
                : ''
            }
          </div>
        `
        : `<div><strong>Retirada:</strong> Balcão da Loja (${store.address})</div>`
    }
  </div>

  <div class="divider-solid"></div>

  <!-- Items -->
  <div style="font-size: 11px;">
    <div style="display: flex; justify-content: space-between; font-weight: bold; border-bottom: 1px solid #000; padding-bottom: 2px; margin-bottom: 4px;">
      <span>QTD ITEM</span>
      ${mode !== 'producao' ? `<span>TOTAL</span>` : ''}
    </div>
    ${itemsHtml}
    ${combosHtml}
  </div>

  ${financialsHtml}
  ${paymentHtml}

  ${
    order.customer?.notes
      ? `
        <div style="margin-top: 6px; padding-top: 4px; border-top: 1px dashed #000; font-size: 10px;">
          <strong>OBS:</strong> ${order.customer.notes}
        </div>
      `
      : ''
  }

  <div class="divider"></div>

  <!-- Footer -->
  <div class="text-center" style="font-size: 10px; margin-top: 6px;">
    <div>${store.thermalCustomFooter || 'Conserve no congelador a -18°C.'}</div>
    <div style="font-weight: bold; margin-top: 2px;">Obrigado pela preferência!</div>
    <div style="margin-top: 8px; font-size: 9px; color: #555;">- - - - - CORTE AQUI ✂ - - - - -</div>
  </div>
</body>
</html>
  `;
}

/**
 * Universal printing function: Uses an isolated hidden iframe to guarantee
 * standard thermal print dialog pops up even inside iframe environments.
 */
export function executeThermalPrint(
  order: OrderRecord | any,
  mode: ThermalCopyMode = 'cliente',
  paperWidth: ThermalWidth = '80mm',
  storeSettings?: StoreSettings
): Promise<boolean> {
  return new Promise((resolve) => {
    try {
      const htmlContent = buildThermalReceiptHtml(order, mode, paperWidth, storeSettings);

      // Create a hidden print iframe
      const printFrame = document.createElement('iframe');
      printFrame.style.position = 'fixed';
      printFrame.style.right = '0';
      printFrame.style.bottom = '0';
      printFrame.style.width = '0';
      printFrame.style.height = '0';
      printFrame.style.border = '0';
      printFrame.style.zIndex = '-9999';
      document.body.appendChild(printFrame);

      const frameDoc = printFrame.contentWindow?.document || printFrame.contentDocument;
      if (!frameDoc) {
        // Fallback to window.print directly
        window.print();
        resolve(true);
        return;
      }

      frameDoc.open();
      frameDoc.write(htmlContent);
      frameDoc.close();

      setTimeout(() => {
        try {
          printFrame.contentWindow?.focus();
          printFrame.contentWindow?.print();
          resolve(true);
        } catch (err) {
          console.warn('Iframe print error, falling back to window.print:', err);
          window.print();
          resolve(true);
        } finally {
          setTimeout(() => {
            if (document.body.contains(printFrame)) {
              document.body.removeChild(printFrame);
            }
          }, 3000);
        }
      }, 250);
    } catch (e) {
      console.error('Print execution error:', e);
      window.print();
      resolve(false);
    }
  });
}

/**
 * Opens a clean, dedicated printable tab with the receipt
 */
export function openReceiptInNewTab(
  order: OrderRecord | any,
  mode: ThermalCopyMode = 'cliente',
  paperWidth: ThermalWidth = '80mm',
  storeSettings?: StoreSettings
) {
  const htmlContent = buildThermalReceiptHtml(order, mode, paperWidth, storeSettings);
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.open();
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 300);
  } else {
    // If popup blocked, use direct iframe print
    executeThermalPrint(order, mode, paperWidth, storeSettings);
  }
}
