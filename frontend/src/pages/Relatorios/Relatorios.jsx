import { useState } from 'react'
import api from '../../utils/api'
import { formatCurrency, formatDateTime } from '../../utils/format'

const hoje = new Date().toISOString().split('T')[0]
const inicioMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]

export default function Relatorios() {
  const [inicio, setInicio] = useState(inicioMes)
  const [fim, setFim] = useState(hoje)
  const [dados, setDados] = useState(null)
  const [loading, setLoading] = useState(false)

  const buscar = async () => {
    setLoading(true)
    try {
      const fimFull = new Date(fim); fimFull.setHours(23, 59, 59, 999)
      const r = await api.get(`/relatorios/faturamento?inicio=${inicio}&fim=${fimFull.toISOString()}`)
      setDados(r.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Relatórios</h1>
      </div>

      {/* Filtro */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ minWidth: 160 }}>
            <label>Data Início</label>
            <input type="date" className="form-control" value={inicio} onChange={e => setInicio(e.target.value)} />
          </div>
          <div className="form-group" style={{ minWidth: 160 }}>
            <label>Data Fim</label>
            <input type="date" className="form-control" value={fim} onChange={e => setFim(e.target.value)} />
          </div>
          <button className="btn btn-primary" onClick={buscar} disabled={loading}>
            {loading ? 'Buscando...' : '🔍 Gerar Relatório'}
          </button>
        </div>
      </div>

      {dados && (
        <>
          {/* Total */}
          <div className="stat-card" style={{ marginBottom: 24, borderLeft: '4px solid var(--success)' }}>
            <div className="stat-label">Faturamento Total no Período</div>
            <div className="stat-value" style={{ color: 'var(--success)' }}>{formatCurrency(dados.total)}</div>
            <div className="stat-sub">{dados.lancamentos.length} atendimento(s) concluído(s)</div>
          </div>

          <div className="grid-2" style={{ marginBottom: 24 }}>
            {/* Por Profissional */}
            <div className="card">
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Por Profissional</h2>
              {Object.keys(dados.porProfissional).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sem dados</p>
              ) : Object.entries(dados.porProfissional)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([nome, info]) => (
                  <div key={nome} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{nome}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{info.atendimentos} atendimento(s)</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(info.total)}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Comissão: {formatCurrency(info.comissao)}</div>
                    </div>
                  </div>
                ))
              }
            </div>

            {/* Por Serviço */}
            <div className="card">
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Por Serviço</h2>
              {Object.keys(dados.porServico).length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>Sem dados</p>
              ) : Object.entries(dados.porServico)
                .sort((a, b) => b[1].total - a[1].total)
                .map(([nome, info]) => (
                  <div key={nome} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{nome}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{info.quantidade}x realizado</div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--success)' }}>{formatCurrency(info.total)}</div>
                  </div>
                ))
              }
            </div>
          </div>

          {/* Lançamentos */}
          <div className="card">
            <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14 }}>Todos os Lançamentos</h2>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Data/Hora</th>
                    <th>Descrição</th>
                    <th>Profissional</th>
                    <th>Valor</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.lancamentos.map(l => (
                    <tr key={l.id}>
                      <td>{formatDateTime(l.data)}</td>
                      <td>{l.descricao}</td>
                      <td>{l.agendamento?.profissional?.nome || '-'}</td>
                      <td><strong style={{ color: 'var(--success)' }}>{formatCurrency(l.valor)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {!dados && !loading && (
        <div className="empty-state card">
          <div className="empty-icon">📊</div>
          <p>Selecione o período e clique em "Gerar Relatório"</p>
        </div>
      )}
    </div>
  )
}
