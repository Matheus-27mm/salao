import { useState, useEffect } from 'react'
import api from '../../utils/api'
import { formatCurrency } from '../../utils/format'
import { useToast } from '../../hooks/useToast'

const EMPTY = { nome: '', categoria: '', quantidadeAtual: 0, quantidadeMin: 5, unidade: 'un', preco: '' }

export default function Estoque() {
  const [produtos, setProdutos] = useState([])
  const [modal, setModal] = useState(false)
  const [movModal, setMovModal] = useState(null)
  const [editando, setEditando] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [movForm, setMovForm] = useState({ tipo: 'entrada', quantidade: 1, obs: '' })
  const [loading, setLoading] = useState(false)
  const [filtroAlerta, setFiltroAlerta] = useState(false)
  const { showToast, ToastComponent } = useToast()

  const carregar = () => api.get('/estoque').then(r => setProdutos(r.data))
  useEffect(() => { carregar() }, [])

  const abrirModal = (p = null) => {
    if (p) {
      setEditando(p.id)
      setForm({ nome: p.nome, categoria: p.categoria || '', quantidadeAtual: p.quantidadeAtual, quantidadeMin: p.quantidadeMin, unidade: p.unidade, preco: p.preco || '' })
    } else {
      setEditando(null)
      setForm(EMPTY)
    }
    setModal(true)
  }

  const salvar = async () => {
    setLoading(true)
    try {
      const payload = { ...form, quantidadeAtual: Number(form.quantidadeAtual), quantidadeMin: Number(form.quantidadeMin), preco: form.preco ? Number(form.preco) : null }
      if (editando) {
        await api.put(`/estoque/${editando}`, payload)
        showToast('Produto atualizado', 'success')
      } else {
        await api.post('/estoque', payload)
        showToast('Produto criado', 'success')
      }
      setModal(false)
      carregar()
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro', 'error')
    } finally {
      setLoading(false)
    }
  }

  const salvarMovimentacao = async () => {
    setLoading(true)
    try {
      await api.post(`/estoque/${movModal.id}/movimentacao`, { ...movForm, quantidade: Number(movForm.quantidade) })
      showToast('Movimentação registrada', 'success')
      setMovModal(null)
      carregar()
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro', 'error')
    } finally {
      setLoading(false)
    }
  }

  const lista = filtroAlerta ? produtos.filter(p => p.quantidadeAtual <= p.quantidadeMin) : produtos
  const alertas = produtos.filter(p => p.quantidadeAtual <= p.quantidadeMin).length

  return (
    <div>
      <div className="page-header">
        <div>
          <h1>Estoque</h1>
          {alertas > 0 && <p style={{ color: 'var(--warning)', fontSize: 13, marginTop: 4 }}>⚠️ {alertas} produto(s) com estoque baixo</p>}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button className={`btn btn-sm ${filtroAlerta ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setFiltroAlerta(p => !p)}>
            ⚠️ Alertas {alertas > 0 && `(${alertas})`}
          </button>
          <button className="btn btn-primary" onClick={() => abrirModal()}>+ Novo Produto</button>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>Produto</th>
              <th>Categoria</th>
              <th>Quantidade</th>
              <th>Mínimo</th>
              <th>Preço Unit.</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 ? (
              <tr><td colSpan={7}><div className="empty-state"><div className="empty-icon">📦</div><p>{filtroAlerta ? 'Nenhum produto em alerta' : 'Nenhum produto cadastrado'}</p></div></td></tr>
            ) : lista.map(p => {
              const emAlerta = p.quantidadeAtual <= p.quantidadeMin
              return (
                <tr key={p.id}>
                  <td><strong>{p.nome}</strong></td>
                  <td>{p.categoria || '-'}</td>
                  <td>
                    <strong style={{ color: emAlerta ? 'var(--danger)' : 'var(--text)' }}>
                      {p.quantidadeAtual} {p.unidade}
                    </strong>
                  </td>
                  <td>{p.quantidadeMin} {p.unidade}</td>
                  <td>{p.preco ? formatCurrency(p.preco) : '-'}</td>
                  <td>
                    <span className={`badge ${emAlerta ? 'badge-red' : 'badge-green'}`}>
                      {emAlerta ? '⚠️ Baixo' : '✓ OK'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => { setMovModal(p); setMovForm({ tipo: 'entrada', quantidade: 1, obs: '' }) }}>
                        ↕ Mov.
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => abrirModal(p)}>✎</button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Modal produto */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? 'Editar Produto' : 'Novo Produto'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Nome *</label>
                <input className="form-control" value={form.nome} onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} placeholder="Ex: Shampoo Profissional" />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Categoria</label>
                  <input className="form-control" value={form.categoria} onChange={e => setForm(p => ({ ...p, categoria: e.target.value }))} placeholder="Ex: Coloração" />
                </div>
                <div className="form-group">
                  <label>Unidade</label>
                  <select className="form-control" value={form.unidade} onChange={e => setForm(p => ({ ...p, unidade: e.target.value }))}>
                    <option value="un">Unidade (un)</option>
                    <option value="ml">Mililitro (ml)</option>
                    <option value="g">Grama (g)</option>
                    <option value="kg">Quilograma (kg)</option>
                    <option value="l">Litro (l)</option>
                  </select>
                </div>
              </div>
              <div className="grid-3">
                <div className="form-group">
                  <label>Qtd Atual</label>
                  <input type="number" className="form-control" value={form.quantidadeAtual} min={0} step={0.01} onChange={e => setForm(p => ({ ...p, quantidadeAtual: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Qtd Mínima</label>
                  <input type="number" className="form-control" value={form.quantidadeMin} min={0} step={0.01} onChange={e => setForm(p => ({ ...p, quantidadeMin: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label>Preço Unit.</label>
                  <input type="number" className="form-control" value={form.preco} min={0} step={0.01} onChange={e => setForm(p => ({ ...p, preco: e.target.value }))} placeholder="Opcional" />
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

      {/* Modal movimentação */}
      {movModal && (
        <div className="modal-overlay" onClick={() => setMovModal(null)}>
          <div className="modal" style={{ maxWidth: 400 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Movimentação</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setMovModal(null)}>✕</button>
            </div>
            <p style={{ marginBottom: 16, fontWeight: 600 }}>{movModal.nome} — atual: <strong>{movModal.quantidadeAtual} {movModal.unidade}</strong></p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Tipo</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  {['entrada', 'saida'].map(t => (
                    <button key={t} type="button" className={`btn btn-sm ${movForm.tipo === t ? 'btn-primary' : 'btn-secondary'}`}
                      style={{ flex: 1 }} onClick={() => setMovForm(p => ({ ...p, tipo: t }))}>
                      {t === 'entrada' ? '↑ Entrada' : '↓ Saída'}
                    </button>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label>Quantidade *</label>
                <input type="number" className="form-control" value={movForm.quantidade} min={0.01} step={0.01} onChange={e => setMovForm(p => ({ ...p, quantidade: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Observação</label>
                <input className="form-control" value={movForm.obs} onChange={e => setMovForm(p => ({ ...p, obs: e.target.value }))} placeholder="Opcional" />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setMovModal(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvarMovimentacao} disabled={loading}>
                {loading ? 'Salvando...' : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {ToastComponent}
    </div>
  )
}
