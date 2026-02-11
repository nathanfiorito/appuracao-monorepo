/**
 * Variáveis de ambiente (prefixo VITE_ expostas no build).
 * Valores padrão para desenvolvimento local.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
const RESULTADOS_BASE_URL = import.meta.env.VITE_RESULTADOS_BASE_URL ?? 'http://localhost:3000'

export { API_BASE_URL, RESULTADOS_BASE_URL }
