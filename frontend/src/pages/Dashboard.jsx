import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import { formatCurrency, formatTime, statusLabel } from '../utils/format'

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
      <div className="grid-4" style={{ marginBottom: 32 }}>
        {[
          { label: 'Agendamentos hoje', value: data?.agendamentosHoje ?? 0, sub: 'no dia atual', gold: false, cls: 'fade-in-1' },
          { label: 'Faturamento hoje', value: formatCurrency(data?.faturamentoHoje), sub: 'receitas do dia', gold: true, cls: 'fade-in-2' },
          { label: 'Total de clientes', value: data?.totalClientes ?? 0, sub: 'cadastradas', gold: false, cls: 'fade-in-3' },
          { label: 'Alertas de estoque', value: data?.alertasEstoque ?? 0, sub: 'produtos em falta', gold: false, warn: (data?.alertasEstoque ?? 0) > 0, cls: 'fade-in-4' },
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
      <div className="card fade-in-2" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <h2 style={{ fontSize: 22 }}>Próximos Agendamentos</h2>
          <Link to="/agenda" style={{ fontSize: 11, color: 'var(--gold)', textDecoration: 'none', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Ver todos →
          </Link>
        </div>

        {!data?.proximosAgendamentos?.length ? (
          <div className="empty-state">
            <div className="empty-icon">◷</div>
            <p>Nenhum agendamento para hoje</p>
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
                        <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 18, fontWeight: 400, color: 'var(--gold)' }}>
                          {formatTime(a.dataHora)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{a.cliente.nome}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{a.servico.nome}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{a.profissional.nome}</td>
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
          { to: '/estoque', icon: '▣', title: 'Estoque',       sub: data?.alertasEstoque > 0 ? `⚠ ${data.alertasEstoque} produto(s) em falta` : 'Produtos e movimentações' },
        ].map(a => (
          <Link key={a.to} to={a.to} style={{ textDecoration: 'none' }}>
            <div className="card-gold" style={{ cursor: 'pointer', transition: 'all 0.2s', display: 'flex', gap: 16, alignItems: 'center' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 40px rgba(201,168,76,0.18)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.transform = '' }}>
              <span style={{ fontSize: 28, color: 'var(--gold)', opacity: 0.7 }}>{a.icon}</span>
              <div>
                <div style={{ fontWeight: 500, fontSize: 15, marginBottom: 3, color: 'var(--text)' }}>{a.title}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{a.sub}</div>
              </div>
              <span style={{ marginLeft: 'auto', color: 'var(--gold-dim)', fontSize: 18 }}>→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
