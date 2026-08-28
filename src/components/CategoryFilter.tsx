import React from 'react';
import { Search, X, SlidersHorizontal, Sparkles, Check, ArrowUpDown } from 'lucide-react';
import { ProductCategory, CategoryItem } from '../types';
import { CATEGORIES_DATA } from '../data/products';

interface CategoryFilterProps {
  categories?: CategoryItem[];
  activeCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedTag: string | null;
  onSelectTag: (tag: string | null) => void;
  sortBy: 'popular' | 'price-asc' | 'price-desc' | 'name';
  onSortChange: (sort: 'popular' | 'price-asc' | 'price-desc' | 'name') => void;
  categoryCounts: Record<string, number>;
  totalResultsCount: number;
}

const QUICK_TAGS = [
  { id: 'Mais Vendido', label: '⭐ Mais Vendidos' },
  { id: 'Nutella Pura', label: '🌰 Nutella Original' },
  { id: 'Fruta de Verdade', label: '🍓 Frutas Naturais' },
  { id: 'Zero Açúcar', label: '🌿 Fit & Zero Açúcar' },
  { id: 'Contém Álcool', label: '🍸 Drinks 18+' },
  { id: 'Cremoso', label: '🥛 Super Cremosos' }
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories = CATEGORIES_DATA,
  activeCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  sortBy,
  onSortChange,
  categoryCounts,
  totalResultsCount,
}) => {
  // Ensure "todos" is present as the first category item
  const displayCategories = React.useMemo(() => {
    const list = [...categories];
    if (!list.some(c => c.id === 'todos')) {
      list.unshift({ id: 'todos', label: 'Todos os Sabores' });
    }
    return list;
  }, [categories]);

  return (
    <div id="secao-catalogo" className="pt-6 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto scroll-mt-20">
      {/* Title & Section intro */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 text-rose-600 border border-rose-100 text-xs font-black uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            <span>Cardápio Completo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-stone-900 tracking-tight">
            Nossos Sabores Gourmet
          </h2>
          <p className="text-sm text-stone-500 mt-1 font-normal">
            Selecione uma categoria, busque por ingredientes ou filtre por sua preferência.
          </p>
        </div>

        {/* Results Counter & Sort */}
        <div className="flex items-center gap-3">
          <span className="text-xs text-stone-500 font-medium">
            Exibindo <strong className="text-stone-900 font-bold">{totalResultsCount}</strong> sabores
          </span>

          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value as any)}
              className="appearance-none bg-white border border-stone-200/90 text-stone-800 text-xs font-bold rounded-2xl pl-8 pr-8 py-2.5 hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 cursor-pointer shadow-xs transition-all"
              aria-label="Ordenar sabores"
            >
              <option value="popular">Mais Populares</option>
              <option value="price-asc">Menor Preço</option>
              <option value="price-desc">Maior Preço</option>
              <option value="name">Nome (A - Z)</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Search Bar and Filters Row */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-5">
        {/* Search Input */}
        <div className="md:col-span-8 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por sabor, fruta ou ingrediente (ex: Nutella, Morango, Pistache, Fit)..."
            className="w-full bg-white border border-stone-200/90 rounded-2xl pl-11 pr-10 py-3.5 text-xs sm:text-sm font-medium text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 shadow-xs transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 cursor-pointer"
              aria-label="Limpar busca"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Filter Reset if active */}
        <div className="md:col-span-4 flex items-center justify-end">
          {(searchQuery || selectedTag || activeCategory !== 'todos') && (
            <button
              onClick={() => {
                onSearchChange('');
                onSelectTag(null);
                onSelectCategory('todos');
              }}
              className="w-full md:w-auto px-4 py-3.5 text-xs font-bold text-rose-600 bg-rose-50 hover:bg-rose-100/80 border border-rose-200 rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
            >
              <X className="w-3.5 h-3.5" />
              <span>Limpar Filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills (Horizontal Scrollable) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {displayCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          const count = cat.id === 'todos' 
            ? Object.values(categoryCounts).reduce<number>((a, b) => a + Number(b), 0)
            : categoryCounts[cat.id] || 0;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id as ProductCategory)}
              className={`flex items-center gap-2 px-4.5 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
                isActive
                  ? 'bg-stone-900 text-white shadow-lg shadow-stone-900/15'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border border-stone-200/80 shadow-xs'
              }`}
            >
              <span>{cat.label}</span>
              <span
                className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Quick Tag Chips Row */}
      <div className="flex items-center gap-2 flex-wrap pt-3">
        <span className="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
          <SlidersHorizontal className="w-3 h-3 text-stone-400" />
          Filtros rápidos:
        </span>
        {QUICK_TAGS.map((tag) => {
          const isSelected = selectedTag === tag.id;
          return (
            <button
              key={tag.id}
              onClick={() => onSelectTag(isSelected ? null : tag.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                isSelected
                  ? 'bg-gradient-to-r from-rose-600 to-rose-500 text-white shadow-sm shadow-rose-500/20'
                  : 'bg-white hover:bg-stone-50 text-stone-600 border border-stone-200/80 shadow-xs'
              }`}
            >
              {isSelected && <Check className="w-3 h-3 text-white" />}
              <span>{tag.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
