import { RESULTADOS_BASE_URL } from '../config/env'
import { RESULTADOS_PATH } from '../config/constants'
import { MENSAGENS } from '../config/mensagens'

/** Estrutura mínima do resultado por município (schema refinado pela Lambda Agregar e Exportar). */
export interface ResultadoMunicipio {
  codigo_municipio?: string
  municipio?: string
  totais?: Record<string, number>
  cargos?: Array<{
    cargo?: string
    candidatos?: Array<{ numero?: string; nome?: string; votos?: number }>
  }>
}

export type ResultadoBusca =
  | { ok: true; dados: ResultadoMunicipio }
  | { ok: false; mensagem: string }

/**
 * Busca o JSON de resultados de um município.
 */
export async function buscarResultadoMunicipio(
  codigoMunicipio: string
): Promise<ResultadoBusca> {
  const base = RESULTADOS_BASE_URL.replace(/\/$/, '')
  const path = `${RESULTADOS_PATH}/${encodeURIComponent(codigoMunicipio)}.json`
  const url = `${base}${path}`

  try {
    const res = await fetch(url)

    if (res.status === 404) {
      return { ok: false, mensagem: MENSAGENS.RESULTADO_NAO_ENCONTRADO }
    }

    if (!res.ok) {
      return { ok: false, mensagem: MENSAGENS.RESULTADO_ERRO_REDE }
    }

    const dados = await res.json()
    if (dados === null || typeof dados !== 'object') {
      return { ok: false, mensagem: MENSAGENS.RESULTADO_ERRO_INVALIDO }
    }

    return { ok: true, dados: dados as ResultadoMunicipio }
  } catch {
    return { ok: false, mensagem: MENSAGENS.RESULTADO_ERRO_REDE }
  }
}
