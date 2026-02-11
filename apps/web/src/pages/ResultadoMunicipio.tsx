import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { buscarResultadoMunicipio, type ResultadoMunicipio as ResultadoMunicipioTipo } from '../services/resultados'

type EstadoResultado =
  | { status: 'carregando'; dados: null; mensagem: null }
  | { status: 'ok'; dados: ResultadoMunicipioTipo; mensagem: null }
  | { status: 'erro'; dados: null; mensagem: string }

export function ResultadoMunicipio() {
  const { codigoMunicipio } = useParams<{ codigoMunicipio: string }>()
  const navigate = useNavigate()
  const [estado, setEstado] = useState<EstadoResultado>({
    status: 'carregando',
    dados: null,
    mensagem: null,
  })

  useEffect(() => {
    if (!codigoMunicipio) {
      setEstado({ status: 'erro', dados: null, mensagem: 'Código do município não informado.' })
      return
    }

    let cancelado = false

    buscarResultadoMunicipio(codigoMunicipio).then((resultado) => {
      if (cancelado) return
      if (resultado.ok) {
        setEstado({ status: 'ok', dados: resultado.dados, mensagem: null })
      } else {
        setEstado({ status: 'erro', dados: null, mensagem: resultado.mensagem })
      }
    })

    return () => {
      cancelado = true
    }
  }, [codigoMunicipio])

  if (estado.status === 'carregando') {
    return (
      <main className="pagina-resultado-municipio" aria-live="polite">
        <p>Carregando resultados…</p>
      </main>
    )
  }

  if (estado.status === 'erro') {
    return (
      <main className="pagina-resultado-municipio" aria-live="assertive">
        <div className="feedback feedback-erro" role="alert">
          {estado.mensagem}
        </div>
        <button type="button" onClick={() => navigate('/resultados')} className="botao-secundario">
          Voltar
        </button>
      </main>
    )
  }

  const dados = estado.dados

  return (
    <main className="pagina-resultado-municipio" aria-labelledby="titulo-municipio">
      <button
        type="button"
        onClick={() => navigate('/resultados')}
        className="botao-voltar"
        aria-label="Voltar para busca por município"
      >
        Voltar
      </button>

      <h1 id="titulo-municipio">
        Resultados — {dados.municipio ?? dados.codigo_municipio ?? codigoMunicipio}
      </h1>

      {dados.codigo_municipio && (
        <p className="codigo-municipio">
          Código: <code>{dados.codigo_municipio}</code>
        </p>
      )}

      {dados.totais && typeof dados.totais === 'object' && Object.keys(dados.totais).length > 0 && (
        <section className="totais" aria-labelledby="titulo-totais">
          <h2 id="titulo-totais">Totais</h2>
          <dl className="lista-totais">
            {Object.entries(dados.totais).map(([chave, valor]) => (
              <div key={chave} className="item-total">
                <dt>{chave}</dt>
                <dd>{Number.isFinite(valor) ? valor : String(valor)}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {dados.cargos && Array.isArray(dados.cargos) && dados.cargos.length > 0 && (
        <section className="cargos" aria-labelledby="titulo-cargos">
          <h2 id="titulo-cargos">Por cargo</h2>
          {dados.cargos.map((cargo, i) => (
            <div key={i} className="bloco-cargo">
              <h3>{cargo.cargo ?? `Cargo ${i + 1}`}</h3>
              {cargo.candidatos && cargo.candidatos.length > 0 ? (
                <ul className="lista-candidatos">
                  {cargo.candidatos.map((c, j) => (
                    <li key={j}>
                      {c.numero ?? c.nome ?? '-'}: {c.votos ?? 0}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="sem-dados">Sem dados de candidatos.</p>
              )}
            </div>
          ))}
        </section>
      )}

      {(!dados.totais || Object.keys(dados.totais || {}).length === 0) &&
        (!dados.cargos || dados.cargos.length === 0) && (
          <p className="sem-dados">Nenhum dado de totalização disponível para este município.</p>
        )}
    </main>
  )
}
