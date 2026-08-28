import { GeladinhoProduct, PromoCombo, NeighborhoodFee, StoreSettings, CustomerReview, CategoryItem } from '../types';

export const DEFAULT_CATEGORIES_DATA: CategoryItem[] = [
  {
    id: "todos",
    label: "Todos os Sabores",
    icon: "Sparkles",
    color: "from-amber-500 to-rose-500",
    description: "Todos os geladinhos do cardápio"
  },
  {
    id: "classicos-cremosos",
    label: "Clássicos Cremosos",
    icon: "Milk",
    color: "from-amber-400 to-orange-400",
    description: "Receitas tradicionais com cremosidade sem igual"
  },
  {
    id: "alcoolicos",
    label: "Alcoólicos (18+)",
    icon: "Wine",
    color: "from-purple-600 to-indigo-600",
    description: "Receitas exclusivas de drinks para maiores de 18 anos"
  }
];

export const CATEGORIES_DATA = DEFAULT_CATEGORIES_DATA;

export const PRODUCTS_DATA: GeladinhoProduct[] = [
  {
    id: "sabor-1787757735535",
    name: "Maracuja Cremoso",
    category: "classicos-cremosos",
    tagline: "Leite integral, açúcar cristal, leite em pó, polpa de frutas natural, aromatizante em pó, liga neutra, emulsificante para sorvete",
    description: "Delicioso geladinho artesanal de maracujá feito com polpa natural e base super cremosa.",
    price: 7.5,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQN8eyfMapjBB_Bm4-YLEsXtWqTwVU5VUwnPMOBBfVgtA&s=10",
    badges: [
      "Novidade",
      "Fruta de Verdade",
      "Mais Vendido"
    ],
    ingredients: [
      "Leite integral",
      "açúcar cristal",
      "leite em pó",
      "polpa de frutas natural",
      "aromatizante em pó",
      "liga neutra",
      "emulsificante para sorvete"
    ],
    allergens: [
      "Contém Leite"
    ],
    volumeMl: 150,
    isAvailable: true,
    stockQuantity: 20,
    trackStock: true,
    minStockAlert: 5,
    rating: 5,
    reviewsCount: 1,
    flavorProfile: {
      sweetness: 4,
      creaminess: 4,
      fruitiness: 3
    }
  },
  {
    id: "sabor-1787757625732",
    name: "Abacaxi Cremoso",
    category: "classicos-cremosos",
    tagline: "Leite integral, açúcar cristal, leite em pó, polpa de frutas natural, aromatizante em pó, liga neutra, emulsificante para sorvete",
    description: "Sabor refrescante e aveludado de abacaxi com leite e ingredientes nobres.",
    price: 5.5,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR9X6JPsITt40iRKw5CwNZC8Skfv2-3zyuhn-a5awlwQA&s=10",
    badges: [
      "Novidade",
      "Fruta de Verdade"
    ],
    ingredients: [
      "Leite integral",
      "açúcar cristal",
      "leite em pó",
      "polpa de frutas natural",
      "aromatizante em pó",
      "liga neutra",
      "emulsificante para sorvete"
    ],
    allergens: [
      "Contém Leite"
    ],
    volumeMl: 150,
    isAvailable: true,
    stockQuantity: 20,
    trackStock: true,
    minStockAlert: 5,
    rating: 5,
    reviewsCount: 1,
    flavorProfile: {
      sweetness: 4,
      creaminess: 4,
      fruitiness: 3
    }
  },
  {
    id: "sabor-1787757240713",
    name: "Açai Cremoso",
    category: "classicos-cremosos",
    tagline: "Leite, açúcar cristal, polpa de frutas natural, aromatizante em pó, Super Liga Neutra, emulsificante para sorvete",
    description: "Energia e muito sabor com açaí de verdade em uma textura aveludada incomparável.",
    price: 8,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT4R-reLnUHV6m5fTGudkyzkmT7K5hPrZNwt4ZfxeKLnA&s=10",
    badges: [
      "Novidade",
      "Fruta de Verdade",
      "Destaque Chef"
    ],
    ingredients: [
      "Leite",
      "açúcar cristal",
      "polpa de frutas natural",
      "aromatizante em pó",
      "Super Liga Neutra",
      "emulsificante para sorvete"
    ],
    allergens: [
      "Contém Leite"
    ],
    volumeMl: 150,
    isAvailable: true,
    stockQuantity: 20,
    trackStock: true,
    minStockAlert: 5,
    rating: 5,
    reviewsCount: 1,
    flavorProfile: {
      sweetness: 4,
      creaminess: 4,
      fruitiness: 3
    }
  },
  {
    id: "sabor-1787591886792",
    name: "Limão Cremoso",
    category: "classicos-cremosos",
    tagline: "Leite integral, açúcar cristal, leite em pó, polpa de frutas natural, aromatizante em pó, liga neutra, emulsificante para sorvete",
    description: "O equilíbrio perfeito entre o cítrico e a cremosidade do leite.",
    price: 5,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbPyAMzmKT4TGxGq5y_CFkYz6MKRQaLFA0p3jONemLSg&s=10",
    badges: [
      "Novidade",
      "Fruta de Verdade"
    ],
    ingredients: [
      "Leite integral",
      "açúcar cristal",
      "leite em pó",
      "polpa de frutas natural",
      "aromatizante em pó",
      "liga neutra",
      "emulsificante para sorvete"
    ],
    allergens: [
      "Contém Leite"
    ],
    volumeMl: 150,
    isAvailable: true,
    stockQuantity: 20,
    trackStock: true,
    minStockAlert: 5,
    rating: 5,
    reviewsCount: 1,
    flavorProfile: {
      sweetness: 4,
      creaminess: 5,
      fruitiness: 3
    }
  },
  {
    id: "sabor-1787591844589",
    name: "Uva Cremoso",
    category: "classicos-cremosos",
    tagline: "Leite integral, açúcar cristal, leite em pó, polpa de frutas natural, aromatizante em pó, liga neutra, emulsificante para sorvete",
    description: "Suco natural de uva concentrado com leite e cremosidade sem igual.",
    price: 5,
    image: "https://i.ytimg.com/vi/CZrEKACK17M/maxresdefault.jpg",
    badges: [
      "Novidade",
      "Fruta de Verdade"
    ],
    ingredients: [
      "Leite integral",
      "açúcar cristal",
      "leite em pó",
      "polpa de frutas natural",
      "aromatizante em pó",
      "liga neutra",
      "emulsificante para sorvete"
    ],
    allergens: [
      "Contém Leite"
    ],
    volumeMl: 150,
    isAvailable: true,
    stockQuantity: 20,
    trackStock: true,
    minStockAlert: 5,
    rating: 5,
    reviewsCount: 1,
    flavorProfile: {
      sweetness: 4,
      creaminess: 4,
      fruitiness: 3
    }
  },
  {
    id: "sabor-1787591685895",
    name: "Tamarindo Cremoso",
    category: "classicos-cremosos",
    tagline: "Leite integral, açúcar cristal, leite em pó, polpa de frutas natural, aromatizante em pó, liga neutra, emulsificante para sorvete",
    description: "Sabor exótico, refrescante e marcante de tamarindo com base cremosa artesanal.",
    price: 5,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQOSLgUewMAVUzmGObyW8Go3FLxHAafmbHJGBT3DkkN8Q&s",
    badges: [
      "Novidade",
      "Fruta de Verdade"
    ],
    ingredients: [
      "Leite integral",
      "açúcar cristal",
      "leite em pó",
      "polpa de frutas natural",
      "aromatizante em pó",
      "liga neutra",
      "emulsificante para sorvete"
    ],
    allergens: [
      "Contém Leite"
    ],
    volumeMl: 150,
    isAvailable: true,
    stockQuantity: 20,
    trackStock: true,
    minStockAlert: 5,
    rating: 5,
    reviewsCount: 1,
    flavorProfile: {
      sweetness: 4,
      creaminess: 4,
      fruitiness: 3
    }
  },
  {
    id: "sabor-1787591632937",
    name: "Manga Cremoso",
    category: "classicos-cremosos",
    tagline: "Leite integral, açúcar cristal, leite em pó, polpa de frutas natural, aromatizante em pó, liga neutra, emulsificante para sorvete",
    description: "Polpa pura de manga doce e suculenta em uma textura sedosa.",
    price: 5.5,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR3DkI_z62JLLvIXEMqluGtBXSPjb90obz-zcsrUSeyag&s=10",
    badges: [
      "Novidade",
      "Fruta de Verdade"
    ],
    ingredients: [
      "Leite integral",
      "açúcar cristal",
      "leite em pó",
      "polpa de frutas natural",
      "aromatizante em pó",
      "liga neutra",
      "emulsificante para sorvete"
    ],
    allergens: [
      "Contém Leite"
    ],
    volumeMl: 150,
    isAvailable: true,
    stockQuantity: 20,
    trackStock: true,
    minStockAlert: 5,
    rating: 5,
    reviewsCount: 1,
    flavorProfile: {
      sweetness: 4,
      creaminess: 4,
      fruitiness: 3
    }
  },
  {
    id: "sabor-1787591516910",
    name: "Goiaba Cremoso",
    category: "classicos-cremosos",
    tagline: "Leite integral, açúcar cristal, leite em pó, polpa de frutas natural, aromatizante em pó, liga neutra, emulsificante para sorvete",
    description: "A clássica goiaba com textura suave e aroma irresistível.",
    price: 5,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTvEK0kK5Eo_KqneiVAz_k-P7L6kD1upE7YFnqu10UwQA&s=10",
    badges: [
      "Novidade",
      "Fruta de Verdade"
    ],
    ingredients: [
      "Leite integral",
      "açúcar cristal",
      "leite em pó",
      "polpa de frutas natural",
      "aromatizante em pó",
      "liga neutra",
      "emulsificante para sorvete"
    ],
    allergens: [
      "Contém Leite"
    ],
    volumeMl: 150,
    isAvailable: true,
    stockQuantity: 20,
    trackStock: true,
    minStockAlert: 5,
    rating: 5,
    reviewsCount: 1,
    flavorProfile: {
      sweetness: 4,
      creaminess: 4,
      fruitiness: 3
    }
  },
  {
    id: "sabor-1787591421640",
    name: "Acerola Cremoso",
    category: "classicos-cremosos",
    tagline: "Leite integral, açúcar cristal, leite em pó, polpa de frutas natural, aromatizante em pó, liga neutra, emulsificante para sorvete",
    description: "Muita vitamina C e sabor marcante de acerola fresca batida com leite.",
    price: 5,
    image: "https://i.ytimg.com/vi/BKuGeiqzNwg/hq720.jpg?sqp=-oaymwEhCK4FEIIDSFryq4qpAxMIARUAAAAAGAElAADIQj0AgKJD&rs=AOn4CLDlSkt8nEcJrQ_BX7mkac5LCzJxpA",
    badges: [
      "Novidade",
      "Fruta de Verdade"
    ],
    ingredients: [
      "Leite integral",
      "açúcar cristal",
      "leite em pó",
      "polpa de frutas natural",
      "aromatizante em pó",
      "liga neutra",
      "emulsificante para sorvete"
    ],
    allergens: [
      "Contém Leite"
    ],
    volumeMl: 150,
    isAvailable: true,
    stockQuantity: 20,
    trackStock: true,
    minStockAlert: 5,
    rating: 5,
    reviewsCount: 1,
    flavorProfile: {
      sweetness: 4,
      creaminess: 4,
      fruitiness: 3
    }
  },
  {
    id: "sabor-1787589232301",
    name: "Caju Cremoso",
    category: "classicos-cremosos",
    tagline: "Leite integral, açúcar cristal, leite em pó, polpa de frutas natural, aromatizante em pó, liga neutra, emulsificante para sorvete",
    description: "Sabor autêntico e perfumado de caju com doçura na medida certa.",
    price: 5,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUwzDSf97nR3rSvGlHOTmcifKnaJqK7_TrWw5yeD8thw&s=10",
    badges: [
      "Novidade",
      "Fruta de Verdade"
    ],
    ingredients: [
      "Leite integral",
      "açúcar cristal",
      "leite em pó",
      "polpa de frutas natural",
      "aromatizante em pó",
      "liga neutra",
      "emulsificante para sorvete"
    ],
    allergens: [
      "Contém Leite"
    ],
    volumeMl: 150,
    isAvailable: true,
    stockQuantity: 20,
    trackStock: true,
    minStockAlert: 5,
    rating: 5,
    reviewsCount: 1,
    flavorProfile: {
      sweetness: 4,
      creaminess: 4,
      fruitiness: 3
    }
  },
  {
    id: "sabor-1787581082471",
    name: "Morango Cremoso",
    category: "classicos-cremosos",
    tagline: "Leite integral, açúcar cristal, leite em pó, polpa de frutas natural, aromatizante em pó, liga neutra, emulsificante para sorvete",
    description: "O queridinho tradicional de morango com leite condensado e polpa de morango.",
    price: 5.5,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTF3UN4OYu6yjrbsro7QcHFn2oxVD207PcrUqHxhOfSFQ&s=10",
    badges: [
      "Novidade",
      "Fruta de Verdade"
    ],
    ingredients: [
      "Leite integral",
      "açúcar cristal",
      "leite em pó",
      "polpa de frutas natural",
      "aromatizante em pó",
      "liga neutra",
      "emulsificante para sorvete"
    ],
    allergens: [
      "Contém Leite"
    ],
    volumeMl: 150,
    isAvailable: true,
    stockQuantity: 20,
    trackStock: true,
    minStockAlert: 5,
    rating: 5,
    reviewsCount: 1,
    flavorProfile: {
      sweetness: 4,
      creaminess: 4,
      fruitiness: 3
    }
  }
];

export const PROMO_COMBOS_DATA: PromoCombo[] = [
  {
    id: "combo-1787592027401",
    title: "Kit Promocional Especial ",
    subtitle: "Escolha seus sabores favoritos",
    description: "Kit econômico com unidades selecionadas e embalagem térmica protetora.",
    itemsCount: 4,
    price: 16,
    originalPrice: 20,
    image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVxZoQuTZBfjk0XS5wO8efwEgNaq1xgXUF1qCc2SblNQ&s=10",
    badge: "Super Promoção",
    includesThermalBag: true,
    isCustomizable: true
  }
];

export const DEFAULT_NEIGHBORHOODS_DATA: NeighborhoodFee[] = [
  { id: 'bairro-centro', name: 'Centro', fee: 4.00, estimatedTimeMin: 25, isActive: true, notes: 'Região central de Olímpia' },
  { id: 'bairro-aeroporto', name: 'Aeroporto', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-alto-cote-gil', name: 'Alto Cote Gil', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-beneficencia', name: 'Beneficência', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-cohab-1', name: 'Conjunto Habitacional Antônio José Trindade (Cohab I)', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-cohab-2', name: 'Conjunto Habitacional Hélio Cazarini (Cohab II)', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-cohab-3', name: 'Conjunto Habitacional Alberto Zacarelli (Cohab III)', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-cohab-4', name: 'Jardim Alfredo Zucca (Cohab IV)', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-di-vitoria', name: 'Di Vitória Condominium', fee: 5.00, estimatedTimeMin: 35, isActive: true },
  { id: 'bairro-dist-alvaro-britto', name: 'Distrito Industrial Álvaro Britto', fee: 5.00, estimatedTimeMin: 35, isActive: true },
  { id: 'bairro-dist-issao-nakamura', name: 'Distrito Industrial Issao Nakamura', fee: 5.50, estimatedTimeMin: 35, isActive: true },
  { id: 'bairro-fazenda-cruz-alta', name: 'Fazenda Cruz Alta', fee: 6.00, estimatedTimeMin: 40, isActive: true },
  { id: 'bairro-jd-alvorada', name: 'Jardim Alvorada', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-amelia-dionisio', name: 'Jardim Amélia Dionísio', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-blanco', name: 'Jardim Blanco', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-boa-esperanca', name: 'Jardim Boa Esperança', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-borges', name: 'Jardim Borges', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-botanico', name: 'Jardim Botânico', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-campo-belo', name: 'Jardim Campo Belo', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-cecap', name: 'Jardim Cecap', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-centenario', name: 'Jardim Centenário', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-centerville', name: 'Jardim Centerville', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-cisoto', name: 'Jardim Cisoto', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-colorado', name: 'Jardim Colorado', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-dos-laranjais', name: 'Jardim dos Laranjais', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-esperandio', name: 'Jardim Esperandio Christófolo', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-ferreira', name: 'Jardim Ferreira', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-garcez', name: 'Jardim Garcez', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-gloria', name: 'Jardim Glória', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-helio-cazarini', name: 'Jardim Hélio Cazarini', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-joaquim-pereira', name: 'Jardim Joaquim Antonio Pereira', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-leonor', name: 'Jardim Leonor', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-luiza', name: 'Jardim Luíza', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-luiz-zucca', name: 'Jardim Luiz Zucca', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-manzoli', name: 'Jardim Manzoli', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-maria', name: 'Jardim Maria', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-menina-moca-1', name: 'Jardim Menina Moça I', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-menina-moca-2', name: 'Jardim Menina Moça II', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-mouco', name: 'Jardim Mouco', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-nova-santa-rita', name: 'Jardim Nova Santa Rita', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-paulista', name: 'Jardim Paulista', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-primavera', name: 'Jardim Primavera', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-raia', name: 'Jardim Raia', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-rodrigues', name: 'Jardim Rodrigues', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-santa-elisa', name: 'Jardim Santa Elisa', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-santa-fe', name: 'Jardim Santa Fé', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-santa-ifigenia', name: 'Jardim Santa Ifigênia', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-santa-rita', name: 'Jardim Santa Rita', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-santa-terezinha', name: 'Jardim Santa Terezinha', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-sao-domingos', name: 'Jardim São Domingos', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-sao-francisco', name: 'Jardim São Francisco', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-tenis-clube', name: 'Jardim Tênis Clube', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-toledo', name: 'Jardim Toledo', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-jd-tropical', name: 'Jardim Tropical', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-universitario', name: 'Jardim Universitário', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-jd-veridiana', name: 'Jardim Veridiana', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-nova-eliza', name: 'Nova Eliza', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-parque-americas', name: 'Parque das Américas', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-victorio-parolin', name: 'Parque Residencial Victório Parolin', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-villa-lobos', name: 'Parque Villa Lobos', fee: 5.00, estimatedTimeMin: 35, isActive: true },
  { id: 'bairro-sao-joao-batista', name: 'Patrimônio de São João Batista', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-pedregal', name: 'Pedregal', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-recanto-bela-vista', name: 'Recanto Bela Vista', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-augusto-zangirolami', name: 'Residencial Augusto Zangirolami', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-donnabella', name: 'Residencial Donnabella', fee: 5.00, estimatedTimeMin: 35, isActive: true },
  { id: 'bairro-harmonia', name: 'Residencial Harmonia', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-quinta-colina', name: 'Residencial Quinta da Colina', fee: 5.00, estimatedTimeMin: 35, isActive: true },
  { id: 'bairro-quinta-aroeiras', name: 'Residencial Quinta das Aroeiras', fee: 5.00, estimatedTimeMin: 35, isActive: true },
  { id: 'bairro-thermas-park', name: 'Residencial Thermas Park', fee: 5.00, estimatedTimeMin: 35, isActive: true },
  { id: 'bairro-village-morada-verde', name: 'Residencial Village Morada Verde', fee: 5.00, estimatedTimeMin: 35, isActive: true },
  { id: 'bairro-viva-olimpia', name: 'Residencial Viva Olímpia', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-santa-casa', name: 'Santa Casa', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-santa-julia', name: 'Santa Júlia', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-sao-jose', name: 'São José', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-vila-di-marco', name: 'Vila Di Marco', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-vila-goncalves', name: 'Vila Gonçalves', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-vila-hipica', name: 'Vila Hípica', fee: 4.50, estimatedTimeMin: 30, isActive: true },
  { id: 'bairro-vila-miessa', name: 'Vila Miessa', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-vila-nova', name: 'Vila Nova', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-vila-santa-genoveva', name: 'Vila Santa Genoveva', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-vila-silva-melo', name: 'Vila Silva Melo', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-vila-sao-jose', name: 'Vila São José', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-vivenda-cote-gil', name: 'Vivenda Cote Gil', fee: 4.00, estimatedTimeMin: 25, isActive: true },
  { id: 'bairro-distrito-baguacu', name: 'Distrito de Baguaçu', fee: 7.00, estimatedTimeMin: 45, isActive: true, notes: 'Distrito de Baguaçu - Olímpia/SP' },
  { id: 'bairro-distrito-ribeiro-santos', name: 'Distrito de Ribeiro dos Santos', fee: 7.00, estimatedTimeMin: 45, isActive: true, notes: 'Distrito de Ribeiro dos Santos - Olímpia/SP' },
  { id: 'bairro-outro-olimpia', name: 'Outro Bairro / Zona Rural de Olímpia', fee: 6.00, estimatedTimeMin: 40, isActive: true, notes: 'Consulte disponibilidade pelo WhatsApp' },
];

export const NEIGHBORHOODS_DATA: NeighborhoodFee[] = DEFAULT_NEIGHBORHOODS_DATA;

export const OFFICIAL_CATALOG_VERSION = 'naturalis_gourmet_v6_olimpia_sp';

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  storeName: 'Naturalis Gourmet',
  tagline: 'Geladinhos Artesanais feitos com Amor & Ingredientes Nobres',
  whatsappNumber: '5511999998888',
  instagramHandle: '@naturalisgourmet',
  address: 'Centro',
  city: 'Olímpia - SP',
  pixKey: '11999998888',
  pixKeyType: 'Celular',
  pixName: 'Naturalis Gourmet Ltda',
  minOrderValue: 15.00,
  freeDeliveryThreshold: 70.00,
  isOpen: true,
  deliveryEnabled: true,
  pickupEnabled: true,
  deliveryDisabledMessage: 'Entregas por delivery temporariamente pausadas. Aceitamos pedidos para retirada no balcão!',
  openingHoursText: 'Terça a Domingo: 11:00 às 20:00 (Segunda fechado)',
  standardDeliveryFee: 4.00,
  thermalCnpjCpf: '12.345.678/0001-90',
  thermalCustomFooter: 'Conserve no congelador a -18°C. Obrigado pela preferência!',
  thermalAutoOpenPrint: false,
  adminPin: '1234'
};

export const REVIEWS_DATA: CustomerReview[] = [];

export const FAQ_DATA = [
  {
    question: 'Como os geladinhos chegam até a minha casa?',
    answer: 'Nossos entregadores utilizam caixas térmicas com placas de gelo em gel (-18°C) que garantem que seu pedido chegue 100% firme e congelado até a sua porta.'
  },
  {
    question: 'Vocês fazem encomendas para festas e aniversários?',
    answer: 'Sim! Atendemos aniversários, casamentos, eventos corporativos e formaturas com caixas personalizadas e preços especiais no atacado. Fale conosco pelo WhatsApp!'
  },
  {
    question: 'Qual é a durabilidade e como conservar?',
    answer: 'No congelador comum ou freezer (-12°C a -18°C), nossos geladinhos têm validade de até 90 dias mantendo todo o frescor, cremosidade e sabor original.'
  },
  {
    question: 'Quais as formas de pagamento aceitas?',
    answer: 'Aceitamos PIX (com confirmação rápida), Cartão de Crédito/Débito direto na máquina do motoboy na entrega e Dinheiro (com troco facilitado).'
  }
];
