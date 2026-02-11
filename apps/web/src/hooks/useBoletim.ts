import { useState, useCallback } from 'react'
import { MAX_QRS_POR_BOLETIM } from '../config/constants'
import { MENSAGENS } from '../config/mensagens'
import { enviarBoletim, type QRItem } from '../services/ingestao'

function gerarBoletimId(): string {
  return crypto.randomUUID?.() ?? 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export interface FeedbackBoletim {
  tipo: 'sucesso' | 'erro'
  mensagem: string
}

export interface UseBoletimReturn {
  boletimId: string | null
  qrs: QRItem[]
  enviando: boolean
  feedback: FeedbackBoletim | null
  iniciar: () => void
  adicionarQR: (conteudo_qr: string) => void
  atualizarTotal: (novoTotal: number) => void
  removerUltimo: () => void
  enviar: () => Promise<void>
  podeEnviar: boolean
  podeAdicionarMais: boolean
}

/**
 * Estado e ações do fluxo "Novo boletim": id, lista de QRs, envio e feedback.
 */
export function useBoletim(): UseBoletimReturn {
  const [boletimId, setBoletimId] = useState<string | null>(null)
  const [qrs, setQrs] = useState<QRItem[]>([])
  const [enviando, setEnviando] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackBoletim | null>(null)

  const iniciar = useCallback(() => {
    setBoletimId(gerarBoletimId())
    setQrs([])
    setFeedback(null)
  }, [])

  const adicionarQR = useCallback((conteudo_qr: string) => {
    if (typeof conteudo_qr !== 'string' || !conteudo_qr.trim()) return
    setQrs((prev) => {
      if (prev.length >= MAX_QRS_POR_BOLETIM) return prev
      const total = prev.length + 1
      const anteriores = prev.map((qr, i) => ({
        ...qr,
        posicao_atual: i + 1,
        posicao_total: total,
      }))
      return [...anteriores, { conteudo_qr: conteudo_qr.trim(), posicao_atual: total, posicao_total: total }]
    })
  }, [])

  const atualizarTotal = useCallback((novoTotal: number) => {
    const n = Math.min(MAX_QRS_POR_BOLETIM, Math.max(1, Math.floor(novoTotal)))
    setQrs((prev) =>
      prev.map((qr, i) => ({
        ...qr,
        posicao_atual: i + 1,
        posicao_total: n,
      }))
    )
  }, [])

  const removerUltimo = useCallback(() => {
    setQrs((prev) => prev.slice(0, -1))
  }, [])

  const enviar = useCallback(async () => {
    if (qrs.length === 0) {
      setFeedback({ tipo: 'erro', mensagem: MENSAGENS.BOLETIM_MINIMO_UM_QR })
      return
    }
    if (!boletimId) return

    const payload: QRItem[] = qrs.map((qr, i) => ({
      conteudo_qr: qr.conteudo_qr,
      posicao_atual: i + 1,
      posicao_total: qrs.length,
    }))

    setEnviando(true)
    setFeedback(null)

    const resultado = await enviarBoletim(boletimId, payload)

    setEnviando(false)
    if (resultado.ok) {
      setFeedback({ tipo: 'sucesso', mensagem: MENSAGENS.ENVIO_SUCESSO })
      setQrs([])
      setBoletimId(gerarBoletimId())
    } else {
      setFeedback({ tipo: 'erro', mensagem: resultado.mensagem })
    }
  }, [boletimId, qrs])

  return {
    boletimId,
    qrs,
    enviando,
    feedback,
    iniciar,
    adicionarQR,
    atualizarTotal,
    removerUltimo,
    enviar,
    podeEnviar: qrs.length > 0 && !enviando,
    podeAdicionarMais: qrs.length < MAX_QRS_POR_BOLETIM,
  }
}
