import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Flame, 
  ArrowDown, 
  Phone, 
  ShieldCheck, 
  ArrowRight, 
  Star, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  ShoppingBag, 
  Eye, 
  Check, 
  Pause, 
  Play,
  Shuffle
} from 'lucide-react';
import { GeladinhoProduct, StoreSettings } from '../types';
import { formatCurrency } from '../utils/whatsapp';

export interface HeroBannerProps {
  storeSettings: StoreSettings;
  products?: GeladinhoProduct[];
  onAddToCart?: (product: GeladinhoProduct, quantity?: number) => void;
  onOpenProductDetails?: (product: GeladinhoProduct) => void;
  onScrollToCatalog: () => void;
  onScrollToCombos: () => void;
  onOpenQuiz: () => void;
}

interface DynamicBannerSlide {
  id: string;
  product: GeladinhoProduct;
  badgeLabel: string;
  titlePrefix: string;
  titleHighlight: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  volumeMl: number;
  rating: number;
  reviewsCount: number;
  highlights: string[];
  themeGlow: string;
  accentGradient: string;
  tagColor: string;
}

const getCategoryStyles = (category: string) => {
  switch (category) {
    case 'chocolatudos':
      return {
        themeGlow: 'from-amber-700/35 via-rose-600/20 to-transparent',
        accentGradient: 'from-amber-300 via-yellow-200 to-rose-300',
        tagColor: 'bg-amber-600 text-white',
        defaultBadge: 'CHOCOLATUDO GOURMET',
      };
    case 'frutas-ninho':
      return {
        themeGlow: 'from-pink-600/35 via-rose-500/20 to-transparent',
        accentGradient: 'from-pink-300 via-rose-200 to-amber-200',
        tagColor: 'bg-pink-600 text-white',
        defaultBadge: 'FRUTA & NINHO ARTESANAL',
      };
    case 'classicos-cremosos':
      return {
        themeGlow: 'from-blue-600/30 via-sky-500/20 to-transparent',
        accentGradient: 'from-sky-300 via-indigo-200 to-amber-100',
        tagColor: 'bg-sky-600 text-white',
        defaultBadge: 'CLÁSSICO CREMOSO',
      };
    case 'premium-especiais':
      return {
        themeGlow: 'from-emerald-600/35 via-teal-500/20 to-transparent',
        accentGradient: 'from-emerald-300 via-teal-200 to-amber-200',
        tagColor: 'bg-emerald-600 text-white',
        defaultBadge: 'EDIÇÃO ESPECIAL DO CHEF',
      };
    case 'fit-zero':
      return {
        themeGlow: 'from-teal-600/30 via-emerald-500/20 to-transparent',
        accentGradient: 'from-teal-300 via-emerald-200 to-lime-200',
        tagColor: 'bg-teal-600 text-white',
        defaultBadge: 'ZERO AÇÚCAR & FIT',
      };
    case 'alcoolicos':
      return {
        themeGlow: 'from-purple-600/35 via-indigo-500/20 to-transparent',
        accentGradient: 'from-purple-300 via-violet-200 to-rose-200',
        tagColor: 'bg-purple-600 text-white',
        defaultBadge: '18+ DRINK GOURMET',
      };
    default:
      return {
        themeGlow: 'from-rose-600/35 via-amber-500/20 to-transparent',
        accentGradient: 'from-rose-400 via-rose-200 to-amber-300',
        tagColor: 'bg-rose-500 text-white',
        defaultBadge: 'SABOR GOURMET',
      };
  }
};

export const HeroBanner: React.FC<HeroBannerProps> = ({
  storeSettings,
  products = [],
  onAddToCart,
  onOpenProductDetails,
  onScrollToCatalog,
  onScrollToCombos,
}) => {
  // STRICTLY use ONLY real products from the menu/cardápio
  const availableProducts = products.filter((p) => p.isAvailable !== false);
  const menuProducts = availableProducts.length > 0 ? availableProducts : products;

  // Build carousel slides purely from real menu items
  const slides: DynamicBannerSlide[] = menuProducts.map((prod) => {
    const styles = getCategoryStyles(prod.category);
    
    // Split product name nicely for visual hierarchy
    const nameParts = prod.name.split(/( com | & | e | - )/i);
    let titlePrefix = 'Geladinho Gourmet';
    let titleHighlight = prod.name;

    if (nameParts.length >= 3) {
      titlePrefix = nameParts[0] + nameParts[1];
      titleHighlight = nameParts.slice(2).join('');
    } else {
      const words = prod.name.split(' ');
      if (words.length > 1) {
        titlePrefix = words.slice(0, Math.ceil(words.length / 2)).join(' ');
        titleHighlight = words.slice(Math.ceil(words.length / 2)).join(' ');
      }
    }

    const badgeText = prod.badges && prod.badges.length > 0 
      ? `✨ ${prod.badges[0].toUpperCase()}`
      : `✨ ${styles.defaultBadge}`;

    const highlights = prod.ingredients && prod.ingredients.length > 0
      ? prod.ingredients.slice(0, 3)
      : prod.tagline ? [prod.tagline, 'Receita Artesanal'] : ['100% Artesanal', 'Sem Conservantes'];

    return {
      id: prod.id,
      product: prod,
      badgeLabel: badgeText,
      titlePrefix,
      titleHighlight,
      description: prod.description || prod.tagline || 'Receita artesanal preparada com ingredientes nobres e muito carinho.',
      price: prod.price,
      originalPrice: prod.originalPrice,
      image: prod.image,
      volumeMl: prod.volumeMl || 150,
      rating: prod.rating || 5.0,
      reviewsCount: prod.reviewsCount || 42,
      highlights,
      themeGlow: styles.themeGlow,
      accentGradient: styles.accentGradient,
      tagColor: styles.tagColor,
    };
  });

  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [addedFeedback, setAddedFeedback] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const SLIDE_DURATION = 4200; // 4.2 seconds for dynamic auto-rotation
  const TICK_INTERVAL = 50; // Progress bar tick

  // Helper to pick random next slide without repeating consecutive item
  const getRandomNextIndex = (currentIndex: number, totalSlides: number): number => {
    if (totalSlides <= 1) return 0;
    if (totalSlides === 2) return currentIndex === 0 ? 1 : 0;

    let nextIdx = Math.floor(Math.random() * totalSlides);
    let attempts = 0;
    while (nextIdx === currentIndex && attempts < 15) {
      nextIdx = Math.floor(Math.random() * totalSlides);
      attempts++;
    }
    return nextIdx;
  };

  // Keep index within safe bounds if products are deleted/added
  const safeIndex = slides.length > 0 ? currentSlideIndex % slides.length : 0;
  const currentSlide = slides[safeIndex];

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      setTouchStartX(e.touches[0].clientX);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || e.changedTouches.length === 0) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX - touchEndX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        // Swiped left -> Next
        handleNextSlide();
      } else {
        // Swiped right -> Prev
        handlePrevSlide();
      }
    }
    setTouchStartX(null);
  };

  // Automatic random rotation and progress bar loop
  useEffect(() => {
    if (isPaused || slides.length <= 1) {
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (TICK_INTERVAL / SLIDE_DURATION) * 100;
        if (next >= 100) {
          setCurrentSlideIndex((curr) => getRandomNextIndex(curr, slides.length));
          return 0;
        }
        return next;
      });
    }, TICK_INTERVAL);

    return () => clearInterval(interval);
  }, [isPaused, slides.length]);

  const handleNextSlide = () => {
    setProgress(0);
    setCurrentSlideIndex((prev) => getRandomNextIndex(prev, slides.length));
  };

  const handlePrevSlide = () => {
    setProgress(0);
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleShuffleSlide = () => {
    setProgress(0);
    setCurrentSlideIndex((curr) => getRandomNextIndex(curr, slides.length));
  };

  const handleSelectSlide = (idx: number) => {
    setProgress(0);
    setCurrentSlideIndex(idx);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSlide?.product && onAddToCart) {
      onAddToCart(currentSlide.product, 1);
      setAddedFeedback(currentSlide.product.id);
      setTimeout(() => setAddedFeedback(null), 1800);
    }
  };

  const handleOpenDetailsClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentSlide?.product && onOpenProductDetails) {
      onOpenProductDetails(currentSlide.product);
    } else if (onScrollToCatalog) {
      onScrollToCatalog();
    }
  };

  // Mini spotlights display ONLY the other real menu items from cardápio
  const spotlightProducts = menuProducts
    .filter((p) => p.id !== currentSlide?.id)
    .slice(0, 5);

  if (!currentSlide) {
    return null;
  }

  return (
    <section className="pt-2 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Live Social Proof / Store Activity Ticker */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 text-white rounded-2xl border border-stone-800 shadow-xs text-xs">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-stone-200">
            Cozinha Gourmet em Produção a Todo Vapor!
          </span>
        </div>
        <div className="flex items-center gap-4 text-stone-400 font-medium">
          <span className="hidden sm:inline-flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <strong className="text-white">4.9/5.0</strong> (+1.2k avaliações)
          </span>
          <span className="hidden md:inline text-stone-600">•</span>
          <span className="flex items-center gap-1 text-emerald-400 font-semibold">
            <Clock className="w-3.5 h-3.5" />
            Entrega express média: <strong>25-35 min</strong>
          </span>
        </div>
      </div>

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* ============================================================ */}
        {/* 1. BANNER ROTATIVO (Exibe APENAS os itens reais do cardápio)  */}
        {/* ============================================================ */}
        <div 
          className="md:col-span-2 lg:col-span-2 lg:row-span-2 bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 rounded-3xl p-4 sm:p-7 text-white flex flex-col justify-between shadow-2xl shadow-stone-950/30 border border-stone-800/90 relative overflow-hidden group select-none transition-all touch-pan-y"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Dynamic Ambient Glow lights matched to current item flavor */}
          <div 
            className={`absolute -top-32 -right-32 w-96 h-96 bg-gradient-to-br ${currentSlide.themeGlow} rounded-full blur-3xl pointer-events-none transition-all duration-700 opacity-70 group-hover:opacity-90`} 
          />
          <div 
            className="absolute -bottom-32 -left-32 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none group-hover:bg-amber-500/25 transition-all duration-700" 
          />
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff0a_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none opacity-40" />

          {/* Autoplay Slide Progress Bar at Top */}
          {slides.length > 1 && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 overflow-hidden z-20">
              <div 
                className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-rose-400 transition-all duration-75 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Top Row: Badges & Controls */}
          <div className="relative z-10 flex items-center justify-between gap-2 mb-3 pt-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider shadow-xs shadow-rose-600/30 ${currentSlide.tagColor}`}>
                <Sparkles className="w-3 h-3" />
                {currentSlide.badgeLabel}
              </span>
              <span className="bg-white/10 text-stone-300 backdrop-blur-md px-2.5 py-0.5 rounded-full text-[10px] font-semibold border border-white/15 hidden sm:inline-block">
                Receita Artesanal Nobre
              </span>
            </div>

            {/* Carousel Navigation Controls (Visible if more than 1 item) */}
            {slides.length > 1 && (
              <div className="flex items-center gap-1 bg-white/10 backdrop-blur-md p-1 rounded-xl border border-white/15 shrink-0">
                <button
                  type="button"
                  onClick={handlePrevSlide}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer active:scale-90"
                  aria-label="Sabor Anterior"
                  title="Sabor Anterior"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setIsPaused(!isPaused)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer"
                  aria-label={isPaused ? "Retomar rotação automática aleatória" : "Pausar rotação"}
                  title={isPaused ? "Retomar rotação automática aleatória" : "Pausar rotação"}
                >
                  {isPaused ? <Play className="w-3 h-3 text-amber-300 fill-amber-300" /> : <Pause className="w-3 h-3" />}
                </button>

                <button
                  type="button"
                  onClick={handleShuffleSlide}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-rose-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer active:scale-90 bg-rose-500/20"
                  aria-label="Sortear Outro Sabor Aleatório"
                  title="Sortear Outro Sabor Aleatório"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={handleNextSlide}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-stone-300 hover:text-white hover:bg-white/20 transition-all cursor-pointer active:scale-90"
                  aria-label="Próximo Sabor Aleatório"
                  title="Próximo Sabor Aleatório"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Main Slide Content: Split between Typography and Featured Image */}
          <div key={currentSlide.id} className="relative z-10 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center my-auto py-2 animate-in fade-in duration-300">
            
            {/* Left side text & highlights (sm:col-span-7) */}
            <div className="sm:col-span-7 flex flex-col justify-center">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-[1.1] tracking-tight">
                {currentSlide.titlePrefix} <br />
                <span className={`text-transparent bg-clip-text bg-gradient-to-r ${currentSlide.accentGradient}`}>
                  {currentSlide.titleHighlight}
                </span>
              </h1>

              <p className="mt-2.5 text-xs sm:text-sm text-stone-300 font-normal leading-relaxed line-clamp-3">
                {currentSlide.description}
              </p>

              {/* Ingredient Highlight Chips */}
              <div className="mt-3 flex flex-wrap gap-1.5">
                {currentSlide.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-semibold bg-white/8 hover:bg-white/15 text-stone-200 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-xs transition-colors"
                  >
                    • {h}
                  </span>
                ))}
              </div>

              {/* Direct Add to Cart & Details Action Buttons */}
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleAddToCartClick}
                  className={`px-4 py-2.5 rounded-xl font-extrabold text-xs shadow-lg active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer ${
                    addedFeedback === currentSlide.id
                      ? 'bg-emerald-500 text-white shadow-emerald-500/40'
                      : 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/30'
                  }`}
                  id="hero-slide-add-cart-btn"
                >
                  {addedFeedback === currentSlide.id ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Adicionado à Sacola!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Adicionar à Sacola</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleOpenDetailsClick}
                  className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
                  title="Ver ingredientes, tabela e avaliações"
                >
                  <Eye className="w-3.5 h-3.5 text-stone-300" />
                  <span>Ver Detalhes</span>
                </button>

                <button
                  type="button"
                  onClick={onScrollToCatalog}
                  className="px-3 py-2.5 rounded-xl bg-transparent hover:bg-white/10 text-stone-300 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <span>Cardápio</span>
                  <ArrowDown className="w-3 h-3 text-stone-400" />
                </button>
              </div>
            </div>

            {/* Right side Featured Flavor Image with Glassmorphism Card (sm:col-span-5) */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center relative">
              <div 
                onClick={handleOpenDetailsClick}
                className="relative w-full max-w-[220px] aspect-square rounded-2xl overflow-hidden border-2 border-white/20 shadow-2xl shadow-black/60 group/img cursor-pointer transition-transform duration-500 hover:scale-105"
              >
                <img
                  src={currentSlide.image}
                  alt={currentSlide.product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                  referrerPolicy="no-referrer"
                />

                {/* Glassy rating badge overlay */}
                <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-amber-300 px-2 py-0.5 rounded-lg border border-white/20 text-[10px] font-black flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  <span>{currentSlide.rating.toFixed(1)}</span>
                </div>

                <div className="absolute bottom-2 left-2 bg-black/60 backdrop-blur-md text-stone-200 px-2 py-0.5 rounded-lg border border-white/20 text-[10px] font-bold">
                  {currentSlide.volumeMl}ml Gourmet
                </div>
              </div>
            </div>

          </div>

          {/* Pricing bar & Slide Selector Dots */}
          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-white/10 mt-3">
            {/* Price block */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white">
                {formatCurrency(currentSlide.price)}
              </span>
              {currentSlide.originalPrice && currentSlide.originalPrice > currentSlide.price && (
                <span className="text-xs font-semibold line-through text-stone-400">
                  {formatCurrency(currentSlide.originalPrice)}
                </span>
              )}
              {currentSlide.originalPrice && currentSlide.originalPrice > currentSlide.price && (
                <span className="text-[10px] font-extrabold text-amber-300 bg-amber-500/20 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  -{Math.round(((currentSlide.originalPrice - currentSlide.price) / currentSlide.originalPrice) * 100)}%
                </span>
              )}
            </div>

            {/* Interactive Slide Selector Pills (Clickable) */}
            {slides.length > 1 && (
              <div className="flex items-center gap-1.5">
                {slides.map((s, idx) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleSelectSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      safeIndex === idx
                        ? 'w-7 bg-rose-500 shadow-xs shadow-rose-500/50'
                        : 'w-2 bg-white/30 hover:bg-white/60'
                    }`}
                    aria-label={`Ir para sabor ${s.product.name}`}
                    title={s.product.name}
                  />
                ))}
              </div>
            )}

            {/* Quick Tag status */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-500/15 border border-emerald-500/25 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Pronta Entrega
              </span>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 2. ATENDIMENTO WHATSAPP INSTANTÂNEO CARD                     */}
        {/* ============================================================ */}
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-950 via-stone-900 to-emerald-950 rounded-3xl p-6 border border-emerald-800/40 text-white flex items-center justify-between shadow-xl shadow-emerald-950/20 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-700" />
          
          <div className="flex flex-col pr-4 relative z-10">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] uppercase font-black text-emerald-300 tracking-wider">
                Atendimento Instantâneo
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Faça seu Pedido
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm mt-1 max-w-sm font-normal">
              Monte sua sacola no cardápio ou envie mensagem direta para nosso atendente: <strong className="text-emerald-300 font-mono font-bold">({storeSettings.whatsappNumber})</strong>
            </p>

            <div className="flex items-center gap-3 mt-3">
              <button
                type="button"
                onClick={onScrollToCombos}
                className="text-xs font-bold text-emerald-300 hover:text-emerald-200 flex items-center gap-1 underline underline-offset-4 cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Ver Kits & Combos Promocionais
              </button>
            </div>
          </div>

          <a
            href={`https://wa.me/${storeSettings.whatsappNumber}?text=${encodeURIComponent('Olá! Gostaria de fazer um pedido de geladinhos gourmet.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-emerald-500 hover:bg-emerald-400 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/40 shrink-0 active:scale-95 transition-all relative z-10 group-hover:scale-105 cursor-pointer"
            aria-label="Abrir WhatsApp"
            title="Abrir WhatsApp da Loja"
          >
            <Phone className="w-7 h-7 text-emerald-950" />
          </a>
        </div>

        {/* ============================================================ */}
        {/* 3. FAST DELIVERY & THERMAL GUARANTEE CARD                    */}
        {/* ============================================================ */}
        <div className="bg-white rounded-3xl p-6 border border-stone-200/80 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-[10px] uppercase font-black text-stone-500 tracking-wider">
                Garantia de Qualidade
              </span>
            </div>
            <h3 className="text-lg font-black text-stone-900 leading-snug mb-1">
              Entrega Rápida & Congelada
            </h3>
            <p className="text-xs text-stone-500 leading-relaxed font-normal">
              Enviamos em caixas e bolsas térmicas lacradas para você saborear na consistência perfeita.
            </p>
          </div>

          <div className="flex items-center gap-2 pt-4 border-t border-stone-100 text-xs font-bold text-stone-800">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>100% Congelado na sua porta</span>
          </div>
        </div>

        {/* ============================================================ */}
        {/* 4 to 8. MINI SPOTLIGHTS (Exibe APENAS outros itens do cardápio) */}
        {/* ============================================================ */}
        {spotlightProducts.map((prod) => {
          const isAdded = addedFeedback === prod.id;

          return (
            <div 
              key={prod.id}
              onClick={() => {
                if (onOpenProductDetails) onOpenProductDetails(prod);
                else onScrollToCatalog();
              }}
              className="bg-white rounded-3xl p-5 border border-stone-200/80 flex flex-col justify-between shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <img
                  src={prod.image}
                  alt={prod.name}
                  className="w-10 h-10 rounded-xl object-cover border border-stone-200 group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[10px] font-bold bg-rose-50 text-rose-600 px-2.5 py-0.5 rounded-full border border-rose-100/60">
                  {prod.badges?.[0] || 'Gourmet'}
                </span>
              </div>

              <div>
                <h4 className="font-extrabold text-sm text-stone-900 group-hover:text-rose-600 transition-colors line-clamp-1">
                  {prod.name}
                </h4>
                <p className="text-xs text-stone-500 line-clamp-1 mt-0.5 font-normal">
                  {prod.tagline || prod.description}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-stone-100">
                <span className="text-xs font-black text-stone-900">
                  {formatCurrency(prod.price)}
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) {
                        onAddToCart(prod, 1);
                        setAddedFeedback(prod.id);
                        setTimeout(() => setAddedFeedback(null), 1800);
                      }
                    }}
                    className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      isAdded 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200'
                    }`}
                    title="Adicionar à sacola"
                  >
                    {isAdded ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </button>

                  <span className="text-xs font-bold text-rose-600 flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    Ver <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            </div>
          );
        })}

      </div>
    </section>
  );
};
