import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import { SHOW_ESTOQUE, SHOW_RELATORIOS } from '../utils/features.js'
import './Layout.css'

const nav = [
  { to: '/',              icon: '◈', label: 'Dashboard' },
  { to: '/agenda',        icon: '◷', label: 'Agenda' },
  { to: '/clientes',      icon: '◉', label: 'Clientes' },
  { to: '/profissionais', icon: '✦', label: 'Profissionais' },
  { to: '/servicos',      icon: '◇', label: 'Serviços' },
  { to: '/caixa',         icon: '◈', label: 'Caixa' },
  ...(SHOW_ESTOQUE ? [{ to: '/estoque', icon: '▣', label: 'Estoque' }] : []),
  ...(SHOW_RELATORIOS ? [{ to: '/relatorios', icon: '◫', label: 'Relatórios' }] : []),
]

export default function Layout() {
  const { usuario, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className="layout">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">✦</div>
          <div className="brand-text">
            <span className="brand-name">Salão</span>
            <span className="brand-tagline">Studio</span>
          </div>
        </div>

        <div className="sidebar-section-label">Menu</div>

        <nav className="sidebar-nav">
          {nav.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
              <span className="nav-indicator" />
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{usuario?.nome?.[0]?.toUpperCase()}</div>
            <div className="user-info">
              <span className="user-name">{usuario?.nome}</span>
              <span className="user-role">Administrador</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Sair">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/>
            </svg>
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
