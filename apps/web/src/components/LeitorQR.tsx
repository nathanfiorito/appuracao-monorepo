import { useRef, useEffect, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { MENSAGENS } from '../config/mensagens'

const FPS = 10
const QRBOX_SIZE = { width: 250, height: 250 }

export interface LeitorQRProps {
  onDecode: (texto: string) => void
  onErro?: (mensagem: string) => void
  pausar?: boolean
}

/**
 * Leitor de QR Code (câmera ou arquivo). Chama onDecode com o texto decodificado.
 */
export function LeitorQR({ onDecode, onErro, pausar = false }: LeitorQRProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const [modo, setModo] = useState<'camera' | null>(null)
  const [cameraLigada, setCameraLigada] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const elementIdRef = useRef(`leitor-qr-${Math.random().toString(36).slice(2)}`)

  const pararCamera = async (): Promise<void> => {
    if (!scannerRef.current?.isScanning) return
    try {
      await scannerRef.current.stop()
    } catch {
      // ignora erro ao parar
    }
    scannerRef.current = null
    setCameraLigada(false)
  }

  useEffect(() => {
    if (pausar && cameraLigada) {
      pararCamera()
    }
  }, [pausar])

  useEffect(() => {
    return () => {
      pararCamera()
    }
  }, [])

  const iniciarCamera = () => {
    setModo('camera')
    setErro(null)
  }

  useEffect(() => {
    if (modo !== 'camera' || !containerRef.current) return

    const elementId = elementIdRef.current
    let mounted = true

    const iniciar = async () => {
      if (scannerRef.current) {
        await pararCamera()
      }
      const html5Qr = new Html5Qrcode(elementId)
      scannerRef.current = html5Qr

      try {
        const cameras = await Html5Qrcode.getCameras()
        const cameraId = cameras?.[0]?.id
        if (!mounted) return
        if (!cameraId) {
          setErro('Nenhuma câmera encontrada.')
          onErro?.(MENSAGENS.QR_NAO_DECODIFICADO)
          scannerRef.current = null
          return
        }

        await html5Qr.start(
          cameraId,
          {
            fps: FPS,
            qrbox: QRBOX_SIZE,
          },
          (decodedText) => {
            onDecode(decodedText)
            pararCamera()
          },
          () => {
            // erro de scan contínuo (nenhum QR na tela) — não reportar
          }
        )
        if (mounted) setCameraLigada(true)
      } catch (err) {
        if (mounted) {
          setErro(err instanceof Error ? err.message : MENSAGENS.QR_NAO_DECODIFICADO)
          onErro?.(MENSAGENS.QR_NAO_DECODIFICADO)
        }
        scannerRef.current = null
      }
    }

    iniciar()
    return () => {
      mounted = false
      pararCamera()
    }
  }, [modo])

  const escolherArquivo = () => {
    setErro(null)
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement)?.files?.[0]
      if (!file) return
      if (!document.getElementById(elementIdRef.current)) {
        setErro(MENSAGENS.QR_NAO_DECODIFICADO)
        return
      }
      const html5Qr = new Html5Qrcode(elementIdRef.current)
      try {
        const texto = await html5Qr.scanFile(file, false)
        if (texto) {
          onDecode(texto)
        } else {
          setErro(MENSAGENS.QR_NAO_DECODIFICADO)
          onErro?.(MENSAGENS.QR_NAO_DECODIFICADO)
        }
      } catch {
        setErro(MENSAGENS.QR_NAO_DECODIFICADO)
        onErro?.(MENSAGENS.QR_NAO_DECODIFICADO)
      }
    }
    input.click()
  }

  return (
    <section className="leitor-qr" aria-label="Leitor de QR Code">
      {!modo && (
        <div className="leitor-qr-botoes">
          <button type="button" onClick={iniciarCamera}>
            Usar câmera
          </button>
          <button type="button" onClick={escolherArquivo}>
            Enviar imagem
          </button>
        </div>
      )}

      {modo === 'camera' && (
        <div className="leitor-qr-camera">
          <div
            ref={containerRef}
            id={elementIdRef.current}
            className="leitor-qr-viewfinder"
            style={{ minHeight: 200 }}
          />
          <button type="button" onClick={() => pararCamera()} className="leitor-qr-parar">
            Parar câmera
          </button>
        </div>
      )}

      {modo !== 'camera' && (
        <div
          ref={containerRef}
          id={elementIdRef.current}
          className="leitor-qr-viewfinder"
          style={{ position: 'absolute', left: '-9999px', width: 1, height: 1 }}
          aria-hidden="true"
        />
      )}

      {erro && (
        <p className="leitor-qr-erro" role="alert">
          {erro}
        </p>
      )}
    </section>
  )
}
