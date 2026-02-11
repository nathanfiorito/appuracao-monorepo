import { useEffect, useState } from 'react'
import { LeitorQR } from '../components/LeitorQR'
import { useBoletim } from '../hooks/useBoletim'
import { MAX_QRS_POR_BOLETIM } from '../config/constants'

export function EnviarBoletim() {
  const {
    boletimId,
    qrs,
    enviando,
    feedback,
    iniciar,
    adicionarQR,
    removerUltimo,
    enviar,
    podeEnviar,
    podeAdicionarMais,
  } = useBoletim()

  const [mostrarLeitor, setMostrarLeitor] = useState(false)

  useEffect(() => {
    iniciar()
  }, [iniciar])

  const aoDecodificar = (texto: string) => {
    adicionarQR(texto)
    setMostrarLeitor(false)
  }

  const abrirLeitor = () => setMostrarLeitor(true)
  const fecharLeitor = () => setMostrarLeitor(false)

  return (
    <main className="pagina-enviar" aria-labelledby="titulo-enviar">
      <h1 id="titulo-enviar">Enviar boletim</h1>
      <p className="instrucao">
        Adicione de 1 a {MAX_QRS_POR_BOLETIM} QR Codes do mesmo boletim de urna. Use a câmera ou envie uma imagem.
      </p>

      {boletimId && (
        <p className="boletim-id" aria-live="polite">
          Boletim: <code>{boletimId}</code>
        </p>
      )}

      <div className="progresso-qrs">
        <span className="progresso-qrs-texto" aria-live="polite">
          QR Codes: {qrs.length} de {MAX_QRS_POR_BOLETIM}
        </span>
        {qrs.length > 0 && (
          <button type="button" onClick={removerUltimo} className="botao-remover">
            Remover último
          </button>
        )}
      </div>

      {mostrarLeitor ? (
        <div className="leitor-wrapper">
          <LeitorQR
            onDecode={aoDecodificar}
            onErro={() => setMostrarLeitor(false)}
            pausar={!mostrarLeitor}
          />
          <button type="button" onClick={fecharLeitor} className="botao-secundario">
            Cancelar
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={abrirLeitor}
          disabled={!podeAdicionarMais}
          className="botao-primario"
          aria-label="Adicionar QR Code por câmera ou imagem"
        >
          {qrs.length === 0 ? 'Adicionar primeiro QR' : 'Adicionar próximo QR'}
        </button>
      )}

      <div className="acoes-envio">
        <button
          type="button"
          onClick={enviar}
          disabled={!podeEnviar}
          className="botao-enviar"
          aria-busy={enviando}
        >
          {enviando ? 'Enviando…' : 'Enviar boletim'}
        </button>
        <button type="button" onClick={iniciar} className="botao-secundario">
          Novo boletim
        </button>
      </div>

      {feedback && (
        <div
          className={`feedback feedback-${feedback.tipo}`}
          role="alert"
          aria-live="assertive"
        >
          {feedback.mensagem}
        </div>
      )}
    </main>
  )
}
