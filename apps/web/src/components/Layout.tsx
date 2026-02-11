import { Outlet, Link, useLocation } from 'react-router-dom'

const NAV: Array<{ to: string; label: string }> = [
  { to: '/enviar', label: 'Enviar boletim' },
  { to: '/resultados', label: 'Resultados' },
]

export function Layout() {
  const location = useLocation()

  return (
    <div className="layout">
      <header className="layout-header" role="banner">
        <Link to="/" className="layout-brand" aria-label="Appuracao — início">
          Appuracao
        </Link>
        <nav className="layout-nav" aria-label="Principal">
          <ul>
            {NAV.map(({ to, label }) => (
              <li key={to}>
                <Link
                  to={to}
                  className={location.pathname === to ? 'layout-nav-link ativo' : 'layout-nav-link'}
                  aria-current={location.pathname === to ? 'page' : undefined}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      <main className="layout-main" role="main">
        <Outlet />
      </main>
    </div>
  )
}
