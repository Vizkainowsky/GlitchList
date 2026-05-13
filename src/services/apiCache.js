/**
 * Caché en memoria para las respuestas de APIs externas.
 * Se resetea al recargar la página (comportamiento esperado).
 *
 * Uso:
 *   import { getCache, setCache } from '../services/apiCache';
 *
 *   const cached = getCache('anime_trending_1');
 *   if (cached) { setData(cached); return; }
 *   // ... fetch ...
 *   setCache('anime_trending_1', data);
 */

const cache = {};

/**
 * Obtiene un valor de la caché.
 * @param {string} key — clave única para este resultado
 * @returns {any|null} — los datos cacheados o null si no existen
 */
export const getCache = (key) => {
  return cache[key] ?? null;
};

/**
 * Guarda un valor en la caché.
 * @param {string} key   — clave única
 * @param {any}    value — datos a guardar
 */
export const setCache = (key, value) => {
  cache[key] = value;
};

/**
 * Genera una clave de caché estandarizada.
 * Ejemplos:
 *   cacheKey('anime', '', 1)        → 'anime__page1'
 *   cacheKey('anime', 'one piece', 1) → 'anime_one piece_page1'
 *   cacheKey('games', 'elden', 1)   → 'games_elden_page1'
 */
export const cacheKey = (section, search, page) => {
  return `${section}_${search || ''}_page${page}`;
};
