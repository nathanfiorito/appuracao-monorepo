import { API_BASE_URL } from '../config/env'
import { INGESTAO_PATH } from '../config/constants'
import { MENSAGENS } from '../config/mensagens'

export interface QRItem {
  conteudo_qr: string
  posicao_atual: number
  posicao_total: number
}

export type ResultadoEnvio =
  | { ok: true }
  | { ok: false; mensagem: string }

/**
 * Envia os QRs de um boletim para a API de ingestão (array no body).
 */
export async function enviarBoletim(
  boletimId: string,
  qrs: QRItem[]
): Promise<ResultadoEnvio> {
  const url = `${API_BASE_URL.replace(/\/$/, '')}${INGESTAO_PATH}`
  const body = {
    boletim_id: boletimId,
    qrs: qrs.map(({ conteudo_qr, posicao_atual, posicao_total }) => ({
      conteudo_qr,
      posicao_atual,
      posicao_total,
    })),
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.status === 202) {
      return { ok: true }
    }

    if (res.status === 400) {
      return { ok: false, mensagem: MENSAGENS.ENVIO_ERRO_PAYLOAD }
    }

    if (res.status === 413) {
      return { ok: false, mensagem: MENSAGENS.ENVIO_ERRO_PAYLOAD }
    }

    if (res.status >= 500) {
      return { ok: false, mensagem: MENSAGENS.ENVIO_ERRO_SERVIDOR }
    }

    return { ok: false, mensagem: MENSAGENS.ENVIO_ERRO_SERVIDOR }
  } catch {
    return { ok: false, mensagem: MENSAGENS.ENVIO_ERRO_REDE }
  }
}
