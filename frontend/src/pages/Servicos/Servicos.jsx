import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { formatCurrency } from '../../utils/format'
import { useToast } from '../../hooks/useToast'

const EMPTY = { nome: '', preco: '', duracaoMin: 60, descricao: '' }

export default function Servicos() {
  const [servicos, setServicos] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const { showToast, ToastComponent } = useToast()

  const carregar = () => api.get('/servicos').then(r => setServicos(r.data))
  useEffect(() => { carregar() }, [])

  const abrirModal = (s = null) => {
    if (s) {
      setEditando(s.id)
      setForm({ nome: s.nome, preco: s.preco, duracaoMin: s.duracaoMin, descricao: s.descricao || '' })
    } else {
      setEditando(null)
      setForm(EMPTY)
    }
    setModal(true)
  }

  const salvar = async () => {
    setLoading(true)
    try {
      const payload = { ...form, preco: Number(form.preco), duracaoMin: Number(form.duracaoMin) }
      if (editando) {
        await api.put(`/servicos/${editando}`, payload)
        showToast('Serviço atualizado', 'success')
      } else {
        await api.post('/servicos', payload)
        showToast('Serviço criado', 'success')
      }
      setModal(false)
      carregar()
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1>Serviços</h1>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Novo Serviço</button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Serviço</th>
              <th>Preço</th>
              <th>Duração</th>
              <th>Descrição</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.length === 0 ? (
              <tr><td colSpan={5}><div className="empty-state"><div className="empty-icon">💅</div><p>Nenhum serviço cadastrado</p></div></td></tr>
            ) : servicos.map(s => (
              <tr key={s.id}>
                <td><strong>{s.nome}</strong></td>
                <td><span style={{ color: 'var(--success)', fontWeight: 600 }}>{formatCurrency(s.preco)}</span></td>
                <td>{s.duracaoMin} min</td>
                <td style={{ color: 'var(--text-muted)' }}>{s.descricao || '-'}</td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => abrirModal(s)}>✎ Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? 'Editar Serviço' : 'Novo Serviço'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Nome *</label>
                <input className="form-control" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Corte Feminino" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Preço (R$) *</label>
                  <input type="number" className="form-control" value={form.preco} min={0} step={0.01} onChange={e => setForm(p => ({ ...p, preco: e.target.value }))} placeholder="0,00" />
                </div>
                <div className="form-group">
                  <label>Duração (min) *</label>
                  <input type="number" className="form-control" value={form.duracaoMin} min={15} step={15} onChange={e => setForm(p => ({ ...p, duracaoMin: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea className="form-control" rows={2} value={form.descricao} onChange={e => setForm(p => ({ ...p, descricao: e.target.value }))} placeholder="Opcional" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar} disabled={loading || !form.nome || !form.preco}>
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
