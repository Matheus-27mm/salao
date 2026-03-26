import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { useToast } from '../../hooks/useToast'

const EMPTY = { nome: '', telefone: '', email: '', comissao: 40, servicosIds: [] }

export default function Profissionais() {
  const [profissionais, setProfissionais] = useState([])
  const [servicos, setServicos] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [loading, setLoading] = useState(false)
  const { showToast, ToastComponent } = useToast()

  const carregar = () => {
    api.get('/profissionais').then(r => setProfissionais(r.data))
    api.get('/servicos').then(r => setServicos(r.data))
  }

  useEffect(() => { carregar() }, [])

  const abrirModal = (p = null) => {
    if (p) {
      setEditando(p.id)
      setForm({ nome: p.nome, telefone: p.telefone || '', email: p.email || '', comissao: p.comissao, servicosIds: p.servicos.map(s => s.servicoId) })
    } else {
      setEditando(null)
      setForm(EMPTY)
    }
    setModal(true)
  }

  const toggleServico = (id) => {
    setForm(p => ({
      ...p,
      servicosIds: p.servicosIds.includes(id) ? p.servicosIds.filter(s => s !== id) : [...p.servicosIds, id]
    }))
  }

  const salvar = async () => {
    setLoading(true)
    try {
      if (editando) {
        await api.put(`/profissionais/${editando}`, form)
        showToast('Profissional atualizado', 'success')
      } else {
        await api.post('/profissionais', form)
        showToast('Profissional cadastrado', 'success')
      }
      setModal(false)
      carregar()
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao salvar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const desativar = async (id) => {
    if (!confirm('Desativar profissional?')) return
    await api.delete(`/profissionais/${id}`)
    showToast('Profissional desativado', 'success')
    carregar()
  }

  return (
    <div>
      <div className="page-header">
        <h1>Profissionais</h1>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Novo Profissional</button>
      </div>

      <div className="grid-3">
        {profissionais.filter(p => p.ativo).map(p => (
          <div key={p.id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, background: 'var(--rose-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, color: 'var(--rose)' }}>
                  {p.nome[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700 }}>{p.nome}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{p.telefone || 'Sem telefone'}</div>
                </div>
              </div>
              <span className="badge badge-rose">{p.comissao}%</span>
            </div>

            {p.servicos.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 14 }}>
                {p.servicos.map(s => (
                  <span key={s.servicoId} className="badge badge-gray">{s.servico.nome}</span>
                ))}
              </div>
            )}

            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => abrirModal(p)}>✎ Editar</button>
              <button className="btn btn-ghost btn-sm" onClick={() => desativar(p.id)}>✕</button>
            </div>
          </div>
        ))}

        {profissionais.filter(p => p.ativo).length === 0 && (
          <div style={{ gridColumn: '1/-1' }}>
            <div className="empty-state card">
              <div className="empty-icon">✂️</div>
              <p>Nenhum profissional cadastrado</p>
            </div>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? 'Editar Profissional' : 'Novo Profissional'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Nome *</label>
                <input className="form-control" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Nome completo" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Telefone</label>
                  <input className="form-control" value={form.telefone} onChange={e => setForm(p => ({ ...p, telefone: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Comissão (%)</label>
                  <input type="number" className="form-control" value={form.comissao} min={0} max={100} onChange={e => setForm(p => ({ ...p, comissao: Number(e.target.value) }))} />
                </div>
              </div>
              <div className="form-group">
                <label>E-mail</label>
                <input type="email" className="form-control" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Serviços que realiza</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
                  {servicos.map(s => (
                    <button key={s.id} type="button"
                      className={`btn btn-sm ${form.servicosIds.includes(s.id) ? 'btn-primary' : 'btn-secondary'}`}
                      onClick={() => toggleServico(s.id)}>
                      {s.nome}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar} disabled={loading || !form.nome}>
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
