import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { formatDate, formatDateTime, formatCurrency, statusLabel } from '../../utils/format'
import { useToast } from '../../hooks/useToast'

const EMPTY = { nome: '', telefone: '', email: '', dataNasc: '', observacoes: '' }

export default function Clientes() {
  const [clientes, setClientes] = useState([])
  const [busca, setBusca] = useState('')
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [detalhe, setDetalhe] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const { showToast, ToastComponent } = useToast()

  const carregar = (b = '') => {
    api.get(`/clientes${b ? `?busca=${encodeURIComponent(b)}` : ''}`).then(r => setClientes(r.data))
  }

  useEffect(() => { carregar() }, [])

  useEffect(() => {
    const t = setTimeout(() => carregar(busca), 300)
    return () => clearTimeout(t)
  }, [busca])

  const abrirModal = (cliente = null) => {
    if (cliente) {
      setEditando(cliente.id)
      setForm({ nome: cliente.nome, telefone: cliente.telefone, email: cliente.email || '', dataNasc: cliente.dataNasc ? cliente.dataNasc.split('T')[0] : '', observacoes: cliente.observacoes || '' })
    } else {
      setEditando(null)
      setForm(EMPTY)
    }
    setModal(true)
  }

  const salvar = async () => {
    setLoading(true)
    try {
      if (editando) {
        await api.put(`/clientes/${editando}`, form)
        showToast('Cliente atualizado', 'success')
      } else {
        await api.post('/clientes', form)
        showToast('Cliente cadastrado', 'success')
      }
      setModal(false)
      carregar(busca)
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao salvar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const verDetalhe = async (id) => {
    const r = await api.get(`/clientes/${id}`)
    setDetalhe(r.data)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Clientes</h1>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Novo Cliente</button>
      </div>

      <div className="card" style={{ marginBottom: 20 }}>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input className="form-control" placeholder="Buscar por nome ou telefone..." value={busca} onChange={e => setBusca(e.target.value)} />
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Cadastro</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">👥</div><p>Nenhum cliente encontrado</p></div></td></tr>
            ) : clientes.map(c => (
              <tr key={c.id}>
                <td><strong style={{ cursor: 'pointer', color: 'var(--rose)' }} onClick={() => verDetalhe(c.id)}>{c.nome}</strong></td>
                <td>{c.telefone}</td>
                <td>{c.email || '-'}</td>
                <td>{formatDate(c.createdAt)}</td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => abrirModal(c)}>✎ Editar</button>
                    <button className="btn btn-ghost btn-sm" onClick={() => verDetalhe(c.id)}>👁 Histórico</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? 'Editar Cliente' : 'Novo Cliente'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Nome *</label>
                <input className="form-control" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Telefone *</label>
                  <input className="form-control" value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))} placeholder="(92) 99999-9999" />
                </div>
                <div className="form-group">
                  <label>E-mail</label>
                  <input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} placeholder="Opcional" />
                </div>
              </div>
              <div className="form-group">
                <label>Data de Nascimento</label>
                <input type="date" className="form-control" value={form.dataNasc} onChange={e => setForm(p => ({ ...p, dataNasc: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Observações</label>
                <textarea className="form-control" rows={3} value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} placeholder="Preferências, alergias, etc." />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar} disabled={loading || !form.nome || !form.telefone}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Histórico */}
      {detalhe && (
        <div className="modal-overlay" onClick={() => setDetalhe(null)}>
          <div className="modal" style={{ maxWidth: 600 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{detalhe.nome}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetalhe(null)}>✕</button>
            </div>
            <div style={{ marginBottom: 16, color: 'var(--text-muted)', fontSize: 13 }}>
              📞 {detalhe.telefone} {detalhe.email && `· ✉️ ${detalhe.email}`}
              {detalhe.dataNasc && ` · 🎂 ${formatDate(detalhe.dataNasc)}`}
            </div>
            {detalhe.observacoes && (
              <div style={{ background: 'var(--bg)', padding: 12, borderRadius: 6, marginBottom: 16, fontSize: 13 }}>{detalhe.observacoes}</div>
            )}
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 10 }}>Histórico de Atendimentos</h3>
            {detalhe.agendamentos?.length === 0 ? (
              <div className="empty-state"><p>Nenhum atendimento registrado</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 300, overflowY: 'auto' }}>
                {detalhe.agendamentos?.map(a => {
                  const s = statusLabel(a.status)
                  return (
                    <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg)', borderRadius: 6 }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{a.servico.nome}</div>
                        <div style={{ color: 'var(--text-muted)', fontSize: 12 }}>{a.profissional.nome} · {formatDateTime(a.dataHora)}</div>
                      </div>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontWeight: 600, color: 'var(--success)', fontSize: 13 }}>{formatCurrency(a.servico.preco)}</span>
                        <span className={`badge ${s.cls}`}>{s.label}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setDetalhe(null)}>Fechar</button>
              <button className="btn btn-primary" onClick={() => { setDetalhe(null); abrirModal(detalhe) }}>✎ Editar</button>
            </div>
          </div>
        </div>
      )}

      {ToastComponent}
    </div>
  )
}
