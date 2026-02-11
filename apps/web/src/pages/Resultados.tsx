import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

export function Resultados() {
  const [codigo, setCodigo] = useState('')
  const navigate = useNavigate()

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const valor = codigo.trim()
    if (valor) {
      navigate(`/resultados/${encodeURIComponent(valor)}`)
    }
  }

  return (
    <main className="pagina-resultados" aria-labelledby="titulo-resultados">
      <h1 id="titulo-resultados">Resultados parciais</h1>
      <p className="instrucao">
        Informe o código TSE do município para carregar os resultados agregados.
      </p>

      <form onSubmit={handleSubmit} className="form-busca-municipio">
        <label htmlFor="codigo-municipio">Código do município</label>
        <input
          id="codigo-municipio"
          type="text"
          value={codigo}
          onChange={(e) => setCodigo(e.target.value)}
          placeholder="Ex.: 3550308"
          autoComplete="off"
          aria-describedby="desc-codigo"
        />
        <span id="desc-codigo" className="input-desc">
          Código numérico de 7 dígitos (TSE).
        </span>
        <button type="submit" className="botao-primario">
          Ver resultados
        </button>
      </form>
    </main>
  )
}
