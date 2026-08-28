import React, { useState, useEffect, useMemo } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  HeroBanner 
} from './components/HeroBanner';
import { 
  PromoCombos 
} from './components/PromoCombos';
import { 
  CategoryFilter 
} from './components/CategoryFilter';
import { 
  FlavorCard 
} from './components/FlavorCard';
import { 
  ProductDetailModal 
} from './components/ProductDetailModal';
import { 
  ComboCustomizerModal 
} from './components/ComboCustomizerModal';
import { 
  CartDrawer 
} from './components/CartDrawer';
import { 
  CheckoutModal 
} from './components/CheckoutModal';
import { 
  WhatsAppSuccessModal 
} from './components/WhatsAppSuccessModal';
import { 
  StoreSettingsModal 
} from './components/StoreSettingsModal';
import { 
  FlavorQuizModal 
} from './components/FlavorQuizModal';
import { 
  MenuManagerModal 
} from './components/MenuManagerModal';
import { 
  OrderManagerModal 
} from './components/OrderManagerModal';
import { 
  ThermalReceiptModal 
} from './components/ThermalReceiptModal';
import { 
  TestimonialsAndFaq 
} from './components/TestimonialsAndFaq';
import { 
  Footer 
} from './components/Footer';
import { 
  FloatingCartButton 
} from './components/FloatingCartButton';
import {
  AdminBar
} from './components/AdminBar';
import {
  AdminAuthModal
} from './components/AdminAuthModal';
import {
  NeighborhoodManagerModal
} from './components/NeighborhoodManagerModal';

import { 
  GeladinhoProduct, 
  PromoCombo, 
  CartItem, 
  CartComboItem, 
  ProductCategory, 
  CategoryItem,
  NeighborhoodFee,
  StoreSettings,
  OrderRecord,
  OrderStatus,
  PaymentStatus,
  StockMovement
} from './types';
import { 
  PRODUCTS_DATA, 
  PROMO_COMBOS_DATA, 
  DEFAULT_CATEGORIES_DATA, 
  DEFAULT_NEIGHBORHOODS_DATA, 
  DEFAULT_STORE_SETTINGS, 
  OFFICIAL_CATALOG_VERSION 
} from './data/products';
import {
  db,
  initializeFirestoreIfEmpty,
  subscribeToProducts,
  subscribeToCombos,
  subscribeToCategories,
  subscribeToNeighborhoods,
  subscribeToStoreSettings,
  subscribeToOrders,
  subscribeToStockMovements,
  dbSaveProduct,
  dbDeleteProduct,
  dbBatchSaveProducts,
  dbSaveCombo,
  dbDeleteCombo,
  dbBatchSaveCombos,
  dbSaveCategory,
  dbDeleteCategory,
  dbSaveNeighborhood,
  dbDeleteNeighborhood,
  dbBatchSaveNeighborhoods,
  dbSaveStoreSettings,
  dbSaveOrder,
  dbAddStockMovement,
  ORDERS_COLLECTION
} from './firebase';
import { doc, deleteDoc } from 'firebase/firestore';

export default function App() {
  // Check if current browser storage matches official catalog version from naturalisgourmet.vercel.app
  const isCatalogSynced = (() => {
    try {
      return localStorage.getItem('naturalis_catalog_version') === OFFICIAL_CATALOG_VERSION;
    } catch {
      return false;
    }
  })();

  // Local storage state initialization with automatic version synchronization
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
    try {
      const saved = localStorage.getItem('geladinhos_store_settings');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.storeName === 'Delícias Geladas Gourmet') {
          parsed.storeName = 'Naturalis Gourmet';
        }
        if (parsed.instagramHandle === '@deliciasgeladas.gourmet') {
          parsed.instagramHandle = '@naturalisgourmet';
        }
        if (!isCatalogSynced && (!parsed.city || parsed.city.includes('São Paulo'))) {
          parsed.city = 'Olímpia - SP';
        }
        return { ...DEFAULT_STORE_SETTINGS, ...parsed };
      }
      return DEFAULT_STORE_SETTINGS;
    } catch {
      return DEFAULT_STORE_SETTINGS;
    }
  });

  const [categories, setCategories] = useState<CategoryItem[]>(() => {
    try {
      const saved = localStorage.getItem('geladinhos_categories');
      return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES_DATA;
    } catch {
      return DEFAULT_CATEGORIES_DATA;
    }
  });

  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodFee[]>(() => {
    if (!isCatalogSynced) {
      try {
        localStorage.setItem('geladinhos_neighborhoods', JSON.stringify(DEFAULT_NEIGHBORHOODS_DATA));
      } catch {}
      return DEFAULT_NEIGHBORHOODS_DATA;
    }
    try {
      const saved = localStorage.getItem('geladinhos_neighborhoods');
      return saved ? JSON.parse(saved) : DEFAULT_NEIGHBORHOODS_DATA;
    } catch {
      return DEFAULT_NEIGHBORHOODS_DATA;
    }
  });

  const [products, setProducts] = useState<GeladinhoProduct[]>(() => {
    if (!isCatalogSynced) {
      try {
        localStorage.setItem('naturalis_catalog_version', OFFICIAL_CATALOG_VERSION);
        localStorage.setItem('geladinhos_products', JSON.stringify(PRODUCTS_DATA));
      } catch {}
      return PRODUCTS_DATA;
    }
    try {
      const saved = localStorage.getItem('geladinhos_products');
      return saved ? JSON.parse(saved) : PRODUCTS_DATA;
    } catch {
      return PRODUCTS_DATA;
    }
  });

  const [combos, setCombos] = useState<PromoCombo[]>(() => {
    if (!isCatalogSynced) {
      try {
        localStorage.setItem('geladinhos_combos', JSON.stringify(PROMO_COMBOS_DATA));
      } catch {}
      return PROMO_COMBOS_DATA;
    }
    try {
      const saved = localStorage.getItem('geladinhos_combos');
      return saved ? JSON.parse(saved) : PROMO_COMBOS_DATA;
    } catch {
      return PROMO_COMBOS_DATA;
    }
  });

  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('geladinhos_cart_items');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((i) => i && i.product && typeof i.product.price === 'number' && i.quantity > 0);
    } catch {
      return [];
    }
  });

  const [cartCombos, setCartCombos] = useState<CartComboItem[]>(() => {
    try {
      const saved = localStorage.getItem('geladinhos_cart_combos');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter((c) => c && c.combo && typeof c.combo.price === 'number' && c.quantity > 0);
    } catch {
      return [];
    }
  });

  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('geladinhos_favorites');
      return saved ? JSON.parse(saved) : ['sabor-1787757735535', 'sabor-1787581082471'];
    } catch {
      return ['sabor-1787757735535', 'sabor-1787581082471'];
    }
  });

  // Filter and search states
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'popular' | 'price-asc' | 'price-desc' | 'name'>('popular');

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [isMenuManagerOpen, setIsMenuManagerOpen] = useState(false);
  const [isNeighborhoodManagerOpen, setIsNeighborhoodManagerOpen] = useState(false);
  const [isOrderManagerOpen, setIsOrderManagerOpen] = useState(false);
  const [isThermalPrintOpen, setIsThermalPrintOpen] = useState(false);
  const [selectedProductDetail, setSelectedProductDetail] = useState<GeladinhoProduct | null>(null);
  const [customizingCombo, setCustomizingCombo] = useState<PromoCombo | null>(null);

  // Admin Authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('geladinhos_admin_auth') === 'true';
    } catch {
      return false;
    }
  });
  const [isAdminAuthModalOpen, setIsAdminAuthModalOpen] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<'menu' | 'orders' | 'settings' | 'thermal' | 'neighborhoods' | null>(null);

  // Orders History & Thermal Printing
  const [ordersHistory, setOrdersHistory] = useState<OrderRecord[]>(() => {
    try {
      const saved = localStorage.getItem('geladinhos_orders_history');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    const now = new Date();
    return [
      {
        id: 'order-demo-1',
        orderId: '4829',
        createdAt: new Date(now.getTime() - 1000 * 60 * 12).toISOString(),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 10).toISOString(),
        status: 'recebido',
        paymentStatus: 'pendente',
        subtotal: 58.50,
        deliveryFee: 0,
        discount: 0,
        total: 58.50,
        customer: {
          name: 'Mariana Souza',
          phone: '11988887777',
          deliveryType: 'delivery',
          street: 'Av. Paulista',
          number: '1578',
          neighborhood: 'Bela Vista',
          complement: 'Apto 82',
          reference: 'Próximo ao MASP',
          city: 'São Paulo - SP',
          paymentMethod: 'pix',
          deliveryOption: 'agora',
          notes: 'Por favor manter bem congelado!',
          needThermalPackaging: true,
        },
        items: [
          { product: PRODUCTS_DATA[0], quantity: 2, customNotes: 'Bem geladinho' },
          { product: PRODUCTS_DATA[1], quantity: 1 },
          { product: PRODUCTS_DATA[2], quantity: 1 },
        ],
        combos: [
          {
            combo: PROMO_COMBOS_DATA[0],
            quantity: 1,
            selectedFlavors: [
              { product: PRODUCTS_DATA[0], quantity: 2 },
              { product: PRODUCTS_DATA[1], quantity: 2 },
            ],
          },
        ],
        timeline: [
          { status: 'recebido', timestamp: new Date(now.getTime() - 1000 * 60 * 12).toISOString(), note: 'Pedido recebido pelo cardápio' }
        ],
        storeSettings: DEFAULT_STORE_SETTINGS,
      },
      {
        id: 'order-demo-2',
        orderId: '3912',
        createdAt: new Date(now.getTime() - 1000 * 60 * 35).toISOString(),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 20).toISOString(),
        status: 'em_preparo',
        paymentStatus: 'pago',
        estimatedDeliveryMinutes: 25,
        internalNotes: 'Separar em embalagem térmica com gelo extra.',
        subtotal: 42.00,
        deliveryFee: 5.00,
        discount: 0,
        total: 47.00,
        customer: {
          name: 'Lucas Ferreira',
          phone: '11977776666',
          deliveryType: 'delivery',
          street: 'Rua Augusta',
          number: '920',
          neighborhood: 'Consolação',
          city: 'São Paulo - SP',
          paymentMethod: 'cartao',
          deliveryOption: 'agora',
          needThermalPackaging: true,
        },
        items: [
          { product: PRODUCTS_DATA[0], quantity: 3 },
          { product: PRODUCTS_DATA[3], quantity: 2 },
        ],
        timeline: [
          { status: 'recebido', timestamp: new Date(now.getTime() - 1000 * 60 * 35).toISOString() },
          { status: 'em_preparo', timestamp: new Date(now.getTime() - 1000 * 60 * 20).toISOString(), note: 'Iniciado preparo e embalagem' }
        ],
        storeSettings: DEFAULT_STORE_SETTINGS,
      },
      {
        id: 'order-demo-3',
        orderId: '2741',
        createdAt: new Date(now.getTime() - 1000 * 60 * 65).toISOString(),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 15).toISOString(),
        status: 'saiu_entrega',
        paymentStatus: 'pago',
        courierName: 'Marcos Motoboy',
        subtotal: 36.00,
        deliveryFee: 6.00,
        discount: 0,
        total: 42.00,
        customer: {
          name: 'Camila Rocha',
          phone: '11966665555',
          deliveryType: 'delivery',
          street: 'Rua Oscar Freire',
          number: '450',
          neighborhood: 'Jardins',
          complement: 'Bloco B, 41',
          city: 'São Paulo - SP',
          paymentMethod: 'pix',
          deliveryOption: 'agora',
        },
        items: [
          { product: PRODUCTS_DATA[1], quantity: 2 },
          { product: PRODUCTS_DATA[4], quantity: 2 },
        ],
        timeline: [
          { status: 'recebido', timestamp: new Date(now.getTime() - 1000 * 60 * 65).toISOString() },
          { status: 'em_preparo', timestamp: new Date(now.getTime() - 1000 * 60 * 45).toISOString() },
          { status: 'saiu_entrega', timestamp: new Date(now.getTime() - 1000 * 60 * 15).toISOString(), note: 'Saiu com Marcos Motoboy' }
        ],
        storeSettings: DEFAULT_STORE_SETTINGS,
      },
      {
        id: 'order-demo-4',
        orderId: '1855',
        createdAt: new Date(now.getTime() - 1000 * 60 * 90).toISOString(),
        updatedAt: new Date(now.getTime() - 1000 * 60 * 30).toISOString(),
        status: 'pronto_retirada',
        paymentStatus: 'pendente',
        subtotal: 28.00,
        deliveryFee: 0,
        discount: 0,
        total: 28.00,
        customer: {
          name: 'Rodrigo Alves',
          phone: '11955554444',
          deliveryType: 'retirada',
          city: 'São Paulo - SP',
          paymentMethod: 'dinheiro',
          deliveryOption: 'agora',
          notes: 'Vou retirar em 15 minutos!',
        },
        items: [
          { product: PRODUCTS_DATA[0], quantity: 2 },
          { product: PRODUCTS_DATA[2], quantity: 1 },
        ],
        timeline: [
          { status: 'recebido', timestamp: new Date(now.getTime() - 1000 * 60 * 90).toISOString() },
          { status: 'em_preparo', timestamp: new Date(now.getTime() - 1000 * 60 * 60).toISOString() },
          { status: 'pronto_retirada', timestamp: new Date(now.getTime() - 1000 * 60 * 30).toISOString(), note: 'Aguardando cliente no balcão' }
        ],
        storeSettings: DEFAULT_STORE_SETTINGS,
      }
    ];
  });

  // Stock Movements log history
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem('geladinhos_stock_movements');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [
      {
        id: 'mov-initial-1',
        productId: 'sabor-1787757735535',
        productName: 'Maracuja Cremoso',
        quantityChanged: 20,
        previousStock: 0,
        newStock: 20,
        reason: 'restock',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: 'mov-initial-2',
        productId: 'sabor-1787581082471',
        productName: 'Morango Cremoso',
        quantityChanged: 20,
        previousStock: 0,
        newStock: 20,
        reason: 'restock',
        timestamp: new Date(Date.now() - 3600000 * 20).toISOString(),
      }
    ];
  });

  const [selectedThermalOrder, setSelectedThermalOrder] = useState<OrderRecord | any>(() => {
    return ordersHistory[0] || null;
  });

  // Success summary state
  const [lastOrderSummary, setLastOrderSummary] = useState<any>(null);
  const [lastWhatsappUrl, setLastWhatsappUrl] = useState('');
  const [lastRawMessage, setLastRawMessage] = useState('');
  const [isCloudSynced, setIsCloudSynced] = useState(false);

  // Real-time Firestore Cloud Sync Subscriptions
  useEffect(() => {
    // 1. Initialize Firestore if empty (on first load)
    initializeFirestoreIfEmpty(
      products,
      combos,
      categories,
      neighborhoods,
      storeSettings
    ).then(() => {
      setIsCloudSynced(true);
    });

    // 2. Subscribe to realtime updates across all devices
    const unsubProducts = subscribeToProducts((cloudProducts) => {
      if (cloudProducts && cloudProducts.length > 0) {
        setProducts(cloudProducts);
        setIsCloudSynced(true);
      }
    });

    const unsubCombos = subscribeToCombos((cloudCombos) => {
      if (cloudCombos && cloudCombos.length > 0) {
        setCombos(cloudCombos);
      }
    });

    const unsubCategories = subscribeToCategories((cloudCategories) => {
      if (cloudCategories && cloudCategories.length > 0) {
        setCategories(cloudCategories);
      }
    });

    const unsubNeighborhoods = subscribeToNeighborhoods((cloudNeighborhoods) => {
      if (cloudNeighborhoods && cloudNeighborhoods.length > 0) {
        setNeighborhoods(cloudNeighborhoods);
      }
    });

    const unsubSettings = subscribeToStoreSettings((cloudSettings) => {
      if (cloudSettings) {
        setStoreSettings((prev) => ({ ...prev, ...cloudSettings }));
      }
    });

    const unsubOrders = subscribeToOrders((cloudOrders) => {
      if (cloudOrders && cloudOrders.length > 0) {
        setOrdersHistory(cloudOrders);
      }
    });

    const unsubStockMovements = subscribeToStockMovements((cloudMovements) => {
      if (cloudMovements && cloudMovements.length > 0) {
        setStockMovements(cloudMovements);
      }
    });

    return () => {
      unsubProducts();
      unsubCombos();
      unsubCategories();
      unsubNeighborhoods();
      unsubSettings();
      unsubOrders();
      unsubStockMovements();
    };
  }, []);

  // Persist state changes to localStorage as offline fallback
  useEffect(() => {
    localStorage.setItem('geladinhos_orders_history', JSON.stringify(ordersHistory));
  }, [ordersHistory]);

  useEffect(() => {
    localStorage.setItem('geladinhos_stock_movements', JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem('geladinhos_store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);

  useEffect(() => {
    localStorage.setItem('geladinhos_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('geladinhos_combos', JSON.stringify(combos));
  }, [combos]);

  useEffect(() => {
    localStorage.setItem('geladinhos_cart_items', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    localStorage.setItem('geladinhos_cart_combos', JSON.stringify(cartCombos));
  }, [cartCombos]);

  useEffect(() => {
    localStorage.setItem('geladinhos_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('geladinhos_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('geladinhos_neighborhoods', JSON.stringify(neighborhoods));
  }, [neighborhoods]);

  // Cart calculations
  const totalCartCount = useMemo(() => {
    const itemsCount = (cartItems || []).reduce((acc, item) => acc + (item?.quantity || 0), 0);
    const combosCount = (cartCombos || []).reduce((acc, c) => acc + ((c?.combo?.itemsCount || 0) * (c?.quantity || 0)), 0);
    return itemsCount + combosCount;
  }, [cartItems, cartCombos]);

  const totalCartValue = useMemo(() => {
    const itemsTotal = (cartItems || []).reduce((acc, item) => {
      const price = item?.product?.price ?? 0;
      const qty = item?.quantity ?? 0;
      return acc + (price * qty);
    }, 0);
    const combosTotal = (cartCombos || []).reduce((acc, c) => {
      const price = c?.combo?.price ?? 0;
      const qty = c?.quantity ?? 0;
      return acc + (price * qty);
    }, 0);
    return itemsTotal + combosTotal;
  }, [cartItems, cartCombos]);

  // Category item counts based on dynamic products
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    products.forEach((p) => {
      counts[p.category] = (counts[p.category] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filtered and sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      if (activeCategory !== 'todos' && product.category !== activeCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = product.name.toLowerCase().includes(q);
        const matchesTagline = product.tagline.toLowerCase().includes(q);
        const matchesDescription = product.description.toLowerCase().includes(q);
        const matchesIngredient = product.ingredients.some((ing) => ing.toLowerCase().includes(q));
        const matchesBadges = product.badges.some((b) => b.toLowerCase().includes(q));
        if (!matchesName && !matchesTagline && !matchesDescription && !matchesIngredient && !matchesBadges) {
          return false;
        }
      }

      // Tag filter
      if (selectedTag) {
        if (!product.badges.includes(selectedTag)) {
          return false;
        }
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'popular') return b.rating - a.rating;
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      return 0;
    });
  }, [products, activeCategory, searchQuery, selectedTag, sortBy]);

  // Cart operations
  const handleAddToCart = (product: GeladinhoProduct, quantity = 1, customNotes?: string) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.product.id === product.id && i.customNotes === customNotes);
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      }
      return [...prev, { product, quantity, customNotes }];
    });
  };

  const handleUpdateItemQuantity = (productId: string, quantity: number) => {
    setCartItems((prev) => {
      if (quantity <= 0) {
        return prev.filter((i) => i.product.id !== productId);
      }
      return prev.map((item) => (item.product.id === productId ? { ...item, quantity } : item));
    });
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
  };

  const handleSelectCombo = (combo: PromoCombo) => {
    if (combo.isCustomizable) {
      setCustomizingCombo(combo);
    } else {
      // Auto resolve included flavors from dynamic products
      const selectedFlavors = combo.includedFlavorIds
        ? combo.includedFlavorIds.map((id) => {
            const found = products.find((p) => p.id === id);
            return found ? { product: found, quantity: 1 } : null;
          }).filter(Boolean) as { product: GeladinhoProduct; quantity: number }[]
        : undefined;

      setCartCombos((prev) => [...prev, { combo, quantity: 1, selectedFlavors }]);
      setIsCartOpen(true);
    }
  };

  // Menu Manager CRUD Handlers
  const handleSaveProduct = (updatedProduct: GeladinhoProduct) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === updatedProduct.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = updatedProduct;
        return next;
      }
      return [updatedProduct, ...prev];
    });

    // Update cart item product reference if matching
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === updatedProduct.id
          ? { ...item, product: updatedProduct }
          : item
      )
    );

    if (selectedProductDetail?.id === updatedProduct.id) {
      setSelectedProductDetail(updatedProduct);
    }

    // Persist to Cloud Database (Firestore)
    dbSaveProduct(updatedProduct).catch(console.error);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    setCartItems((prev) => prev.filter((i) => i.product.id !== productId));
    setFavorites((prev) => prev.filter((id) => id !== productId));
    if (selectedProductDetail?.id === productId) {
      setSelectedProductDetail(null);
    }

    // Persist to Cloud Database (Firestore)
    dbDeleteProduct(productId).catch(console.error);
  };

  const handleToggleProductAvailability = (productId: string) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const updated = { ...target, isAvailable: target.isAvailable === false ? true : false };
    
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? updated : p))
    );

    // Persist to Cloud Database (Firestore)
    dbSaveProduct(updated).catch(console.error);
  };

  const handleDuplicateProduct = (product: GeladinhoProduct) => {
    const cloned: GeladinhoProduct = {
      ...product,
      id: `${product.id}-copia-${Date.now()}`,
      name: `${product.name} (Cópia)`,
      badges: product.badges.includes('Novidade') ? product.badges : [...product.badges, 'Novidade'],
    };
    setProducts((prev) => [cloned, ...prev]);

    // Persist to Cloud Database (Firestore)
    dbSaveProduct(cloned).catch(console.error);
  };

  const handleSaveCombo = (updatedCombo: PromoCombo) => {
    setCombos((prev) => {
      const idx = prev.findIndex((c) => c.id === updatedCombo.id);
      if (idx > -1) {
        const next = [...prev];
        next[idx] = updatedCombo;
        return next;
      }
      return [updatedCombo, ...prev];
    });

    setCartCombos((prev) =>
      prev.map((item) =>
        item.combo.id === updatedCombo.id
          ? { ...item, combo: updatedCombo }
          : item
      )
    );

    // Persist to Cloud Database (Firestore)
    dbSaveCombo(updatedCombo).catch(console.error);
  };

  const handleQuickUpdatePrice = (productId: string, newPrice: number) => {
    const validPrice = Math.max(0.5, Math.round(newPrice * 100) / 100);
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    const updated = { ...target, price: validPrice };

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? updated : p))
    );
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId
          ? { ...item, product: { ...item.product, price: validPrice } }
          : item
      )
    );
    if (selectedProductDetail?.id === productId) {
      setSelectedProductDetail((prev) => (prev ? { ...prev, price: validPrice } : null));
    }

    // Persist to Cloud Database (Firestore)
    dbSaveProduct(updated).catch(console.error);
  };

  const handleQuickUpdateComboPrice = (comboId: string, newPrice: number) => {
    const validPrice = Math.max(1, Math.round(newPrice * 100) / 100);
    const target = combos.find((c) => c.id === comboId);
    if (!target) return;
    const updated = { ...target, price: validPrice };

    setCombos((prev) =>
      prev.map((c) => (c.id === comboId ? updated : c))
    );
    setCartCombos((prev) =>
      prev.map((item) =>
        item.combo.id === comboId
          ? { ...item, combo: { ...item.combo, price: validPrice } }
          : item
      )
    );

    // Persist to Cloud Database (Firestore)
    dbSaveCombo(updated).catch(console.error);
  };

  const handleDeleteCombo = (comboId: string) => {
    setCombos((prev) => prev.filter((c) => c.id !== comboId));
    setCartCombos((prev) => prev.filter((item) => item.combo.id !== comboId));

    // Persist to Cloud Database (Firestore)
    dbDeleteCombo(comboId).catch(console.error);
  };

  const handleDuplicateCombo = (combo: PromoCombo) => {
    const cloned: PromoCombo = {
      ...combo,
      id: `${combo.id}-copia-${Date.now()}`,
      title: `${combo.title} (Cópia)`,
    };
    setCombos((prev) => [cloned, ...prev]);

    // Persist to Cloud Database (Firestore)
    dbSaveCombo(cloned).catch(console.error);
  };

  const handleSaveCategory = (cat: CategoryItem) => {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === cat.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = cat;
        return updated;
      }
      return [...prev, cat];
    });

    // Persist to Cloud Database (Firestore)
    dbSaveCategory(cat).catch(console.error);
  };

  const handleDeleteCategory = (categoryId: string, reassignTo?: string) => {
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    if (reassignTo) {
      setProducts((prev) => {
        const reassigned = prev.map((p) => (p.category === categoryId ? { ...p, category: reassignTo } : p));
        dbBatchSaveProducts(reassigned).catch(console.error);
        return reassigned;
      });
    }
    if (activeCategory === categoryId) {
      setActiveCategory('todos');
    }

    // Persist to Cloud Database (Firestore)
    dbDeleteCategory(categoryId).catch(console.error);
  };

  const handleReorderCategories = (newCategories: CategoryItem[]) => {
    setCategories(newCategories);
    newCategories.forEach((c) => dbSaveCategory(c).catch(console.error));
  };

  const handleResetCatalogDefaults = () => {
    setProducts(PRODUCTS_DATA);
    setCombos(PROMO_COMBOS_DATA);
    setCategories(DEFAULT_CATEGORIES_DATA);
    setNeighborhoods(DEFAULT_NEIGHBORHOODS_DATA);
    try {
      localStorage.setItem('naturalis_catalog_version', OFFICIAL_CATALOG_VERSION);
      localStorage.setItem('geladinhos_products', JSON.stringify(PRODUCTS_DATA));
      localStorage.setItem('geladinhos_combos', JSON.stringify(PROMO_COMBOS_DATA));
      localStorage.setItem('geladinhos_categories', JSON.stringify(DEFAULT_CATEGORIES_DATA));
      localStorage.setItem('geladinhos_neighborhoods', JSON.stringify(DEFAULT_NEIGHBORHOODS_DATA));
    } catch {}

    // Synchronize to Firestore
    dbBatchSaveProducts(PRODUCTS_DATA).catch(console.error);
    dbBatchSaveCombos(PROMO_COMBOS_DATA).catch(console.error);
    DEFAULT_CATEGORIES_DATA.forEach((c) => dbSaveCategory(c).catch(console.error));
    dbBatchSaveNeighborhoods(DEFAULT_NEIGHBORHOODS_DATA).catch(console.error);
  };

  const handleImportCatalog = (data: { products: GeladinhoProduct[]; combos: PromoCombo[]; categories?: CategoryItem[] }) => {
    if (Array.isArray(data.products) && data.products.length > 0) {
      setProducts(data.products);
      dbBatchSaveProducts(data.products).catch(console.error);
    }
    if (Array.isArray(data.combos) && data.combos.length > 0) {
      setCombos(data.combos);
      dbBatchSaveCombos(data.combos).catch(console.error);
    }
    if (Array.isArray(data.categories) && data.categories.length > 0) {
      setCategories(data.categories);
      data.categories.forEach((c) => dbSaveCategory(c).catch(console.error));
    }
  };

  // Neighborhoods CRUD & Management Handlers
  const handleSaveNeighborhood = (savedNeighborhood: NeighborhoodFee) => {
    setNeighborhoods((prev) => {
      const targetId = savedNeighborhood.id?.trim();
      const targetName = savedNeighborhood.name.trim().toLowerCase();

      const idx = prev.findIndex((n) => {
        if (targetId && n.id && n.id === targetId) return true;
        if (n.name && n.name.trim().toLowerCase() === targetName) return true;
        return false;
      });

      if (idx > -1) {
        const next = [...prev];
        next[idx] = { ...prev[idx], ...savedNeighborhood };
        return next;
      }
      return [savedNeighborhood, ...prev];
    });

    // Persist to Cloud Database (Firestore)
    dbSaveNeighborhood(savedNeighborhood).catch(console.error);
  };

  const handleDeleteNeighborhood = (neighborhoodId: string) => {
    setNeighborhoods((prev) =>
      prev.filter((n) => n.id !== neighborhoodId && n.name !== neighborhoodId && (n.id || n.name) !== neighborhoodId)
    );

    // Persist to Cloud Database (Firestore)
    dbDeleteNeighborhood(neighborhoodId).catch(console.error);
  };

  const handleDuplicateNeighborhood = (neighborhood: NeighborhoodFee) => {
    const cloned: NeighborhoodFee = {
      ...neighborhood,
      id: `bairro-${Date.now()}`,
      name: `${neighborhood.name} (Cópia)`,
    };
    setNeighborhoods((prev) => [cloned, ...prev]);

    // Persist to Cloud Database (Firestore)
    dbSaveNeighborhood(cloned).catch(console.error);
  };

  const handleToggleNeighborhoodStatus = (neighborhoodId: string) => {
    let updatedItem: NeighborhoodFee | null = null;

    setNeighborhoods((prev) =>
      prev.map((n) => {
        if (n.id === neighborhoodId || n.name === neighborhoodId || (n.id || n.name) === neighborhoodId) {
          const updated = { ...n, isActive: n.isActive === false ? true : false };
          updatedItem = updated;
          return updated;
        }
        return n;
      })
    );

    if (updatedItem) {
      dbSaveNeighborhood(updatedItem).catch(console.error);
    }
  };

  const handleQuickUpdateNeighborhoodFee = (neighborhoodId: string, newFee: number) => {
    let updatedItem: NeighborhoodFee | null = null;
    const finalFee = Math.max(0, Number(newFee.toFixed(2)));

    setNeighborhoods((prev) =>
      prev.map((n) => {
        if (n.id === neighborhoodId || n.name === neighborhoodId || (n.id || n.name) === neighborhoodId) {
          const updated = { ...n, fee: finalFee };
          updatedItem = updated;
          return updated;
        }
        return n;
      })
    );

    if (updatedItem) {
      dbSaveNeighborhood(updatedItem).catch(console.error);
    }
  };

  const handleBulkUpdateNeighborhoodFees = (amount: number, isFixed = false) => {
    const updatedList = neighborhoods.map((n) => ({
      ...n,
      fee: isFixed ? Math.max(0, amount) : Math.max(0, Number((n.fee + amount).toFixed(2))),
    }));

    setNeighborhoods(updatedList);
    dbBatchSaveNeighborhoods(updatedList).catch(console.error);
  };

  const handleResetNeighborhoodDefaults = () => {
    setNeighborhoods(DEFAULT_NEIGHBORHOODS_DATA);
    localStorage.removeItem('geladinhos_neighborhoods');
    dbBatchSaveNeighborhoods(DEFAULT_NEIGHBORHOODS_DATA).catch(console.error);
  };

  const handleImportNeighborhoods = (data: NeighborhoodFee[]) => {
    if (Array.isArray(data) && data.length > 0) {
      setNeighborhoods(data);
      dbBatchSaveNeighborhoods(data).catch(console.error);
    }
  };

  const handleConfirmCustomCombo = (
    combo: PromoCombo,
    selectedFlavors: { product: GeladinhoProduct; quantity: number }[]
  ) => {
    const validFlavors = (selectedFlavors || []).filter((f) => f && f.product);
    setCartCombos((prev) => [...prev, { combo, quantity: 1, selectedFlavors: validFlavors }]);
    setIsCartOpen(true);
  };

  const handleRemoveCombo = (index: number) => {
    setCartCombos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearCart = () => {
    setCartItems([]);
    setCartCombos([]);
  };

  // Favorites toggle
  const handleToggleFavorite = (productId: string) => {
    setFavorites((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  // Navigation scroll helpers
  const handleScrollToCatalog = () => {
    document.getElementById('secao-catalogo')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleScrollToCombos = () => {
    document.getElementById('secao-combos')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Stock quick adjustment handlers
  const handleQuickUpdateStock = (
    productId: string, 
    newStock: number, 
    reason: 'manual_adjustment' | 'restock' | 'order' | 'batch_restock' = 'manual_adjustment'
  ) => {
    const clampedStock = Math.max(0, newStock);
    const target = products.find((p) => p.id === productId);
    if (!target) return;

    const previousStock = target.stockQuantity ?? 0;
    const diff = clampedStock - previousStock;
    if (diff === 0) return;

    const movement: StockMovement = {
      id: `mov-${Date.now()}-${productId}`,
      productId,
      productName: target.name,
      quantityChanged: diff,
      previousStock,
      newStock: clampedStock,
      reason,
      timestamp: new Date().toISOString(),
    };

    const updatedProduct = {
      ...target,
      stockQuantity: clampedStock,
      isAvailable: clampedStock > 0,
    };

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? updatedProduct : p
      )
    );

    setStockMovements((prev) => [movement, ...prev].slice(0, 100));

    // Persist to Cloud Database (Firestore)
    dbSaveProduct(updatedProduct).catch(console.error);
    dbAddStockMovement(movement).catch(console.error);
  };

  const handleBatchRestock = (delta: number) => {
    if (delta === 0) return;
    const newMovements: StockMovement[] = [];
    const timestamp = new Date().toISOString();

    const updatedList = products.map((p) => {
      if (p.trackStock === false) return p;
      const previousStock = p.stockQuantity ?? 0;
      const newStock = Math.max(0, previousStock + delta);
      newMovements.push({
        id: `mov-${Date.now()}-${p.id}`,
        productId: p.id,
        productName: p.name,
        quantityChanged: delta,
        previousStock,
        newStock,
        reason: 'batch_restock',
        timestamp,
      });
      return {
        ...p,
        stockQuantity: newStock,
        isAvailable: newStock > 0,
      };
    });

    setProducts(updatedList);

    if (newMovements.length > 0) {
      setStockMovements((prev) => [...newMovements, ...prev].slice(0, 100));
      newMovements.forEach((m) => dbAddStockMovement(m).catch(console.error));
    }

    dbBatchSaveProducts(updatedList).catch(console.error);
  };

  const handleClearStockMovements = () => {
    setStockMovements([]);
    localStorage.removeItem('geladinhos_stock_movements');
  };

  // Checkout flows
  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOpenThermalReceiptModal = (order?: OrderRecord) => {
    if (order) {
      setSelectedThermalOrder(order);
    } else if (lastOrderSummary) {
      // Build order from last summary
      const orderFromLast: OrderRecord = {
        id: lastOrderSummary.orderId || `ord-${Date.now()}`,
        orderId: lastOrderSummary.orderId || '0000',
        createdAt: new Date().toISOString(),
        subtotal: lastOrderSummary.subtotal || 0,
        deliveryFee: lastOrderSummary.deliveryFee || 0,
        discount: lastOrderSummary.discount || 0,
        total: lastOrderSummary.total || 0,
        customer: lastOrderSummary.customer,
        items: lastOrderSummary.items || [],
        combos: lastOrderSummary.combos || [],
        storeSettings: lastOrderSummary.storeSettings || storeSettings,
        rawMessage: lastRawMessage,
      };
      setSelectedThermalOrder(orderFromLast);
    } else if (ordersHistory.length > 0) {
      setSelectedThermalOrder(ordersHistory[0]);
    } else {
      setSelectedThermalOrder({
        id: 'order-demo-fallback',
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
            product: products[0] || {
              id: 'ninho-nutella',
              name: 'Ninho com Nutella Pura',
              category: 'chocolatudos',
              price: 9.50,
              image: '',
              badges: ['Mais Vendido'],
              rating: 5.0,
              reviewsCount: 140,
              isAvailable: true,
              volumeMl: 150,
            },
            quantity: 2,
          },
        ],
        combos: [],
        storeSettings,
      });
    }
    setIsThermalPrintOpen(true);
  };

  // Security & Admin Action Access Guard
  const requestAdminAction = (action: 'menu' | 'orders' | 'settings' | 'thermal' | 'neighborhoods') => {
    if (isAdminAuthenticated) {
      if (action === 'menu') setIsMenuManagerOpen(true);
      else if (action === 'orders') setIsOrderManagerOpen(true);
      else if (action === 'settings') setIsSettingsOpen(true);
      else if (action === 'thermal') handleOpenThermalReceiptModal();
      else if (action === 'neighborhoods') setIsNeighborhoodManagerOpen(true);
    } else {
      setPendingAdminAction(action);
      setIsAdminAuthModalOpen(true);
    }
  };

  const handleAdminAuthSuccess = () => {
    setIsAdminAuthenticated(true);
    try {
      localStorage.setItem('geladinhos_admin_auth', 'true');
    } catch {}
    setIsAdminAuthModalOpen(false);
    if (pendingAdminAction) {
      const action = pendingAdminAction;
      setPendingAdminAction(null);
      if (action === 'menu') setIsMenuManagerOpen(true);
      else if (action === 'orders') setIsOrderManagerOpen(true);
      else if (action === 'settings') setIsSettingsOpen(true);
      else if (action === 'thermal') handleOpenThermalReceiptModal();
      else if (action === 'neighborhoods') setIsNeighborhoodManagerOpen(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    try {
      localStorage.removeItem('geladinhos_admin_auth');
    } catch {}
    setIsMenuManagerOpen(false);
    setIsNeighborhoodManagerOpen(false);
    setIsOrderManagerOpen(false);
    setIsSettingsOpen(false);
    setIsThermalPrintOpen(false);
  };

  const handleOrderCompleted = (summaryData: any, whatsappUrl: string, rawMessage: string) => {
    // 1. Calculate automatic stock deduction for each product
    const deductions: Record<string, number> = {};

    // Individual items deduction
    if (summaryData.items && Array.isArray(summaryData.items)) {
      summaryData.items.forEach((item: CartItem) => {
        if (item.product?.id) {
          deductions[item.product.id] = (deductions[item.product.id] || 0) + item.quantity;
        }
      });
    }

    // Combos included flavors deduction
    if (summaryData.combos && Array.isArray(summaryData.combos)) {
      summaryData.combos.forEach((cItem: CartComboItem) => {
        if (cItem.selectedFlavors && Array.isArray(cItem.selectedFlavors)) {
          cItem.selectedFlavors.forEach((sf) => {
            if (sf.product?.id) {
              deductions[sf.product.id] = (deductions[sf.product.id] || 0) + (sf.quantity * cItem.quantity);
            }
          });
        }
      });
    }

    // 2. Decrement stock in state and generate movement logs
    const newMovements: StockMovement[] = [];
    const deductionSummaryList: { productName: string; quantityDeducted: number; remainingStock: number }[] = [];
    const nowIso = new Date().toISOString();

    const updatedProducts = products.map((p) => {
      const qtyToDeduct = deductions[p.id] || 0;
      if (qtyToDeduct > 0 && p.trackStock !== false) {
        const currentStock = p.stockQuantity ?? 0;
        const newStock = Math.max(0, currentStock - qtyToDeduct);
        
        newMovements.push({
          id: `mov-${Date.now()}-${p.id}`,
          productId: p.id,
          productName: p.name,
          quantityChanged: -qtyToDeduct,
          previousStock: currentStock,
          newStock,
          reason: 'order',
          orderId: summaryData.orderId,
          timestamp: nowIso,
        });

        deductionSummaryList.push({
          productName: p.name,
          quantityDeducted: qtyToDeduct,
          remainingStock: newStock,
        });

        return {
          ...p,
          stockQuantity: newStock,
          isAvailable: newStock > 0,
        };
      }
      return p;
    });

    setProducts(updatedProducts);

    if (newMovements.length > 0) {
      setStockMovements((prev) => [...newMovements, ...prev].slice(0, 100));
      newMovements.forEach((m) => dbAddStockMovement(m).catch(console.error));
      dbBatchSaveProducts(updatedProducts).catch(console.error);
    }

    // Attach deduction summary to summaryData
    const enhancedSummary = {
      ...summaryData,
      stockDeductions: deductionSummaryList,
    };

    setLastOrderSummary(enhancedSummary);
    setLastWhatsappUrl(whatsappUrl);
    setLastRawMessage(rawMessage);
    setIsCheckoutOpen(false);
    setIsSuccessOpen(true);

    const newOrderRecord: OrderRecord = {
      id: `ord-${Date.now()}`,
      orderId: summaryData.orderId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'recebido',
      paymentStatus: 'pendente',
      subtotal: summaryData.subtotal,
      deliveryFee: summaryData.deliveryFee,
      discount: summaryData.discount,
      total: summaryData.total,
      customer: summaryData.customer,
      items: summaryData.items,
      combos: summaryData.combos,
      storeSettings: summaryData.storeSettings || storeSettings,
      rawMessage: rawMessage,
      timeline: [
        {
          status: 'recebido',
          timestamp: new Date().toISOString(),
          note: 'Pedido recebido pelo cardápio online',
        },
      ],
    };

    setOrdersHistory((prev) => [newOrderRecord, ...prev.filter((o) => o.orderId !== newOrderRecord.orderId).slice(0, 49)]);
    setSelectedThermalOrder(newOrderRecord);

    // Persist new order in Cloud Database (Firestore)
    dbSaveOrder(newOrderRecord).catch(console.error);

    // Auto open print if enabled
    if (storeSettings.thermalAutoOpenPrint) {
      setIsThermalPrintOpen(true);
    }

    // Open WhatsApp in new tab automatically
    try {
      window.open(whatsappUrl, '_blank');
    } catch {
      // Fallback handled in modal
    }

    // Clear cart
    handleClearCart();
  };

  const handleNewOrder = () => {
    setIsSuccessOpen(false);
    handleScrollToCatalog();
  };

  // Order Management handlers
  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus, note?: string) => {
    let updatedOrder: OrderRecord | null = null;

    setOrdersHistory((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId) {
          const currentTimeline = o.timeline || [
            { status: o.status || 'recebido', timestamp: o.createdAt }
          ];
          const updated = {
            ...o,
            status: newStatus,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...currentTimeline,
              { status: newStatus, timestamp: new Date().toISOString(), note }
            ]
          };
          updatedOrder = updated;
          return updated;
        }
        return o;
      })
    );

    if (updatedOrder) {
      dbSaveOrder(updatedOrder).catch(console.error);
    }
  };

  const handleUpdatePaymentStatus = (orderId: string, newPaymentStatus: PaymentStatus) => {
    let updatedOrder: OrderRecord | null = null;

    setOrdersHistory((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId) {
          const updated = { ...o, paymentStatus: newPaymentStatus, updatedAt: new Date().toISOString() };
          updatedOrder = updated;
          return updated;
        }
        return o;
      })
    );

    if (updatedOrder) {
      dbSaveOrder(updatedOrder).catch(console.error);
    }
  };

  const handleUpdateOrderDetails = (orderId: string, updates: Partial<OrderRecord>) => {
    let updatedOrder: OrderRecord | null = null;

    setOrdersHistory((prev) =>
      prev.map((o) => {
        if (o.orderId === orderId) {
          const updated = { ...o, ...updates, updatedAt: new Date().toISOString() };
          updatedOrder = updated;
          return updated;
        }
        return o;
      })
    );

    if (updatedOrder) {
      dbSaveOrder(updatedOrder).catch(console.error);
    }
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrdersHistory((prev) => prev.filter((o) => o.orderId !== orderId));
    deleteDoc(doc(db, ORDERS_COLLECTION, orderId)).catch(console.error);
  };

  const handleCreateManualOrder = (newOrder: OrderRecord) => {
    setOrdersHistory((prev) => [newOrder, ...prev]);
    dbSaveOrder(newOrder).catch(console.error);

    // Deduct stock for manual items if applicable
    if (newOrder.items && newOrder.items.length > 0) {
      newOrder.items.forEach((item) => {
        const product = products.find((p) => p.id === item.product.id);
        if (product && product.trackStock !== false) {
          const currentStock = product.stockQuantity ?? 0;
          const nextStock = Math.max(0, currentStock - item.quantity);
          handleQuickUpdateStock(product.id, nextStock, 'order');
        }
      });
    }
  };

  // Active orders count for badge
  const activeOrdersCount = useMemo(() => {
    return ordersHistory.filter((o) => {
      const s = o.status || 'recebido';
      return s === 'recebido' || s === 'em_preparo' || s === 'saiu_entrega' || s === 'pronto_retirada';
    }).length;
  }, [ordersHistory]);

  const handleSaveStoreSettings = (newSettings: StoreSettings) => {
    setStoreSettings(newSettings);
    dbSaveStoreSettings(newSettings).catch(console.error);
  };

  const handleToggleDelivery = () => {
    const nextSettings = {
      ...storeSettings,
      deliveryEnabled: storeSettings.deliveryEnabled === false ? true : false,
    };
    setStoreSettings(nextSettings);
    dbSaveStoreSettings(nextSettings).catch(console.error);
  };

  return (
    <div className="min-h-screen flex flex-col bg-stone-50/50 text-stone-900 font-sans antialiased selection:bg-rose-500 selection:text-white">
      {/* Admin Mode Floating Top Bar (Visible only when Admin is logged in) */}
      {isAdminAuthenticated && (
        <AdminBar
          storeSettings={storeSettings}
          activeOrdersCount={activeOrdersCount}
          isCloudSynced={isCloudSynced}
          onOpenOrders={() => setIsOrderManagerOpen(true)}
          onOpenMenu={() => setIsMenuManagerOpen(true)}
          onOpenNeighborhoods={() => setIsNeighborhoodManagerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenThermal={() => handleOpenThermalReceiptModal()}
          onToggleDelivery={handleToggleDelivery}
          onLogout={handleAdminLogout}
        />
      )}

      {/* Header (Customer Focused by default) */}
      <Header
        storeSettings={storeSettings}
        cartCount={totalCartCount}
        cartTotal={totalCartValue}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenQuiz={() => setIsQuizOpen(true)}
        onOpenSettings={() => requestAdminAction('settings')}
        onOpenAdminAuth={() => requestAdminAction('settings')}
        onOpenAdminPanel={() => setIsOrderManagerOpen(true)}
      />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Banner with Rotating Carousel */}
        <HeroBanner
          storeSettings={storeSettings}
          products={products}
          onAddToCart={handleAddToCart}
          onOpenProductDetails={setSelectedProductDetail}
          onScrollToCatalog={handleScrollToCatalog}
          onScrollToCombos={handleScrollToCombos}
          onOpenQuiz={() => setIsQuizOpen(true)}
        />

        {/* Promo Combos Section */}
        <PromoCombos
          combos={combos}
          onSelectCombo={handleSelectCombo}
        />

        {/* Categories & Filter controls */}
        <CategoryFilter
          categories={categories}
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedTag={selectedTag}
          onSelectTag={setSelectedTag}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categoryCounts={categoryCounts}
          totalResultsCount={filteredProducts.length}
        />

        {/* Products Flavors Grid */}
        <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-12">
          {filteredProducts.length === 0 ? (
            <div className="py-16 text-center bg-white rounded-3xl border border-stone-200/80 p-8 shadow-xs">
              <div className="text-4xl mb-3">🔍</div>
              <h3 className="font-extrabold text-xl text-stone-900 tracking-tight">
                Nenhum sabor encontrado
              </h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1 mb-4 font-normal">
                Tente buscar com outros termos ou limpe os filtros para ver todas as opções disponíveis.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedTag(null);
                    setActiveCategory('todos');
                  }}
                  className="px-5 py-2.5 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors cursor-pointer shadow-xs"
                >
                  Limpar Filtros
                </button>
                {isAdminAuthenticated && (
                  <button
                    onClick={() => setIsMenuManagerOpen(true)}
                    className="px-5 py-2.5 bg-rose-500 text-white rounded-xl text-xs font-bold hover:bg-rose-600 transition-colors cursor-pointer shadow-xs"
                  >
                    Adicionar Novo Sabor (Admin)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredProducts.map((product) => {
                const itemInCart = cartItems.find((i) => i.product.id === product.id);
                const quantityInCart = itemInCart ? itemInCart.quantity : 0;
                const isFav = favorites.includes(product.id);

                return (
                  <FlavorCard
                    key={product.id}
                    product={product}
                    quantityInCart={quantityInCart}
                    onAddToCart={handleAddToCart}
                    onUpdateQuantity={handleUpdateItemQuantity}
                    onOpenDetails={setSelectedProductDetail}
                    isFavorite={isFav}
                    onToggleFavorite={handleToggleFavorite}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* Testimonials & FAQs */}
        <TestimonialsAndFaq
          products={products}
          storeSettings={storeSettings}
          isAdminAuthenticated={isAdminAuthenticated}
        />
      </main>

      {/* Footer (Customer Focused + Discreet Admin Entrance) */}
      <Footer
        storeSettings={storeSettings}
        isAdminAuthenticated={isAdminAuthenticated}
        onOpenAdminAuth={() => requestAdminAction('orders')}
        onOpenAdminPanel={() => setIsOrderManagerOpen(true)}
      />

      {/* Floating Mobile Cart Action Button */}
      <FloatingCartButton
        cartCount={totalCartCount}
        cartTotal={totalCartValue}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Modals & Overlays */}
      <OrderManagerModal
        isOpen={isOrderManagerOpen}
        onClose={() => setIsOrderManagerOpen(false)}
        orders={ordersHistory}
        products={products}
        combos={combos}
        storeSettings={storeSettings}
        onUpdateOrderStatus={handleUpdateOrderStatus}
        onUpdatePaymentStatus={handleUpdatePaymentStatus}
        onUpdateOrderDetails={handleUpdateOrderDetails}
        onDeleteOrder={handleDeleteOrder}
        onCreateManualOrder={handleCreateManualOrder}
        onPrintReceipt={(order) => {
          setSelectedThermalOrder(order);
          setIsThermalPrintOpen(true);
        }}
      />

      <MenuManagerModal
        isOpen={isMenuManagerOpen}
        onClose={() => setIsMenuManagerOpen(false)}
        products={products}
        combos={combos}
        categories={categories}
        stockMovements={stockMovements}
        onSaveProduct={handleSaveProduct}
        onDeleteProduct={handleDeleteProduct}
        onToggleProductAvailability={handleToggleProductAvailability}
        onDuplicateProduct={handleDuplicateProduct}
        onQuickUpdateStock={handleQuickUpdateStock}
        onQuickUpdatePrice={handleQuickUpdatePrice}
        onQuickUpdateComboPrice={handleQuickUpdateComboPrice}
        onBatchRestock={handleBatchRestock}
        onClearStockMovements={handleClearStockMovements}
        onSaveCombo={handleSaveCombo}
        onDeleteCombo={handleDeleteCombo}
        onDuplicateCombo={handleDuplicateCombo}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        onReorderCategories={handleReorderCategories}
        onOpenNeighborhoods={() => requestAdminAction('neighborhoods')}
        onResetToDefaults={handleResetCatalogDefaults}
        onImportCatalog={handleImportCatalog}
      />

      <ProductDetailModal
        product={selectedProductDetail}
        onClose={() => setSelectedProductDetail(null)}
        onAddToCart={handleAddToCart}
        isFavorite={selectedProductDetail ? favorites.includes(selectedProductDetail.id) : false}
        onToggleFavorite={handleToggleFavorite}
      />

      <ComboCustomizerModal
        combo={customizingCombo}
        allProducts={products}
        onClose={() => setCustomizingCombo(null)}
        onConfirmCombo={handleConfirmCustomCombo}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        combos={cartCombos}
        storeSettings={storeSettings}
        onUpdateItemQuantity={handleUpdateItemQuantity}
        onRemoveItem={handleRemoveItem}
        onRemoveCombo={handleRemoveCombo}
        onProceedToCheckout={handleProceedToCheckout}
        onClearCart={handleClearCart}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        items={cartItems}
        combos={cartCombos}
        storeSettings={storeSettings}
        neighborhoods={neighborhoods}
        onOrderCompleted={handleOrderCompleted}
      />

      <WhatsAppSuccessModal
        isOpen={isSuccessOpen}
        onClose={() => setIsSuccessOpen(false)}
        orderSummary={lastOrderSummary}
        whatsappUrl={lastWhatsappUrl}
        rawMessage={lastRawMessage}
        storeSettings={storeSettings}
        onNewOrder={handleNewOrder}
        onOpenThermalPrint={() => handleOpenThermalReceiptModal()}
      />

      <StoreSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={storeSettings}
        onSaveSettings={handleSaveStoreSettings}
        onOpenNeighborhoods={() => requestAdminAction('neighborhoods')}
        onLogoutAdmin={handleAdminLogout}
      />

      <NeighborhoodManagerModal
        isOpen={isNeighborhoodManagerOpen}
        onClose={() => setIsNeighborhoodManagerOpen(false)}
        neighborhoods={neighborhoods}
        onSaveNeighborhood={handleSaveNeighborhood}
        onDeleteNeighborhood={handleDeleteNeighborhood}
        onDuplicateNeighborhood={handleDuplicateNeighborhood}
        onToggleNeighborhoodStatus={handleToggleNeighborhoodStatus}
        onQuickUpdateFee={handleQuickUpdateNeighborhoodFee}
        onBulkUpdateFees={handleBulkUpdateNeighborhoodFees}
        onResetToDefaults={handleResetNeighborhoodDefaults}
        onImportNeighborhoods={handleImportNeighborhoods}
      />

      <FlavorQuizModal
        isOpen={isQuizOpen}
        onClose={() => setIsQuizOpen(false)}
        allProducts={products}
        onAddToCart={handleAddToCart}
      />

      {/* Thermal Receipt 80mm Modal */}
      <ThermalReceiptModal
        isOpen={isThermalPrintOpen}
        onClose={() => setIsThermalPrintOpen(false)}
        order={selectedThermalOrder}
        storeSettings={storeSettings}
        pastOrders={ordersHistory}
        onSelectOrder={(ord) => setSelectedThermalOrder(ord)}
      />

      {/* Admin PIN Authentication Modal */}
      <AdminAuthModal
        isOpen={isAdminAuthModalOpen}
        onClose={() => {
          setIsAdminAuthModalOpen(false);
          setPendingAdminAction(null);
        }}
        onSuccess={handleAdminAuthSuccess}
        currentPin={storeSettings.adminPin || '1234'}
      />
    </div>
  );
}

