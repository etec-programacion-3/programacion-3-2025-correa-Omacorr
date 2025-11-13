// Categorías estandarizadas para todo el proyecto E-Commerce
export const CATEGORIAS = [
  'Tecnología',
  'Hogar', 
  'Ropa',
  'Deportes',
  'Vehículos',
  'Libros',
  'Otros'
] as const;

export type Categoria = typeof CATEGORIAS[number];

// Para usar en selects y formularios
export const CATEGORIAS_OPTIONS = CATEGORIAS.map(cat => ({
  value: cat,
  label: cat
}));

// Para iconos por categoría
export const CATEGORIAS_ICONOS = {
  'Tecnología': '📱',
  'Hogar': '🏠', 
  'Ropa': '👕',
  'Deportes': '⭐',
  'Vehículos': '🚗',
  'Libros': '📚',
  'Otros': '📦'
} as const;