import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { formatCurrency, formatTime, pagamentoLabel } from '../../utils/format'
import { useToast } from '../../hooks/useToast'

export default function Caixa() {
  const [data, setData] = useState(() => new Date().toISOString().split('T')[0])
  const [caixa, setCaixa] = useState({ lancamentos: [], entradas: 0, saidas: 0, saldo: 0 })
  const [modal, setModal] = useState(false)
  const [formPag, setFormPag] = useState(null)
  const [form, setForm] = useState({ tipo: 'entrada', descricao: '', valor: '', formaPagamento: 'pix' })
  const [loading, setLoading] = useState(false)
  const { showToast, ToastComponent } = useToast()

  const carregar = () => {
    api.get(`/caixa?data=${data}`).then(r => setCaixa(r.data)).catch(console.error)
  }

  useEffect(() => { carregar() }, [data])

  const salvarLancamento = async () => {
    setLoading(true)
    try {
      await api.post('/caixa', { ...form, valor: Number(form.valor) })
      showToast('Lançamento criado', 'success')
      setModal(false)
      setForm({ tipo: 'entrada', descricao: '', valor: '', formaPagamento: 'pix' })
      carregar()
    } catch (err) {
      showToast('Erro ao salvar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const atualizarPagamento = async (id) => {
    try {
      await api.patch(`/caixa/${id}`, { formaPagamento: formPag })
      showToast('Pagamento atualizado', 'success')
      setFormPag(null)
      carregar()
    } catch { showToast('Erro', 'error') }
  }

  const deletar = async (id) => {
    if (!confirm('Remover lançamento?')) return
    await api.delete(`/caixa/${id}`)
    carregar()
  }

  const pagClasses = { pix: 'badge-blue', dinheiro: 'badge-green', credito: 'badge-yellow', debito: 'badge-gray' }

  return (
    <div>
      <div className="page-header">
        <h1>Caixa</h1>
        <div style={{ display: 'flex', gap: 10 }}>
          <input type="date" className="form-control" style={{ width: 'auto' }} value={data} onChange={e => setData(e.target.value)} />
          <button className="btn btn-primary" onClick={() => setModal(true)}>+ Lançamento</button>
        </div>
      </div>

      {/* Resumo */}
      <div className="grid-3" style={{ marginBottom: 24 }}>
        <div className="stat-card">
          <div className="stat-label">Entradas</div>
          <div className="stat-value" style={{ color: 'var(--success)', fontSize: 22 }}>{formatCurrency(caixa.entradas)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Saídas</div>
          <div className="stat-value" style={{ color: 'var(--danger)', fontSize: 22 }}>{formatCurrency(caixa.saidas)}</div>
        </div>
        <div className="stat-card" style={{ borderColor: caixa.saldo >= 0 ? 'var(--success)' : 'var(--danger)' }}>
          <div className="stat-label">Saldo</div>
          <div className="stat-value" style={{ color: caixa.saldo >= 0 ? 'var(--success)' : 'var(--danger)', fontSize: 22 }}>{formatCurrency(caixa.saldo)}</div>
        </div>
      </div>

      {/* Tabela */}
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Hora</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Pagamento</th>
              <th>Valor</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {caixa.lancamentos.length === 0 ? (
              <tr><td colSpan={6}><div className="empty-state"><div className="empty-icon">💰</div><p>Nenhum lançamento nesta data</p></div></td></tr>
            ) : caixa.lancamentos.map(l => (
              <tr key={l.id}>
                <td>{formatTime(l.data)}</td>
                <td>
                  <div>{l.descricao}</div>
                  {l.agendamento && (
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                      {l.agendamento.profissional?.nome}
                    </div>
                  )}
                </td>
                <td>
                  <span className={`badge ${l.tipo === 'entrada' ? 'badge-green' : 'badge-red'}`}>
                    {l.tipo === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                  </span>
                </td>
                <td>
                  {formPag?.id === l.id ? (
                    <div style={{ display: 'flex', gap: 6 }}>
                      <select className="form-control" style={{ padding: '4px 8px', fontSize: 12 }}
                        value={formPag.valor}
                        onChange={e => setFormPag(p => ({ ...p, valor: e.target.value }))}>
                        <option value="pix">PIX</option>
                        <option value="dinheiro">Dinheiro</option>
                        <option value="credito">Crédito</option>
                        <option value="debito">Débito</option>
                      </select>
                      <button className="btn btn-primary btn-sm" onClick={() => atualizarPagamento(l.id)}>✓</button>
                    </div>
                  ) : (
                    <button className="btn btn-ghost btn-sm" onClick={() => setFormPag({ id: l.id, valor: l.formaPagamento || 'pix' })}>
                      {l.formaPagamento ? (
                        <span className={`badge ${pagClasses[l.formaPagamento] || 'badge-gray'}`}>{pagamentoLabel(l.formaPagamento)}</span>
                      ) : <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>Definir...</span>}
                    </button>
                  )}
                </td>
                <td>
                  <strong style={{ color: l.tipo === 'entrada' ? 'var(--success)' : 'var(--danger)' }}>
                    {l.tipo === 'saida' ? '- ' : '+ '}{formatCurrency(l.valor)}
                  </strong>
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => deletar(l.id)} style={{ color: 'var(--danger)' }}>✕</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal lançamento manual */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Novo Lançamento</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Tipo</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['entrada', 'saida'].map(t => (
                    <button key={t} type="button" className={`btn btn-sm ${form.tipo === t ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1 }} onClick={() => setForm(p => ({ ...p, tipo: t }))}>
                      {t === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Descrição *</label>
                <input className="form-control" value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Ex: Aluguel, Material..." />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Valor (R$) *</label>
                  <input type="number" className="form-control" value={form.valor} min={0} step={0.01} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Pagamento</label>
                  <select className="form-control" value={form.formaPagamento} onChange={e => setForm(p => ({ ...p, formaPagamento: e.target.value }))}>
                    <option value="pix">PIX</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="credito">Crédito</option>
                    <option value="debito">Débito</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarLancamento} disabled={loading || !form.descricao || !form.valor}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {ToastComponent}
    </div>
  )
}
