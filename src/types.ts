export interface CategoryItem {
  id: string; // unique slug e.g. 'frutas-ninho', 'cremosos', 'especiais'
  label: string; // Display name e.g. 'Frutas com Ninho'
  icon?: string; // Icon or emoji identifier
  color?: string; // Optional color theme class or gradient
  description?: string;
  order?: number;
}

export type ProductCategory = string;

export interface GeladinhoProduct {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  badges: string[]; // e.g. 'Mais Vendido', 'Nutella Original', 'Zero Açúcar', '100% Fruta', 'Contém Álcool'
  ingredients: string[];
  allergens: string[];
  volumeMl: number; // e.g. 150ml
  isAvailable: boolean;
  stockQuantity: number; // Current quantity in inventory
  trackStock?: boolean; // Whether stock tracking is enabled (default true)
  minStockAlert?: number; // Threshold for low stock warning (default 5)
  rating: number;
  reviewsCount: number;
  temperatureNote?: string;
  flavorProfile: {
    sweetness: number; // 1 to 5
    creaminess: number; // 1 to 5
    fruitiness: number; // 1 to 5
  };
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  quantityChanged: number; // negative for deduction, positive for restock
  previousStock: number;
  newStock: number;
  reason: 'order' | 'manual_adjustment' | 'restock' | 'batch_restock';
  orderId?: string;
  timestamp: string;
}

export interface PromoCombo {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  itemsCount: number;
  price: number;
  originalPrice: number;
  image: string;
  badge: string;
  includesThermalBag?: boolean;
  includedFlavorIds?: string[];
  isCustomizable?: boolean;
}

export interface CartItem {
  product: GeladinhoProduct;
  quantity: number;
  customNotes?: string;
}

export interface CartComboItem {
  combo: PromoCombo;
  quantity: number;
  selectedFlavors?: { product: GeladinhoProduct; quantity: number }[];
}

export type DeliveryType = 'delivery' | 'retirada';
export type PaymentMethod = 'pix' | 'cartao_entrega' | 'dinheiro';

export interface CustomerDetails {
  name: string;
  phone: string;
  deliveryType: DeliveryType;
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  reference?: string;
  city: string;
  paymentMethod: PaymentMethod;
  changeFor?: string;
  deliveryOption: 'agora' | 'agendado';
  scheduledDate?: string;
  scheduledTime?: string;
  notes?: string;
  needThermalPackaging?: boolean;
}

export interface NeighborhoodFee {
  id?: string;
  name: string;
  fee: number;
  estimatedTimeMin: number;
  isActive?: boolean; // Whether delivery to this neighborhood is currently available
  minOrderValue?: number; // Optional custom min order value for this neighborhood
  notes?: string; // Optional delivery notes e.g. "Apenas sábados e domingos"
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string; // international digits without + or spaces e.g. 5511999998888
  instagramHandle: string;
  address: string;
  city: string;
  pixKey: string;
  pixKeyType: 'CPF/CNPJ' | 'Celular' | 'E-mail' | 'Chave Aleatória';
  pixName: string;
  minOrderValue: number;
  freeDeliveryThreshold: number;
  isOpen: boolean;
  openingHoursText: string;
  standardDeliveryFee: number;
  deliveryEnabled?: boolean; // Whether home delivery service is currently active
  deliveryDisabledMessage?: string; // Message shown when delivery is disabled
  pickupEnabled?: boolean; // Whether store pickup is available (default true)
  // Thermal receipt settings
  thermalCnpjCpf?: string;
  thermalCustomFooter?: string;
  thermalAutoOpenPrint?: boolean;
  // Security & Admin authentication
  adminPin?: string;
}

export type OrderStatus = 'recebido' | 'em_preparo' | 'saiu_entrega' | 'pronto_retirada' | 'concluido' | 'cancelado';
export type PaymentStatus = 'pendente' | 'pago' | 'reembolsado';

export interface OrderTimelineEvent {
  status: OrderStatus;
  timestamp: string;
  note?: string;
}

export interface OrderRecord {
  id: string;
  orderId: string;
  createdAt: string; // ISO date string
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  customer: CustomerDetails;
  items: CartItem[];
  combos: CartComboItem[];
  storeSettings: StoreSettings;
  rawMessage?: string;
  // Management extensions
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  courierName?: string;
  internalNotes?: string;
  estimatedDeliveryMinutes?: number;
  timeline?: OrderTimelineEvent[];
  updatedAt?: string;
}

export interface CustomerReview {
  id: string;
  author: string;
  rating: number;
  comment: string;
  favoriteFlavor: string;
  date: string;
  city: string;
  avatar: string;
  avatarColor?: string;
  isVerified?: boolean;
  createdAt?: string;
}
