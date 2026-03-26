import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { formatCurrency, formatTime, statusLabel } from '../utils/format'
import { SHOW_ESTOQUE } from '../utils/features'

export default function Dashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/relatorios/dashboard')
      .then(r => setData(r.data))
      .catch(() => setData({ agendamentosHoje: 0, faturamentoHoje: 0, totalClientes: 0, alertasEstoque: 0, proximosAgendamentos: [] }))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading"><div className="spinner" />Carregando</div>

  const hoje = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div>
      {/* Header */}
      <div className="page-header fade-in">
        <div>
          <h1>Dashboard</h1>
          <p className="subtitle" style={{ textTransform: 'capitalize' }}>{hoje}</p>
        </div>
        <Link to="/agenda" className="btn btn-primary">
          <span>+</span> Novo Agendamento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid-4 dashboard-stats">
        {[
          { label: 'Agendamentos hoje', value: data?.agendamentosHoje ?? 0, sub: 'no dia atual', gold: false, cls: 'fade-in-1' },
          { label: 'Faturamento hoje', value: formatCurrency(data?.faturamentoHoje), sub: 'receitas do dia', gold: true, cls: 'fade-in-2' },
          { label: 'Total de clientes', value: data?.totalClientes ?? 0, sub: 'cadastradas', gold: false, cls: 'fade-in-3' },
          ...(SHOW_ESTOQUE
            ? [{ label: 'Alertas de estoque', value: data?.alertasEstoque ?? 0, sub: 'produtos em falta', gold: false, warn: (data?.alertasEstoque ?? 0) > 0, cls: 'fade-in-4' }]
            : []),
        ].map((s, i) => (
          <div key={i} className={`stat-card ${s.cls}`} style={s.warn ? { borderColor: 'rgba(201,148,76,0.3)' } : {}}>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-value ${s.gold ? 'gold' : ''}`} style={s.warn ? { color: 'var(--warning)' } : {}}>
              {s.value}
            </div>
            <div className="stat-sub">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Próximos agendamentos */}
      <div className="card fade-in-2 dashboard-upcoming">
        <div className="dashboard-upcoming-head">
          <h2 className="dashboard-upcoming-title">Próximos Agendamentos</h2>
          <Link to="/agenda" className="dashboard-link">
            Ver todos →
          </Link>
        </div>

        {!data?.proximosAgendamentos?.length ? (
          <div className="empty-state">
            <div className="empty-icon">◌</div>
            <p>Nenhum agendamento hoje. Que tal criar um novo?</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Horário</th>
                  <th>Cliente</th>
                  <th>Serviço</th>
                  <th>Profissional</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.proximosAgendamentos.map(a => {
                  const s = statusLabel(a.status)
                  return (
                    <tr key={a.id}>
                      <td>
                        <span className="dashboard-time">
                          {formatTime(a.dataHora)}
                        </span>
                      </td>
                      <td className="dashboard-client">{a.cliente.nome}</td>
                      <td className="dashboard-muted">{a.servico.nome}</td>
                      <td className="dashboard-muted">{a.profissional.nome}</td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div className="grid-2 fade-in-3">
        {[
          { to: '/caixa',   icon: '◈', title: 'Caixa do Dia', sub: 'Registrar entradas e saídas' },
          ...(SHOW_ESTOQUE
            ? [{ to: '/estoque', icon: '▣', title: 'Estoque', sub: data?.alertasEstoque > 0 ? `⚠ ${data.alertasEstoque} produto(s) em falta` : 'Produtos e movimentações' }]
            : []),
        ].map(a => (
          <Link key={a.to} to={a.to} className="dashboard-quick-link">
            <div className="card-gold dashboard-quick-card">
              <span className="dashboard-quick-icon">{a.icon}</span>
              <div>
                <div className="dashboard-quick-title">{a.title}</div>
                <div className="dashboard-quick-sub">{a.sub}</div>
              </div>
              <span className="dashboard-quick-arrow">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
