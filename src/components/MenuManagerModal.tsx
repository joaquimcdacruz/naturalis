import React, { useState, useMemo } from 'react';
import { 
  X, Plus, Edit2, Trash2, Copy, Check, Search, Sparkles, 
  RotateCcw, Package, AlertCircle, Eye, EyeOff, Tag, Image as ImageIcon,
  DollarSign, ArrowUpDown, Filter, BarChart3, Download, Upload, CheckCircle2,
  Boxes, TrendingDown, Minus, History, Layers, ArrowUp, ArrowDown, FolderTree,
  Palette, Info, MapPin
} from 'lucide-react';
import { GeladinhoProduct, PromoCombo, ProductCategory, StockMovement, CategoryItem } from '../types';
import { DEFAULT_CATEGORIES_DATA, CATEGORIES_DATA, PRODUCTS_DATA, PROMO_COMBOS_DATA } from '../data/products';
import { formatCurrency } from '../utils/whatsapp';

interface MenuManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: GeladinhoProduct[];
  combos: PromoCombo[];
  categories?: CategoryItem[];
  stockMovements?: StockMovement[];
  onSaveProduct: (product: GeladinhoProduct) => void;
  onDeleteProduct: (productId: string) => void;
  onToggleProductAvailability: (productId: string) => void;
  onDuplicateProduct: (product: GeladinhoProduct) => void;
  onQuickUpdateStock?: (productId: string, newStock: number, reason?: 'manual_adjustment' | 'restock') => void;
  onQuickUpdatePrice?: (productId: string, newPrice: number) => void;
  onQuickUpdateComboPrice?: (comboId: string, newPrice: number) => void;
  onBatchRestock?: (delta: number) => void;
  onClearStockMovements?: () => void;
  onSaveCombo: (combo: PromoCombo) => void;
  onDeleteCombo: (comboId: string) => void;
  onDuplicateCombo: (combo: PromoCombo) => void;
  onSaveCategory?: (category: CategoryItem) => void;
  onDeleteCategory?: (categoryId: string, reassignTo?: string) => void;
  onReorderCategories?: (categories: CategoryItem[]) => void;
  onOpenNeighborhoods?: () => void;
  onResetToDefaults: () => void;
  onImportCatalog: (data: { products: GeladinhoProduct[]; combos: PromoCombo[]; categories?: CategoryItem[] }) => void;
}

const PRESET_CATEGORY_ICONS = [
  '🍓', '🍫', '🥛', '👑', '🌿', '🍸', '🍍', '🍪', '🥥', '⭐', '🍦', '🍋', '🍇', '🥭', '🍰', '🍉', '🥜', '☕', '🧁', '🍯'
];

const PRESET_CATEGORY_COLORS = [
  { label: 'Rosa Frutas', value: 'from-rose-500 to-pink-500', bg: 'bg-rose-500' },
  { label: 'Chocolate', value: 'from-amber-800 to-amber-950', bg: 'bg-amber-900' },
  { label: 'Dourado Gourmet', value: 'from-amber-600 to-yellow-500', bg: 'bg-amber-500' },
  { label: 'Laranja Cremoso', value: 'from-amber-400 to-orange-400', bg: 'bg-orange-400' },
  { label: 'Verde Fit & Zero', value: 'from-emerald-500 to-teal-600', bg: 'bg-emerald-500' },
  { label: 'Roxo Alcoólicos', value: 'from-purple-600 to-indigo-600', bg: 'bg-purple-600' },
  { label: 'Azul Tropical', value: 'from-blue-500 to-cyan-500', bg: 'bg-blue-500' },
  { label: 'Vermelho Paixão', value: 'from-red-500 to-rose-600', bg: 'bg-red-500' },
];

const PRESET_IMAGES = [
  { label: 'Ninho & Nutella', url: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=80' },
  { label: 'Morango Artesanal', url: 'https://images.unsplash.com/photo-1488900128323-21503983a07e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Maracujá & Chocolate', url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=600&q=80' },
  { label: 'Oreo & Cookies', url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80' },
  { label: 'Pistache Nobre', url: 'https://images.unsplash.com/photo-1570197788417-0e82375c9371?auto=format&fit=crop&w=600&q=80' },
  { label: 'Paçoca & Amendoim', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80' },
  { label: 'Coco & Brigadeiro', url: 'https://images.unsplash.com/photo-1588685858607-e818b2c453c7?auto=format&fit=crop&w=600&q=80' },
  { label: 'Manga & Frutas Tropicais', url: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=600&q=80' },
  { label: 'Torta de Limão', url: 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=600&q=80' },
  { label: 'Açaí com Banana', url: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?auto=format&fit=crop&w=600&q=80' },
  { label: 'Kit Especial / Degustação', url: 'https://images.unsplash.com/photo-1505394033641-40c6ad1178d7?auto=format&fit=crop&w=600&q=80' },
  { label: 'Caixa de Presente', url: 'https://images.unsplash.com/photo-1549488344-cbb6c34cf08b?auto=format&fit=crop&w=600&q=80' },
];

const SUGGESTED_BADGES = [
  'Mais Vendido',
  'Nutella Pura',
  'Zero Açúcar',
  'Fruta de Verdade',
  'Edição Especial',
  'Destaque Chef',
  'Crocante',
  'Sem Lactose',
  'Contém Álcool',
  'Novidade'
];

export const MenuManagerModal: React.FC<MenuManagerModalProps> = ({
  isOpen,
  onClose,
  products,
  combos,
  categories = DEFAULT_CATEGORIES_DATA,
  stockMovements = [],
  onSaveProduct,
  onDeleteProduct,
  onToggleProductAvailability,
  onDuplicateProduct,
  onQuickUpdateStock,
  onQuickUpdatePrice,
  onQuickUpdateComboPrice,
  onBatchRestock,
  onClearStockMovements,
  onSaveCombo,
  onDeleteCombo,
  onDuplicateCombo,
  onSaveCategory,
  onDeleteCategory,
  onReorderCategories,
  onOpenNeighborhoods,
  onResetToDefaults,
  onImportCatalog,
}) => {
  const [activeTab, setActiveTab] = useState<'sabores' | 'categorias' | 'combos' | 'estoque' | 'metricas' | 'backup'>('sabores');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('todos');
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'soldout'>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out' | 'normal'>('all');

  // Editing states
  const [editingProduct, setEditingProduct] = useState<GeladinhoProduct | null>(null);
  const [isNewProduct, setIsNewProduct] = useState(false);

  const [editingCombo, setEditingCombo] = useState<PromoCombo | null>(null);
  const [isNewCombo, setIsNewCombo] = useState(false);

  // Category editing states
  const [editingCategory, setEditingCategory] = useState<CategoryItem | null>(null);
  const [isNewCategory, setIsNewCategory] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<CategoryItem | null>(null);
  const [reassignTargetCategory, setReassignTargetCategory] = useState<string>('');
  const [isQuickCategoryModalOpen, setIsQuickCategoryModalOpen] = useState(false);

  // Deletion and reset confirmation modals
  const [productToDelete, setProductToDelete] = useState<GeladinhoProduct | null>(null);
  const [comboToDelete, setComboToDelete] = useState<PromoCombo | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [importJsonText, setImportJsonText] = useState('');
  const [importError, setImportError] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtered products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'todos' && p.category !== categoryFilter) {
        return false;
      }
      if (statusFilter === 'available' && !p.isAvailable) return false;
      if (statusFilter === 'soldout' && p.isAvailable) return false;

      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name.toLowerCase().includes(q);
        const matchesCategory = p.category.toLowerCase().includes(q);
        const matchesIngredients = p.ingredients.some((ing) => ing.toLowerCase().includes(q));
        const matchesBadges = p.badges.some((b) => b.toLowerCase().includes(q));
        if (!matchesName && !matchesCategory && !matchesIngredients && !matchesBadges) {
          return false;
        }
      }
      return true;
    });
  }, [products, categoryFilter, statusFilter, searchQuery]);

  // Statistics calculation including inventory
  const stats = useMemo(() => {
    const totalProducts = products.length;
    const availableProducts = products.filter((p) => p.isAvailable).length;
    const soldOutProducts = totalProducts - availableProducts;
    const totalCombos = combos.length;
    const prices = products.map((p) => p.price);
    const avgPrice = prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
    const minPrice = prices.length ? Math.min(...prices) : 0;
    const maxPrice = prices.length ? Math.max(...prices) : 0;

    // Inventory metrics
    let totalStockUnits = 0;
    let inventoryValue = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;

    products.forEach((p) => {
      const isTracked = p.trackStock !== false;
      const stock = isTracked ? (p.stockQuantity ?? 0) : 0;
      const minAlert = p.minStockAlert ?? 5;

      if (isTracked) {
        totalStockUnits += stock;
        inventoryValue += stock * p.price;
        if (stock <= 0 || !p.isAvailable) {
          outOfStockCount++;
        } else if (stock <= minAlert) {
          lowStockCount++;
        }
      }
    });

    const categoryBreakdown: Record<string, number> = {};
    products.forEach((p) => {
      categoryBreakdown[p.category] = (categoryBreakdown[p.category] || 0) + 1;
    });

    return {
      totalProducts,
      availableProducts,
      soldOutProducts,
      totalCombos,
      avgPrice,
      minPrice,
      maxPrice,
      categoryBreakdown,
      totalStockUnits,
      inventoryValue,
      lowStockCount,
      outOfStockCount,
    };
  }, [products, combos]);

  if (!isOpen) return null;

  // New category factory
  const handleOpenNewCategory = () => {
    const newCat: CategoryItem = {
      id: `categoria-${Date.now()}`,
      label: '',
      icon: '⭐',
      color: 'from-rose-500 to-pink-500',
      description: '',
    };
    setEditingCategory(newCat);
    setIsNewCategory(true);
  };

  const handleSaveCategoryForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    if (!editingCategory.label.trim()) {
      alert('Por favor, informe o nome da categoria.');
      return;
    }

    const cleanId = (editingCategory.id || '')
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9-_]/g, '-');

    const catToSave: CategoryItem = {
      ...editingCategory,
      id: cleanId || `cat-${Date.now()}`,
      label: editingCategory.label.trim(),
      description: editingCategory.description?.trim() || undefined,
    };

    if (onSaveCategory) {
      onSaveCategory(catToSave);
      showToast(isNewCategory ? 'Nova categoria criada!' : 'Categoria atualizada!');
    }

    setEditingCategory(null);
    setIsNewCategory(false);
  };

  const handleMoveCategory = (index: number, direction: 'up' | 'down') => {
    if (!onReorderCategories) return;
    const editableCats = categories.filter((c) => c.id !== 'todos');
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= editableCats.length) return;

    const newArr = [...editableCats];
    const temp = newArr[index];
    newArr[index] = newArr[targetIndex];
    newArr[targetIndex] = temp;

    // Prepend 'todos' if existed
    const todosItem = categories.find((c) => c.id === 'todos') || { id: 'todos', label: 'Todos os Sabores' };
    onReorderCategories([todosItem, ...newArr]);
    showToast('Ordem das categorias atualizada!');
  };

  // New product factory
  const handleOpenNewProduct = () => {
    const firstCat = categories.find((c) => c.id !== 'todos')?.id || 'geral';
    const newProd: GeladinhoProduct = {
      id: `sabor-${Date.now()}`,
      name: '',
      category: firstCat,
      tagline: '',
      description: '',
      price: 8.0,
      originalPrice: undefined,
      image: PRESET_IMAGES[0].url,
      badges: ['Novidade'],
      ingredients: ['Leite Ninho', 'Leite Condensado', 'Creme de Leite'],
      allergens: ['Contém Leite'],
      volumeMl: 150,
      isAvailable: true,
      stockQuantity: 20,
      trackStock: true,
      minStockAlert: 5,
      rating: 5.0,
      reviewsCount: 1,
      flavorProfile: {
        sweetness: 4,
        creaminess: 4,
        fruitiness: 3,
      },
    };
    setEditingProduct(newProd);
    setIsNewProduct(true);
  };

  // New combo factory
  const handleOpenNewCombo = () => {
    const newComb: PromoCombo = {
      id: `combo-${Date.now()}`,
      title: 'Kit Promocional Especial',
      subtitle: 'Escolha seus sabores favoritos',
      description: 'Kit econômico com unidades selecionadas e embalagem térmica protetora.',
      itemsCount: 4,
      price: 28.0,
      originalPrice: 34.0,
      image: PRESET_IMAGES[10].url,
      badge: 'Super Promoção',
      includesThermalBag: true,
      isCustomizable: true,
    };
    setEditingCombo(newComb);
    setIsNewCombo(true);
  };

  const handleSaveProductForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    if (!editingProduct.name.trim()) {
      alert('Por favor, informe o nome do sabor.');
      return;
    }
    if (editingProduct.price <= 0) {
      alert('O preço de venda deve ser maior que zero.');
      return;
    }

    onSaveProduct(editingProduct);
    showToast(isNewProduct ? 'Novo sabor adicionado com sucesso!' : 'Sabor atualizado com sucesso!');
    setEditingProduct(null);
    setIsNewProduct(false);
  };

  const handleSaveComboForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCombo) return;
    if (!editingCombo.title.trim()) {
      alert('Por favor, informe o título do combo.');
      return;
    }
    if (editingCombo.price <= 0 || editingCombo.itemsCount <= 0) {
      alert('Preço e quantidade de itens devem ser válidos.');
      return;
    }

    onSaveCombo(editingCombo);
    showToast(isNewCombo ? 'Novo combo adicionado com sucesso!' : 'Combo atualizado com sucesso!');
    setEditingCombo(null);
    setIsNewCombo(false);
  };

  const handleExportJson = () => {
    const exportData = {
      categories,
      products,
      combos,
      exportedAt: new Date().toISOString(),
    };
    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardapio-geladinhos-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Arquivo de backup do cardápio baixado!');
  };

  const handleImportJson = () => {
    try {
      setImportError(null);
      const parsed = JSON.parse(importJsonText);
      if (!Array.isArray(parsed.products)) {
        throw new Error('Formato inválido: lista de produtos ausente.');
      }
      onImportCatalog({
        products: parsed.products,
        combos: Array.isArray(parsed.combos) ? parsed.combos : combos,
        categories: Array.isArray(parsed.categories) ? parsed.categories : categories,
      });
      showToast('Cardápio importado com sucesso!');
      setImportJsonText('');
      setActiveTab('sabores');
    } catch (err: any) {
      setImportError(err.message || 'JSON inválido. Verifique o formato.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col border border-stone-200 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Toast Notification */}
        {toastMessage && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-stone-900 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-white text-stone-900 flex items-center justify-between border-b border-stone-100 shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-xl sm:text-2xl text-stone-900 tracking-tight">
                  Gerenciador do Cardápio
                </h2>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Ao Vivo
                </span>
              </div>
              <p className="text-xs text-stone-500 font-normal">
                Edite sabores, preços, estoque e combos com atualização instantânea na loja.
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

        {/* Navigation Tabs & Primary Actions Bar */}
        <div className="bg-stone-50/80 px-4 sm:px-6 py-2.5 border-b border-stone-200/70 flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-stone-200/80 shadow-xs flex-wrap">
            <button
              onClick={() => { setActiveTab('sabores'); setEditingProduct(null); setEditingCombo(null); setEditingCategory(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'sabores'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <span>Sabores</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'sabores' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                {products.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('categorias'); setEditingProduct(null); setEditingCombo(null); setEditingCategory(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'categorias'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <FolderTree className="w-3.5 h-3.5" />
              <span>Categorias</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'categorias' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                {categories.filter(c => c.id !== 'todos').length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('combos'); setEditingProduct(null); setEditingCombo(null); setEditingCategory(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'combos'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>Combos & Kits</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${activeTab === 'combos' ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'}`}>
                {combos.length}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab('estoque'); setEditingProduct(null); setEditingCombo(null); setEditingCategory(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'estoque'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Boxes className="w-3.5 h-3.5" />
              <span>Estoque & Baixas</span>
              {stats.lowStockCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500 text-white font-bold animate-pulse">
                  {stats.lowStockCount}
                </span>
              )}
            </button>

            <button
              onClick={() => { setActiveTab('metricas'); setEditingProduct(null); setEditingCombo(null); setEditingCategory(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'metricas'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Estatísticas</span>
            </button>

            <button
              onClick={() => { setActiveTab('backup'); setEditingProduct(null); setEditingCombo(null); setEditingCategory(null); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'backup'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-50'
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Backup</span>
            </button>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {activeTab === 'sabores' && (
              <button
                onClick={handleOpenNewProduct}
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Sabor</span>
              </button>
            )}

            {activeTab === 'categorias' && (
              <button
                onClick={handleOpenNewCategory}
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Categoria</span>
              </button>
            )}

            {activeTab === 'combos' && (
              <button
                onClick={handleOpenNewCombo}
                className="px-3.5 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-xs active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Novo Combo</span>
              </button>
            )}

            {onOpenNeighborhoods && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenNeighborhoods();
                }}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer border border-rose-200 shadow-2xs"
                title="Configurar fretes e bairros"
              >
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Bairros & Frete</span>
              </button>
            )}

            <button
              onClick={() => {
                setIsResetConfirmOpen(true);
              }}
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer border border-stone-200/60"
              title="Restaurar Cardápio Padrão"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Restaurar Padrões</span>
            </button>
          </div>
        </div>

        {/* Content Body Area */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6">
          {/* TAB 1: SABORES LIST */}
          {activeTab === 'sabores' && !editingProduct && (
            <div className="space-y-4">
              {/* Search & Filters Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar sabor ou ingrediente..."
                    className="w-full bg-white border border-stone-200 rounded-xl pl-9 pr-3 py-1.5 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* Category Select */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-xl px-3 py-1.5 text-xs font-medium text-stone-800 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    <option value="todos">Todas as Categorias ({products.length})</option>
                    {categories.filter(c => c.id !== 'todos').map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.icon ? `${cat.icon} ` : ''}{cat.label} ({products.filter(p => p.category === cat.id).length})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                      statusFilter === 'all' ? 'bg-stone-900 text-white border-stone-900' : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    Todos ({products.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('available')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                      statusFilter === 'available' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-emerald-700 border-stone-200'
                    }`}
                  >
                    Em Estoque ({products.filter(p => p.isAvailable).length})
                  </button>
                  <button
                    onClick={() => setStatusFilter('soldout')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-xl border transition-colors ${
                      statusFilter === 'soldout' ? 'bg-rose-600 text-white border-rose-600' : 'bg-white text-rose-600 border-stone-200'
                    }`}
                  >
                    Esgotados ({products.filter(p => !p.isAvailable).length})
                  </button>
                </div>
              </div>

              {/* Products Table / Cards */}
              {filteredProducts.length === 0 ? (
                <div className="py-12 text-center bg-stone-50 rounded-2xl border border-stone-200 p-6">
                  <Search className="w-8 h-8 text-stone-300 mx-auto mb-2" />
                  <h4 className="font-bold text-stone-800 text-sm">Nenhum sabor encontrado</h4>
                  <p className="text-xs text-stone-500 mt-1">Tente ajustar os filtros ou adicione um novo sabor.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredProducts.map((prod) => (
                    <div
                      key={prod.id}
                      className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        prod.isAvailable 
                          ? 'bg-white border-stone-200/90 hover:border-stone-300 shadow-xs' 
                          : 'bg-stone-50/80 border-stone-200 opacity-75'
                      }`}
                    >
                      {/* Product details thumbnail & info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                          <img
                            src={prod.image}
                            alt={prod.name}
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          {!prod.isAvailable && (
                            <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-wider">
                              Esgotado
                            </div>
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm text-stone-900 truncate">
                              {prod.name}
                            </h4>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-600">
                              {prod.volumeMl}ml
                            </span>
                          </div>

                          <p className="text-[11px] text-stone-500 line-clamp-1 font-normal mt-0.5">
                            {prod.tagline || prod.description}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {/* Quick price adjust stepper */}
                            <div className="flex items-center bg-rose-50 rounded-xl p-0.5 border border-rose-200/80" title="Ajuste rápido de preço">
                              <button
                                type="button"
                                onClick={() => {
                                  const newPrice = Math.max(0.5, Math.round((prod.price - 0.5) * 100) / 100);
                                  if (onQuickUpdatePrice) {
                                    onQuickUpdatePrice(prod.id, newPrice);
                                  } else {
                                    onSaveProduct({ ...prod, price: newPrice });
                                  }
                                  showToast(`${prod.name}: ${formatCurrency(newPrice)}`);
                                }}
                                className="w-5 h-5 flex items-center justify-center text-rose-700 hover:text-rose-900 hover:bg-white rounded-lg cursor-pointer font-bold text-xs"
                                title="Diminuir R$ 0,50 no valor"
                              >
                                -
                              </button>
                              <span className="text-[11px] font-extrabold text-rose-950 px-1 min-w-[50px] text-center">
                                {formatCurrency(prod.price)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newPrice = Math.round((prod.price + 0.5) * 100) / 100;
                                  if (onQuickUpdatePrice) {
                                    onQuickUpdatePrice(prod.id, newPrice);
                                  } else {
                                    onSaveProduct({ ...prod, price: newPrice });
                                  }
                                  showToast(`${prod.name}: ${formatCurrency(newPrice)}`);
                                }}
                                className="w-5 h-5 flex items-center justify-center text-rose-700 hover:text-rose-900 hover:bg-white rounded-lg cursor-pointer font-bold text-xs"
                                title="Aumentar R$ 0,50 no valor"
                              >
                                +
                              </button>
                            </div>

                            {prod.originalPrice && prod.originalPrice > prod.price && (
                              <span className="text-[10px] text-stone-400 line-through">
                                {formatCurrency(prod.originalPrice)}
                              </span>
                            )}
                            <span className="text-[10px] text-stone-400">•</span>
                            
                            {/* Stock Indicator Badge */}
                            {prod.trackStock !== false ? (
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 ${
                                (prod.stockQuantity ?? 0) <= 0 || !prod.isAvailable
                                  ? 'bg-rose-100 text-rose-700'
                                  : (prod.stockQuantity ?? 0) <= (prod.minStockAlert || 5)
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                <Boxes className="w-2.5 h-2.5" />
                                {prod.stockQuantity ?? 0} un.
                              </span>
                            ) : (
                              <span className="text-[10px] text-stone-400 font-medium">Estoque livre</span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Stock availability toggle & actions */}
                      <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                        {/* Quick stock stepper buttons if tracked */}
                        {prod.trackStock !== false && onQuickUpdateStock && (
                          <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200">
                            <button
                              type="button"
                              onClick={() => {
                                const current = prod.stockQuantity ?? 0;
                                if (current > 0) {
                                  onQuickUpdateStock(prod.id, current - 1, 'manual_adjustment');
                                  showToast(`${prod.name}: ${current - 1} un.`);
                                }
                              }}
                              disabled={(prod.stockQuantity ?? 0) <= 0}
                              className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg disabled:opacity-30 cursor-pointer"
                              title="Reduzir 1 unidade do estoque"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-[11px] font-bold text-stone-800 px-1.5 min-w-[20px] text-center">
                              {prod.stockQuantity ?? 0}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                const current = prod.stockQuantity ?? 0;
                                onQuickUpdateStock(prod.id, current + 1, 'restock');
                                showToast(`${prod.name}: ${current + 1} un.`);
                              }}
                              className="w-6 h-6 flex items-center justify-center text-stone-600 hover:text-stone-900 hover:bg-white rounded-lg cursor-pointer"
                              title="Adicionar 1 unidade ao estoque"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}

                        {/* Toggle stock availability */}
                        <button
                          onClick={() => {
                            onToggleProductAvailability(prod.id);
                            showToast(prod.isAvailable ? `${prod.name} marcado como Esgotado` : `${prod.name} disponível em estoque!`);
                          }}
                          className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            prod.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                          }`}
                          title={prod.isAvailable ? 'Em estoque (Clique para marcar como Esgotado)' : 'Esgotado (Clique para marcar como Disponível)'}
                        >
                          {prod.isAvailable ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                          <span className="text-[11px] hidden sm:inline">{prod.isAvailable ? 'Ativo' : 'Pausado'}</span>
                        </button>

                        {/* Edit button */}
                        <button
                          onClick={() => { setEditingProduct(prod); setIsNewProduct(false); }}
                          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80 transition-colors cursor-pointer"
                          title="Editar Sabor"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate button */}
                        <button
                          onClick={() => {
                            onDuplicateProduct(prod);
                            showToast(`Cópia de ${prod.name} criada!`);
                          }}
                          className="p-2 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 border border-stone-200/80 transition-colors cursor-pointer"
                          title="Duplicar Sabor"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete button */}
                        <button
                          type="button"
                          onClick={() => {
                            setProductToDelete(prod);
                          }}
                          className="p-2 rounded-xl text-rose-500 hover:text-rose-700 hover:bg-rose-50 border border-rose-100 transition-colors cursor-pointer active:scale-95"
                          title="Excluir Sabor"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: CATEGORIAS GERENCIAMENTO */}
          {activeTab === 'categorias' && !editingCategory && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-stone-50 p-3.5 rounded-2xl border border-stone-200/80">
                <div>
                  <h4 className="text-xs font-bold text-stone-900 flex items-center gap-1.5">
                    <FolderTree className="w-3.5 h-3.5 text-rose-500" />
                    <span>Personalize as Categorias do seu Negócio</span>
                  </h4>
                  <p className="text-[11px] text-stone-500 font-normal mt-0.5">
                    Adicione, renomeie, mude ícones, cores e a ordem das categorias que aparecem no filtro do seu catálogo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleOpenNewCategory}
                  className="px-3.5 py-2 bg-rose-500 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all self-start sm:self-auto shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nova Categoria</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {categories
                  .filter((cat) => cat.id !== 'todos')
                  .map((cat, index, arr) => {
                    const linkedProductsCount = products.filter((p) => p.category === cat.id).length;
                    return (
                      <div
                        key={cat.id}
                        className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-3 hover:border-stone-300 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className={`w-11 h-11 rounded-2xl bg-linear-to-br ${cat.color || 'from-rose-500 to-pink-500'} text-white flex items-center justify-center text-xl shadow-xs shrink-0`}>
                              {cat.icon || '⭐'}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-extrabold text-sm text-stone-900">
                                  {cat.label}
                                </h4>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200/60">
                                  {cat.id}
                                </span>
                              </div>
                              {cat.description && (
                                <p className="text-xs text-stone-500 font-normal line-clamp-1 mt-0.5">
                                  {cat.description}
                                </p>
                              )}
                              <p className="text-[11px] text-stone-400 font-medium mt-1">
                                {linkedProductsCount === 0
                                  ? 'Nenhum produto cadastrado'
                                  : `${linkedProductsCount} ${linkedProductsCount === 1 ? 'sabor cadastrado' : 'sabores cadastrados'}`}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Order and Action Buttons */}
                        <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                          {/* Move up / down */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              disabled={index === 0}
                              onClick={() => handleMoveCategory(index, 'up')}
                              className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              title="Mover para cima"
                            >
                              <ArrowUp className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              disabled={index === arr.length - 1}
                              onClick={() => handleMoveCategory(index, 'down')}
                              className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                              title="Mover para baixo"
                            >
                              <ArrowDown className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[10px] text-stone-400 font-medium ml-1">
                              Posição #{index + 1}
                            </span>
                          </div>

                          {/* Edit / Delete */}
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setEditingCategory(cat);
                                setIsNewCategory(false);
                              }}
                              className="px-2.5 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <Edit2 className="w-3 h-3 text-stone-500" />
                              <span>Editar</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setCategoryToDelete(cat);
                                const otherCat = categories.find((c) => c.id !== 'todos' && c.id !== cat.id);
                                setReassignTargetCategory(otherCat ? otherCat.id : '');
                              }}
                              className="p-1.5 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-50 hover:text-rose-700 cursor-pointer transition-colors"
                              title="Excluir Categoria"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 2: COMBOS & KITS LIST */}
          {activeTab === 'combos' && !editingCombo && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
                <span className="text-xs text-stone-600 font-medium">
                  Kits promocionais aumentam o ticket médio permitindo que os clientes escolham múltiplos sabores.
                </span>
                <span className="text-xs font-bold text-stone-900">
                  {combos.length} kits cadastrados
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {combos.map((combo) => (
                  <div
                    key={combo.id}
                    className="p-4 bg-white rounded-2xl border border-stone-200/90 shadow-xs flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="relative h-32 w-full rounded-xl overflow-hidden bg-stone-100 mb-3 border border-stone-100">
                        <img
                          src={combo.image}
                          alt={combo.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-2 right-2 bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {combo.badge}
                        </div>
                        <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-lg backdrop-blur-xs">
                          {combo.itemsCount} sabores inclusos
                        </div>
                      </div>

                      <h4 className="font-extrabold text-base text-stone-900">
                        {combo.title}
                      </h4>
                      <p className="text-xs text-stone-500 line-clamp-2 mt-1">
                        {combo.description}
                      </p>

                      <div className="flex items-center gap-2 mt-3 flex-wrap">
                        {/* Quick price stepper for combo */}
                        <div className="flex items-center bg-rose-50 rounded-xl p-0.5 border border-rose-200/80" title="Ajuste rápido de preço do combo">
                          <button
                            type="button"
                            onClick={() => {
                              const newPrice = Math.max(1, Math.round((combo.price - 1.0) * 100) / 100);
                              if (onQuickUpdateComboPrice) {
                                onQuickUpdateComboPrice(combo.id, newPrice);
                              } else {
                                onSaveCombo({ ...combo, price: newPrice });
                              }
                              showToast(`${combo.title}: ${formatCurrency(newPrice)}`);
                            }}
                            className="w-6 h-6 flex items-center justify-center text-rose-700 hover:text-rose-900 hover:bg-white rounded-lg cursor-pointer font-bold text-xs"
                            title="Diminuir R$ 1,00 no valor"
                          >
                            -
                          </button>
                          <span className="text-xs font-extrabold text-rose-950 px-1 min-w-[60px] text-center">
                            {formatCurrency(combo.price)}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const newPrice = Math.round((combo.price + 1.0) * 100) / 100;
                              if (onQuickUpdateComboPrice) {
                                onQuickUpdateComboPrice(combo.id, newPrice);
                              } else {
                                onSaveCombo({ ...combo, price: newPrice });
                              }
                              showToast(`${combo.title}: ${formatCurrency(newPrice)}`);
                            }}
                            className="w-6 h-6 flex items-center justify-center text-rose-700 hover:text-rose-900 hover:bg-white rounded-lg cursor-pointer font-bold text-xs"
                            title="Aumentar R$ 1,00 no valor"
                          >
                            +
                          </button>
                        </div>

                        {combo.originalPrice && combo.originalPrice > combo.price && (
                          <span className="text-xs text-stone-400 line-through">
                            {formatCurrency(combo.originalPrice)}
                          </span>
                        )}
                        <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                          Economia de {formatCurrency(combo.originalPrice - combo.price)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-100">
                      <button
                        onClick={() => { setEditingCombo(combo); setIsNewCombo(false); }}
                        className="flex-1 py-2 px-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => {
                          onDuplicateCombo(combo);
                          showToast(`Cópia de ${combo.title} criada!`);
                        }}
                        className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors cursor-pointer"
                        title="Duplicar Combo"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setComboToDelete(combo);
                        }}
                        className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl border border-rose-100 transition-colors cursor-pointer active:scale-95"
                        title="Excluir Combo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: ESTOQUE E BAIXAS AUTOMÁTICAS */}
          {activeTab === 'estoque' && (
            <div className="space-y-6">
              {/* 4 Inventory Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-stone-500 font-medium">Total em Estoque</span>
                    <Boxes className="w-4 h-4 text-stone-400" />
                  </div>
                  <span className="text-2xl font-extrabold text-stone-900 tracking-tight">
                    {stats.totalStockUnits} <span className="text-xs font-semibold text-stone-500">un.</span>
                  </span>
                  <span className="text-[11px] text-stone-500 block mt-1 font-medium">
                    Em todos os sabores ativos
                  </span>
                </div>

                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-amber-800 font-medium">Estoque Baixo</span>
                    <TrendingDown className="w-4 h-4 text-amber-600" />
                  </div>
                  <span className="text-2xl font-extrabold text-amber-900 tracking-tight">
                    {stats.lowStockCount} <span className="text-xs font-semibold text-amber-700">sabores</span>
                  </span>
                  <span className="text-[11px] text-amber-700 font-bold block mt-1">
                    Abaixo do alerta mínimo
                  </span>
                </div>

                <div className="p-4 bg-rose-50/60 rounded-2xl border border-rose-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-rose-800 font-medium">Esgotados</span>
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                  </div>
                  <span className="text-2xl font-extrabold text-rose-900 tracking-tight">
                    {stats.outOfStockCount} <span className="text-xs font-semibold text-rose-700">sabores</span>
                  </span>
                  <span className="text-[11px] text-rose-700 font-bold block mt-1">
                    Sem disponibilidade na loja
                  </span>
                </div>

                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 shadow-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-emerald-800 font-medium">Valor em Mercadoria</span>
                    <DollarSign className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="text-2xl font-extrabold text-emerald-900 tracking-tight">
                    {formatCurrency(stats.inventoryValue)}
                  </span>
                  <span className="text-[11px] text-emerald-700 font-medium block mt-1">
                    Preço de venda estimado
                  </span>
                </div>
              </div>

              {/* Batch Actions Bar */}
              <div className="p-4 bg-stone-900 text-white rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-sm">
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-rose-400" />
                    <span>Reabastecimento Rápido em Lote</span>
                  </h4>
                  <p className="text-xs text-stone-300 font-normal mt-0.5">
                    Adicione unidades a todos os sabores com controle de estoque de uma só vez.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {onBatchRestock && (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          onBatchRestock(5);
                          showToast('+5 unidades adicionadas a todos os sabores!');
                        }}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer border border-stone-700"
                      >
                        +5 un. em Todos
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onBatchRestock(10);
                          showToast('+10 unidades adicionadas a todos os sabores!');
                        }}
                        className="px-3 py-1.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer shadow-xs"
                      >
                        +10 un. em Todos
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Definir 20 unidades para todos os sabores monitorados?')) {
                            products.forEach((p) => {
                              if (p.trackStock !== false && onQuickUpdateStock) {
                                onQuickUpdateStock(p.id, 20, 'restock');
                              }
                            });
                            showToast('Estoque definido em 20 un. para todos!');
                          }
                        }}
                        className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-stone-700"
                      >
                        Definir 20 un. Todos
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Product Stock Table & Controls */}
              <div className="space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1.5">
                    <h3 className="font-extrabold text-base text-stone-900">
                      Inventário por Sabor
                    </h3>
                    <span className="text-xs text-stone-500 font-medium">
                      ({products.length} sabores cadastrados)
                    </span>
                  </div>

                  {/* Filter chips */}
                  <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setStockStatusFilter('all')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        stockStatusFilter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Todos ({products.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockStatusFilter('low')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        stockStatusFilter === 'low' ? 'bg-amber-500 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Baixo ({stats.lowStockCount})
                    </button>
                    <button
                      type="button"
                      onClick={() => setStockStatusFilter('out')}
                      className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        stockStatusFilter === 'out' ? 'bg-rose-500 text-white shadow-xs' : 'text-stone-600 hover:text-stone-900'
                      }`}
                    >
                      Esgotados ({stats.outOfStockCount})
                    </button>
                  </div>
                </div>

                {/* Stock Items List */}
                <div className="divide-y divide-stone-100 bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs">
                  {products
                    .filter((p) => {
                      const isTracked = p.trackStock !== false;
                      const stock = isTracked ? (p.stockQuantity ?? 0) : 0;
                      const minAlert = p.minStockAlert ?? 5;

                      if (stockStatusFilter === 'low') {
                        return isTracked && stock <= minAlert && stock > 0 && p.isAvailable;
                      }
                      if (stockStatusFilter === 'out') {
                        return stock <= 0 || !p.isAvailable;
                      }
                      if (stockStatusFilter === 'normal') {
                        return isTracked && stock > minAlert && p.isAvailable;
                      }
                      return true;
                    })
                    .map((prod) => {
                      const isTracked = prod.trackStock !== false;
                      const stock = isTracked ? (prod.stockQuantity ?? 0) : 0;
                      const minAlert = prod.minStockAlert ?? 5;
                      const isOut = stock <= 0 || !prod.isAvailable;
                      const isLow = !isOut && isTracked && stock <= minAlert;

                      return (
                        <div
                          key={prod.id}
                          className="p-3.5 flex flex-wrap items-center justify-between gap-3 hover:bg-stone-50/60 transition-colors"
                        >
                          {/* Sabor details */}
                          <div className="flex items-center gap-3 min-w-[200px] flex-1">
                            <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                              <img
                                src={prod.image}
                                alt={prod.name}
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h4 className="font-bold text-xs sm:text-sm text-stone-900 truncate">
                                  {prod.name}
                                </h4>
                                {isOut ? (
                                  <span className="text-[10px] bg-rose-100 text-rose-700 font-bold px-1.5 py-0.2 rounded-md">
                                    Esgotado
                                  </span>
                                ) : isLow ? (
                                  <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded-md">
                                    Restam {stock}
                                  </span>
                                ) : isTracked ? (
                                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-md">
                                    Normal
                                  </span>
                                ) : (
                                  <span className="text-[10px] bg-stone-100 text-stone-500 font-medium px-1.5 py-0.2 rounded-md">
                                    Livre
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-stone-500 block font-normal">
                                {formatCurrency(prod.price)} un. • {prod.volumeMl}ml • Valor em estoque: <strong className="text-stone-700">{formatCurrency(prod.price * stock)}</strong>
                              </span>
                            </div>
                          </div>

                          {/* Stepper and quick action buttons */}
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Quick price stepper in inventory table */}
                            <div className="flex items-center bg-rose-50 rounded-xl p-0.5 border border-rose-200/80" title="Ajuste rápido de preço">
                              <button
                                type="button"
                                onClick={() => {
                                  const newPrice = Math.max(0.5, Math.round((prod.price - 0.5) * 100) / 100);
                                  if (onQuickUpdatePrice) {
                                    onQuickUpdatePrice(prod.id, newPrice);
                                  } else {
                                    onSaveProduct({ ...prod, price: newPrice });
                                  }
                                  showToast(`${prod.name}: ${formatCurrency(newPrice)}`);
                                }}
                                className="w-6 h-6 flex items-center justify-center text-rose-700 hover:text-rose-900 hover:bg-white rounded-lg cursor-pointer font-bold text-xs"
                                title="Diminuir R$ 0,50 no preço"
                              >
                                -
                              </button>
                              <span className="text-[11px] font-extrabold text-rose-950 px-1 min-w-[50px] text-center">
                                {formatCurrency(prod.price)}
                              </span>
                              <button
                                type="button"
                                onClick={() => {
                                  const newPrice = Math.round((prod.price + 0.5) * 100) / 100;
                                  if (onQuickUpdatePrice) {
                                    onQuickUpdatePrice(prod.id, newPrice);
                                  } else {
                                    onSaveProduct({ ...prod, price: newPrice });
                                  }
                                  showToast(`${prod.name}: ${formatCurrency(newPrice)}`);
                                }}
                                className="w-6 h-6 flex items-center justify-center text-rose-700 hover:text-rose-900 hover:bg-white rounded-lg cursor-pointer font-bold text-xs"
                                title="Aumentar R$ 0,50 no preço"
                              >
                                +
                              </button>
                            </div>

                            {isTracked && onQuickUpdateStock ? (
                              <>
                                {/* Number stepper */}
                                <div className="flex items-center bg-stone-100 rounded-xl p-1 border border-stone-200/80">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (stock > 0) {
                                        onQuickUpdateStock(prod.id, stock - 1, 'manual_adjustment');
                                        showToast(`${prod.name}: ${stock - 1} un.`);
                                      }
                                    }}
                                    disabled={stock <= 0}
                                    className="w-7 h-7 flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-white rounded-lg disabled:opacity-30 cursor-pointer transition-colors"
                                    title="Diminuir 1 unidade do estoque"
                                  >
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>

                                  <input
                                    type="number"
                                    min="0"
                                    value={stock}
                                    onChange={(e) => {
                                      const text = e.target.value;
                                      if (text === '') return;
                                      const val = parseInt(text);
                                      if (!isNaN(val) && val >= 0) {
                                        onQuickUpdateStock(prod.id, val, 'manual_adjustment');
                                      }
                                    }}
                                    className="w-12 text-center text-xs font-bold text-stone-900 bg-transparent border-none focus:outline-none"
                                  />

                                  <button
                                    type="button"
                                    onClick={() => {
                                      onQuickUpdateStock(prod.id, stock + 1, 'restock');
                                      showToast(`${prod.name}: ${stock + 1} un.`);
                                    }}
                                    className="w-7 h-7 flex items-center justify-center text-stone-700 hover:text-stone-900 hover:bg-white rounded-lg cursor-pointer transition-colors"
                                    title="Aumentar 1 unidade no estoque"
                                  >
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>

                                {/* Quick addition chips */}
                                <div className="flex items-center gap-1">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onQuickUpdateStock(prod.id, stock + 5, 'restock');
                                      showToast(`${prod.name}: +5 un. (${stock + 5} un.)`);
                                    }}
                                    className="px-2 py-1 text-[10px] font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
                                  >
                                    +5
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onQuickUpdateStock(prod.id, stock + 10, 'restock');
                                      showToast(`${prod.name}: +10 un. (${stock + 10} un.)`);
                                    }}
                                    className="px-2 py-1 text-[10px] font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
                                  >
                                    +10
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onQuickUpdateStock(prod.id, 0, 'manual_adjustment');
                                      showToast(`${prod.name} esgotado.`);
                                    }}
                                    className="px-2 py-1 text-[10px] font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                    title="Zerar estoque"
                                  >
                                    Zerar
                                  </button>
                                </div>
                              </>
                            ) : (
                              <span className="text-xs text-stone-400 font-medium">Controle desativado</span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Stock Movement Logs History */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-stone-600" />
                    <h4 className="font-extrabold text-sm text-stone-900">
                      Histórico de Movimentações & Baixas Automáticas
                    </h4>
                  </div>
                  {stockMovements.length > 0 && onClearStockMovements && (
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm('Limpar histórico de movimentações?')) {
                          onClearStockMovements();
                          showToast('Histórico limpo.');
                        }
                      }}
                      className="text-xs font-semibold text-rose-600 hover:underline cursor-pointer"
                    >
                      Limpar Histórico
                    </button>
                  )}
                </div>

                {stockMovements.length === 0 ? (
                  <div className="py-6 text-center text-xs text-stone-500 font-normal">
                    Nenhuma movimentação de estoque registrada ainda. Conforme pedidos forem realizados, as baixas automáticas aparecerão aqui em tempo real.
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto divide-y divide-stone-200/60 bg-white rounded-xl border border-stone-200">
                    {stockMovements.map((mov) => {
                      const isDeduction = mov.quantityChanged < 0;
                      const formattedTime = new Date(mov.timestamp).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div key={mov.id} className="p-3 flex items-center justify-between text-xs gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-stone-900">{mov.productName}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                mov.reason === 'order'
                                  ? 'bg-rose-100 text-rose-700'
                                  : mov.reason === 'restock' || mov.reason === 'batch_restock'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-stone-100 text-stone-700'
                              }`}>
                                {mov.reason === 'order'
                                  ? `Baixa Automática (Pedido #${mov.orderId || 'WhatsApp'})`
                                  : mov.reason === 'batch_restock'
                                  ? 'Reabastecimento em Lote'
                                  : mov.reason === 'restock'
                                  ? 'Reabastecimento Manual'
                                  : 'Ajuste Manual'}
                              </span>
                            </div>
                            <span className="text-[11px] text-stone-400 font-normal block mt-0.5">
                              {formattedTime} • Saldo anterior: {mov.previousStock} un. → Novo saldo: <strong>{mov.newStock} un.</strong>
                            </span>
                          </div>

                          <div className="shrink-0 text-right">
                            <span className={`font-mono font-extrabold text-xs px-2 py-0.5 rounded-lg ${
                              isDeduction ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
                            }`}>
                              {isDeduction ? `${mov.quantityChanged} un.` : `+${mov.quantityChanged} un.`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: ESTATÍSTICAS E MÉTRICAS */}
          {activeTab === 'metricas' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-xs text-stone-500 font-medium block">Total de Sabores</span>
                  <span className="text-2xl font-extrabold text-stone-900">{stats.totalProducts}</span>
                  <span className="text-[11px] text-emerald-600 font-bold block mt-1">
                    {stats.availableProducts} ativos no momento
                  </span>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-xs text-stone-500 font-medium block">Preço Médio por Unidade</span>
                  <span className="text-2xl font-extrabold text-stone-900">{formatCurrency(stats.avgPrice)}</span>
                  <span className="text-[11px] text-stone-500 font-medium block mt-1">
                    Min: {formatCurrency(stats.minPrice)} • Max: {formatCurrency(stats.maxPrice)}
                  </span>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-xs text-stone-500 font-medium block">Combos & Kits</span>
                  <span className="text-2xl font-extrabold text-stone-900">{stats.totalCombos}</span>
                  <span className="text-[11px] text-rose-600 font-bold block mt-1">
                    Opções promocionais
                  </span>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200">
                  <span className="text-xs text-stone-500 font-medium block">Itens Esgotados</span>
                  <span className="text-2xl font-extrabold text-stone-900">{stats.soldOutProducts}</span>
                  <span className="text-[11px] text-stone-500 font-medium block mt-1">
                    Pausados temporariamente
                  </span>
                </div>
              </div>

              {/* Category distribution */}
              <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-extrabold text-sm text-stone-900">Distribuição por Categoria</h4>
                <div className="space-y-2">
                  {CATEGORIES_DATA.filter(c => c.id !== 'todos').map((cat) => {
                    const count = stats.categoryBreakdown[cat.id] || 0;
                    const percent = stats.totalProducts ? Math.round((count / stats.totalProducts) * 100) : 0;
                    return (
                      <div key={cat.id} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-stone-700">{cat.label}</span>
                          <span className="text-stone-500 font-medium">{count} sabores ({percent}%)</span>
                        </div>
                        <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-rose-500 rounded-full"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: BACKUP / IMPORT / EXPORT */}
          {activeTab === 'backup' && (
            <div className="space-y-6 max-w-2xl mx-auto">
              <div className="p-5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                  <Download className="w-4 h-4 text-rose-500" />
                  <span>Exportar Backup do Cardápio</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  Faça o download do arquivo JSON com todos os seus sabores cadastrados, preços, fotos e kits promocionais para segurança ou transferência.
                </p>
                <button
                  onClick={handleExportJson}
                  className="px-4 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Baixar Arquivo JSON (.json)</span>
                </button>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-extrabold text-sm text-stone-900 flex items-center gap-2">
                  <Upload className="w-4 h-4 text-emerald-600" />
                  <span>Importar Cardápio de JSON</span>
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed font-normal">
                  Cole o código JSON do seu cardápio abaixo para carregar todos os sabores e combos de uma vez só:
                </p>
                <textarea
                  value={importJsonText}
                  onChange={(e) => setImportJsonText(e.target.value)}
                  placeholder="Cole o código JSON do cardápio aqui..."
                  rows={5}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-mono text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
                {importError && (
                  <p className="text-xs text-rose-600 font-bold">{importError}</p>
                )}
                <button
                  onClick={handleImportJson}
                  disabled={!importJsonText.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Carregar & Atualizar Cardápio</span>
                </button>
              </div>
            </div>
          )}

          {/* EDIT/CREATE PRODUCT FORM SUBVIEW */}
          {editingProduct && (
            <form onSubmit={handleSaveProductForm} className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">
                    {isNewProduct ? 'Adicionar Novo Sabor' : `Editar Sabor: ${editingProduct.name}`}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Preencha os dados do geladinho gourmet para atualizar a loja.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Voltar para Lista
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Nome do Sabor *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    placeholder="Ex: Ninho com Nutella Pura"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* Category */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-stone-800">
                      Categoria *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        handleOpenNewCategory();
                        setActiveTab('categorias');
                      }}
                      className="text-[11px] text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Nova Categoria</span>
                    </button>
                  </div>
                  <select
                    value={editingProduct.category}
                    onChange={(e) => setEditingProduct({ ...editingProduct, category: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  >
                    {categories
                      .filter((c) => c.id !== 'todos')
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.icon ? `${cat.icon} ` : ''}{cat.label}
                        </option>
                      ))}
                  </select>
                </div>

                {/* Price & Original Price */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Preço de Venda (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Preço Original / De (R$) (Opcional)
                  </label>
                  <input
                    type="number"
                    step="0.10"
                    value={editingProduct.originalPrice || ''}
                    onChange={(e) => setEditingProduct({ ...editingProduct, originalPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                    placeholder="Ex: 10.00 (para exibir como promoção)"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* Volume & Availability */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Volume em ml
                  </label>
                  <input
                    type="number"
                    value={editingProduct.volumeMl}
                    onChange={(e) => setEditingProduct({ ...editingProduct, volumeMl: parseInt(e.target.value) || 150 })}
                    placeholder="Ex: 150"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* Stock Controls */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Quantidade em Estoque (Unidades)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editingProduct.stockQuantity ?? 20}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      const stockQuantity = isNaN(val) ? 0 : Math.max(0, val);
                      setEditingProduct({ 
                        ...editingProduct, 
                        stockQuantity,
                        isAvailable: stockQuantity > 0 ? editingProduct.isAvailable : false
                      });
                    }}
                    placeholder="Ex: 20"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Alerta de Estoque Baixo (Unidades)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editingProduct.minStockAlert ?? 5}
                    onChange={(e) => setEditingProduct({ ...editingProduct, minStockAlert: parseInt(e.target.value) || 5 })}
                    placeholder="Ex: 5"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Controle & Disponibilidade
                  </label>
                  <div className="space-y-2 pt-1">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.isAvailable}
                        onChange={(e) => setEditingProduct({ ...editingProduct, isAvailable: e.target.checked })}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-xs font-semibold text-stone-800">
                        Disponível para venda na loja
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProduct.trackStock !== false}
                        onChange={(e) => setEditingProduct({ ...editingProduct, trackStock: e.target.checked })}
                        className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-xs font-medium text-stone-600">
                        Controlar estoque e dar baixa automática em pedidos
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Tagline & Description */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Frase de Destaque (Slogan curto)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.tagline}
                    onChange={(e) => setEditingProduct({ ...editingProduct, tagline: e.target.value })}
                    placeholder="Ex: O queridinho absoluto! Base ultra cremosa e recheio generoso."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Descrição Detalhada do Sabor
                  </label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                    placeholder="Descreva a receita, textura e diferenciais..."
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-normal text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              {/* Image URL & Preset Selection */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-stone-500" />
                    <span>Foto do Geladinho (URL da Imagem)</span>
                  </label>
                </div>
                <input
                  type="url"
                  value={editingProduct.image}
                  onChange={(e) => setEditingProduct({ ...editingProduct, image: e.target.value })}
                  placeholder="https://..."
                  className="w-full bg-white border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />

                {/* Preset image picker */}
                <div>
                  <span className="text-[11px] font-semibold text-stone-500 block mb-1.5">
                    Ou selecione uma foto profissional pronta do banco:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_IMAGES.map((img, i) => (
                      <button
                        type="button"
                        key={i}
                        onClick={() => setEditingProduct({ ...editingProduct, image: img.url })}
                        className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          editingProduct.image === img.url
                            ? 'bg-rose-500 text-white border-rose-500 shadow-xs'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {img.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Badges / Selos */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Selos & Badges de Destaque
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {SUGGESTED_BADGES.map((b) => {
                    const isSelected = editingProduct.badges.includes(b);
                    return (
                      <button
                        type="button"
                        key={b}
                        onClick={() => {
                          const updated = isSelected
                            ? editingProduct.badges.filter((x) => x !== b)
                            : [...editingProduct.badges, b];
                          setEditingProduct({ ...editingProduct, badges: updated });
                        }}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-lg border transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-stone-900 text-white border-stone-900'
                            : 'bg-stone-100 text-stone-600 border-transparent hover:bg-stone-200'
                        }`}
                      >
                        {isSelected ? `✓ ${b}` : `+ ${b}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Ingredients & Allergens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Ingredientes (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.ingredients.join(', ')}
                    onChange={(e) => {
                      const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      setEditingProduct({ ...editingProduct, ingredients: list });
                    }}
                    placeholder="Leite Ninho, Leite Condensado, Morango Fresco"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Alergênicos (separados por vírgula)
                  </label>
                  <input
                    type="text"
                    value={editingProduct.allergens.join(', ')}
                    onChange={(e) => {
                      const list = e.target.value.split(',').map((s) => s.trim()).filter(Boolean);
                      setEditingProduct({ ...editingProduct, allergens: list });
                    }}
                    placeholder="Contém Leite, Contém Glúten, Contém Castanha"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>
              </div>

              {/* Flavor Profile Sliders */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="text-xs font-bold text-stone-800 block">
                  Perfil Sensorial do Sabor (1 a 5)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-stone-600 block mb-1">
                      Doçura: <strong className="text-stone-900">{editingProduct.flavorProfile.sweetness} / 5</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={editingProduct.flavorProfile.sweetness}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        flavorProfile: { ...editingProduct.flavorProfile, sweetness: parseInt(e.target.value) }
                      })}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-600 block mb-1">
                      Cremosidade: <strong className="text-stone-900">{editingProduct.flavorProfile.creaminess} / 5</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={editingProduct.flavorProfile.creaminess}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        flavorProfile: { ...editingProduct.flavorProfile, creaminess: parseInt(e.target.value) }
                      })}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-stone-600 block mb-1">
                      Frutado: <strong className="text-stone-900">{editingProduct.flavorProfile.fruitiness} / 5</strong>
                    </label>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={editingProduct.flavorProfile.fruitiness}
                      onChange={(e) => setEditingProduct({
                        ...editingProduct,
                        flavorProfile: { ...editingProduct.flavorProfile, fruitiness: parseInt(e.target.value) }
                      })}
                      className="w-full accent-rose-500 cursor-pointer"
                    />
                  </div>
                </div>
              </div>

              {/* Form Action buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
                {!isNewProduct ? (
                  <button
                    type="button"
                    onClick={() => setProductToDelete(editingProduct)}
                    className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir este sabor</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingProduct(null)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Sabor</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* EDIT/CREATE COMBO FORM SUBVIEW */}
          {editingCombo && (
            <form onSubmit={handleSaveComboForm} className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">
                    {isNewCombo ? 'Adicionar Novo Combo Promocional' : `Editar Combo: ${editingCombo.title}`}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Configure os kits promocionais e quantidade de sabores permitidos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCombo(null)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Voltar para Lista
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Título do Combo *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCombo.title}
                    onChange={(e) => setEditingCombo({ ...editingCombo, title: e.target.value })}
                    placeholder="Ex: Kit Degustação 6 Sabores"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Selo / Badge
                  </label>
                  <input
                    type="text"
                    value={editingCombo.badge}
                    onChange={(e) => setEditingCombo({ ...editingCombo, badge: e.target.value })}
                    placeholder="Ex: Mais Vendido, Economize 20%"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Preço do Kit (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    required
                    value={editingCombo.price}
                    onChange={(e) => setEditingCombo({ ...editingCombo, price: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-bold text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Preço Original / Sem Desconto (R$)
                  </label>
                  <input
                    type="number"
                    step="0.50"
                    value={editingCombo.originalPrice}
                    onChange={(e) => setEditingCombo({ ...editingCombo, originalPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Quantidade de Geladinhos no Kit *
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="50"
                    required
                    value={editingCombo.itemsCount}
                    onChange={(e) => setEditingCombo({ ...editingCombo, itemsCount: parseInt(e.target.value) || 4 })}
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editingCombo.includesThermalBag}
                      onChange={(e) => setEditingCombo({ ...editingCombo, includesThermalBag: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500"
                    />
                    <span className="text-xs font-semibold text-stone-800">
                      Inclui Embalagem Térmica Especial
                    </span>
                  </label>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Subtítulo / Chamada
                </label>
                <input
                  type="text"
                  value={editingCombo.subtitle}
                  onChange={(e) => setEditingCombo({ ...editingCombo, subtitle: e.target.value })}
                  placeholder="Ex: Escolha 6 sabores favoritos entre todo o cardápio"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Descrição do Kit
                </label>
                <textarea
                  rows={2}
                  value={editingCombo.description}
                  onChange={(e) => setEditingCombo({ ...editingCombo, description: e.target.value })}
                  placeholder="Descreva as vantagens do kit..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-xs font-normal text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  URL da Imagem do Kit
                </label>
                <input
                  type="url"
                  value={editingCombo.image}
                  onChange={(e) => setEditingCombo({ ...editingCombo, image: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
                {!isNewCombo ? (
                  <button
                    type="button"
                    onClick={() => setComboToDelete(editingCombo)}
                    className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir este combo</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCombo(null)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Combo</span>
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* EDIT/CREATE CATEGORY FORM SUBVIEW */}
          {editingCategory && (
            <form onSubmit={handleSaveCategoryForm} className="space-y-5 animate-in fade-in duration-200">
              <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                <div>
                  <h3 className="font-extrabold text-lg text-stone-900">
                    {isNewCategory ? 'Criar Nova Categoria' : `Editar Categoria: ${editingCategory.label}`}
                  </h3>
                  <p className="text-xs text-stone-500">
                    Personalize o nome, ícone emoji e paleta de cores desta categoria.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Voltar para Lista
                </button>
              </div>

              {/* Category preview card */}
              <div className="p-4 bg-stone-50/80 rounded-2xl border border-stone-200/80 flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl bg-linear-to-br ${editingCategory.color || 'from-rose-500 to-pink-500'} text-white flex items-center justify-center text-2xl shadow-xs shrink-0`}>
                  {editingCategory.icon || '⭐'}
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Prévia da Categoria</span>
                  <h4 className="font-extrabold text-base text-stone-900 leading-tight">
                    {editingCategory.label || 'Nome da Categoria'}
                  </h4>
                  <p className="text-xs text-stone-500 font-normal mt-0.5">
                    {editingCategory.description || 'Descrição informativa da categoria para os clientes.'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Category Name */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Nome da Categoria (Exibição) *
                  </label>
                  <input
                    type="text"
                    required
                    value={editingCategory.label}
                    onChange={(e) => {
                      const newLabel = e.target.value;
                      const autoSlug = newLabel
                        .toLowerCase()
                        .trim()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/[^a-z0-9-_]/g, '-');
                      setEditingCategory({
                        ...editingCategory,
                        label: newLabel,
                        id: isNewCategory ? autoSlug : editingCategory.id,
                      });
                    }}
                    placeholder="Ex: Frutas Tropicais Gourmet"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-medium text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                  />
                </div>

                {/* Slug Identifier */}
                <div>
                  <label className="text-xs font-bold text-stone-800 block mb-1">
                    Identificador (Slug / Código) *
                  </label>
                  <input
                    type="text"
                    required
                    disabled={!isNewCategory && editingCategory.id === 'todos'}
                    value={editingCategory.id}
                    onChange={(e) => setEditingCategory({ ...editingCategory, id: e.target.value })}
                    placeholder="Ex: frutas-tropicais"
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-mono text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:opacity-50"
                  />
                  <p className="text-[10px] text-stone-400 mt-1">Usado internamente para vincular os sabores.</p>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1">
                  Descrição ou Chamada (Opcional)
                </label>
                <input
                  type="text"
                  value={editingCategory.description || ''}
                  onChange={(e) => setEditingCategory({ ...editingCategory, description: e.target.value })}
                  placeholder="Ex: Feitos com polpa 100% natural e pedaços de fruta fresca"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3.5 py-2 text-xs font-normal text-stone-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                />
              </div>

              {/* Emoji / Icon Selector */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Ícone Emoji da Categoria
                </label>
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  {PRESET_CATEGORY_ICONS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, icon: emoji })}
                      className={`w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                        editingCategory.icon === emoji
                          ? 'bg-rose-500 text-white scale-110 shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-stone-500">Ou digite um emoji customizado:</span>
                  <input
                    type="text"
                    maxLength={4}
                    value={editingCategory.icon || ''}
                    onChange={(e) => setEditingCategory({ ...editingCategory, icon: e.target.value })}
                    className="w-14 text-center bg-stone-50 border border-stone-200 rounded-lg py-1 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                    placeholder="🌟"
                  />
                </div>
              </div>

              {/* Gradient Color Palette */}
              <div>
                <label className="text-xs font-bold text-stone-800 block mb-1.5">
                  Paleta de Cor (Gradiente de Destaque)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESET_CATEGORY_COLORS.map((col) => (
                    <button
                      key={col.value}
                      type="button"
                      onClick={() => setEditingCategory({ ...editingCategory, color: col.value })}
                      className={`p-2.5 rounded-xl border flex items-center gap-2 transition-all cursor-pointer text-left ${
                        editingCategory.color === col.value
                          ? 'border-rose-500 bg-rose-50/50 ring-2 ring-rose-500/20'
                          : 'border-stone-200 bg-white hover:bg-stone-50'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-lg bg-linear-to-br ${col.value} shrink-0 shadow-xs`} />
                      <span className="text-[11px] font-bold text-stone-800 truncate">{col.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Action buttons */}
              <div className="flex items-center justify-between gap-3 pt-3 border-t border-stone-100">
                {!isNewCategory && editingCategory.id !== 'todos' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCategoryToDelete(editingCategory);
                      const otherCat = categories.find((c) => c.id !== 'todos' && c.id !== editingCategory.id);
                      setReassignTargetCategory(otherCat ? otherCat.id : '');
                    }}
                    className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Excluir categoria</span>
                  </button>
                ) : <div />}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingCategory(null)}
                    className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Check className="w-4 h-4" />
                    <span>Salvar Categoria</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between shrink-0">
          <span className="text-xs text-stone-500 font-medium">
            {products.length} sabores • {categories.filter(c => c.id !== 'todos').length} categorias • {combos.length} combos
          </span>

          <button
            onClick={onClose}
            className="px-5 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Concluir & Voltar para Loja
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CONFIRMATION MODAL: DELETE PRODUCT (SABOR)                   */}
      {/* ============================================================ */}
      {productToDelete && (
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
                  Excluir Sabor do Cardápio?
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-3">
              <img
                src={productToDelete.image}
                alt={productToDelete.name}
                className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-stone-900 truncate">
                  {productToDelete.name}
                </h4>
                <p className="text-[11px] text-stone-500 truncate">
                  {productToDelete.tagline || productToDelete.description}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs font-extrabold text-rose-600">
                    {formatCurrency(productToDelete.price)}
                  </span>
                  <span className="text-[10px] text-stone-500 font-medium bg-stone-200/60 px-1.5 py-0.5 rounded">
                    {productToDelete.category}
                  </span>
                </div>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Tem certeza que deseja remover <strong>"{productToDelete.name}"</strong>? O item será removido permanentemente do cardápio e das sacolas dos clientes.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const name = productToDelete.name;
                  const id = productToDelete.id;
                  onDeleteProduct(id);
                  if (editingProduct?.id === id) {
                    setEditingProduct(null);
                  }
                  setProductToDelete(null);
                  showToast(`Sabor "${name}" excluído com sucesso!`);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Sabor</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONFIRMATION MODAL: DELETE COMBO                             */}
      {/* ============================================================ */}
      {comboToDelete && (
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
                  Excluir Kit Promocional?
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-3">
              <img
                src={comboToDelete.image}
                alt={comboToDelete.title}
                className="w-14 h-14 rounded-xl object-cover border border-stone-200 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs text-stone-900 truncate">
                  {comboToDelete.title}
                </h4>
                <p className="text-[11px] text-stone-500 truncate">
                  {comboToDelete.itemsCount} sabores inclusos
                </p>
                <span className="text-xs font-extrabold text-rose-600 mt-1 block">
                  {formatCurrency(comboToDelete.price)}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Tem certeza que deseja excluir o combo <strong>"{comboToDelete.title}"</strong> do catálogo?
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setComboToDelete(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const title = comboToDelete.title;
                  const id = comboToDelete.id;
                  onDeleteCombo(id);
                  if (editingCombo?.id === id) {
                    setEditingCombo(null);
                  }
                  setComboToDelete(null);
                  showToast(`Combo "${title}" excluído com sucesso!`);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Combo</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONFIRMATION MODAL: DELETE CATEGORY                          */}
      {/* ============================================================ */}
      {categoryToDelete && (
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
                  Excluir Categoria "{categoryToDelete.label}"?
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  {products.filter((p) => p.category === categoryToDelete.id).length} sabores vinculados
                </p>
              </div>
            </div>

            {/* Reassign products warning and selector */}
            {products.filter((p) => p.category === categoryToDelete.id).length > 0 && (
              <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-200/80 space-y-2">
                <div className="flex items-center gap-1.5 text-amber-800 text-xs font-bold">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Atenção: Existem sabores nesta categoria</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed font-normal">
                  Escolha para qual categoria deseja mover os <strong>{products.filter((p) => p.category === categoryToDelete.id).length}</strong> sabores cadastrados:
                </p>
                <select
                  value={reassignTargetCategory}
                  onChange={(e) => setReassignTargetCategory(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-medium text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                >
                  {categories
                    .filter((c) => c.id !== 'todos' && c.id !== categoryToDelete.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        Mover para: {cat.icon ? `${cat.icon} ` : ''}{cat.label}
                      </option>
                    ))}
                </select>
              </div>
            )}

            <p className="text-xs text-stone-600 leading-relaxed font-normal">
              Tem certeza que deseja excluir esta categoria? Ela será removida dos filtros principais do cardápio.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setCategoryToDelete(null)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  const label = categoryToDelete.label;
                  const id = categoryToDelete.id;
                  if (onDeleteCategory) {
                    onDeleteCategory(id, reassignTargetCategory);
                  }
                  if (editingCategory?.id === id) {
                    setEditingCategory(null);
                  }
                  setCategoryToDelete(null);
                  showToast(`Categoria "${label}" excluída!`);
                }}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Sim, Excluir Categoria</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CONFIRMATION MODAL: RESET TO DEFAULTS                        */}
      {/* ============================================================ */}
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-stone-950/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-6 border border-stone-200 space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-stone-900 text-base">
                  Restaurar Cardápio Oficial Naturalis Gourmet?
                </h3>
                <p className="text-xs text-stone-500 font-medium">
                  15 sabores padrão oficiais da Naturalis Gourmet.
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed font-normal bg-amber-50 p-3.5 rounded-2xl border border-amber-200/70">
              Esta ação sincroniza e redefine todos os sabores, categorias, preços e kits para o cardápio oficial padrão da <strong>Naturalis Gourmet</strong> (conforme https://naturalisgourmet.vercel.app/).
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-stone-100">
              <button
                type="button"
                onClick={() => setIsResetConfirmOpen(false)}
                className="px-4 py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetToDefaults();
                  setIsResetConfirmOpen(false);
                  showToast('Cardápio padrão da Naturalis Gourmet restaurado!');
                }}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all cursor-pointer active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Sim, Restaurar Cardápio Padrão</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
