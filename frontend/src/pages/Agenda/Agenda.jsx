import { useState, useEffect, useCallback } from 'react'
import api from '../../utils/api'
import { formatTime, formatCurrency, statusLabel } from '../../utils/format'
import { useToast } from '../../hooks/useToast'

const HORAS = Array.from({ length: 13 }, (_, i) => i + 8) // 8 às 20

function getWeekDays(base) {
  const d = new Date(base)
  const day = d.getDay()
  const monday = new Date(d)
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1))
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    return dt
  })
}

const diasSemana = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']

export default function Agenda() {
  const [semana, setSemana] = useState(new Date())
  const [agendamentos, setAgendamentos] = useState([])
  const [profissionais, setProfissionais] = useState([])
  const [clientes, setClientes] = useState([])
  const [servicos, setServicos] = useState([])
  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState(null)
  const [detalhe, setDetalhe] = useState(null)
  const [form, setForm] = useState({ clienteId: '', profissionalId: '', servicoId: '', dataHora: '', observacoes: '' })
  const [loading, setLoading] = useState(false)
  const { showToast, ToastComponent } = useToast()

  const dias = getWeekDays(semana)
  const inicio = dias[0].toISOString()
  const fim = new Date(dias[6]); fim.setHours(23,59,59,999)

  const carregarAgendamentos = useCallback(() => {
    api.get(`/agendamentos/semana?inicio=${inicio}&fim=${fim.toISOString()}`)
      .then(r => setAgendamentos(r.data))
      .catch(console.error)
  }, [inicio])

  useEffect(() => { carregarAgendamentos() }, [carregarAgendamentos])

  useEffect(() => {
    api.get('/profissionais').then(r => setProfissionais(r.data))
    api.get('/clientes').then(r => setClientes(r.data))
    api.get('/servicos').then(r => setServicos(r.data))
  }, [])

  const abrirModal = (dataHora = '') => {
    setEditando(null)
    setForm({ clienteId: '', profissionalId: '', servicoId: '', dataHora, observacoes: '' })
    setModal(true)
  }

  const salvar = async () => {
    setLoading(true)
    try {
      if (editando) {
        await api.put(`/agendamentos/${editando}`, form)
        showToast('Agendamento atualizado', 'success')
      } else {
        await api.post('/agendamentos', form)
        showToast('Agendamento criado', 'success')
      }
      setModal(false)
      carregarAgendamentos()
    } catch (err) {
      showToast(err.response?.data?.error || 'Erro ao salvar', 'error')
    } finally {
      setLoading(false)
    }
  }

  const atualizarStatus = async (id, status) => {
    try {
      await api.patch(`/agendamentos/${id}/status`, { status })
      showToast(`Status atualizado para "${status}"`, 'success')
      carregarAgendamentos()
      setDetalhe(null)
    } catch (err) {
      showToast('Erro ao atualizar', 'error')
    }
  }

  const semanaStr = `${dias[0].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} – ${dias[6].toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })}`

  const agsPorDiaHora = (diaIdx, hora) => {
    const dia = dias[diaIdx]
    return agendamentos.filter(a => {
      const d = new Date(a.dataHora)
      return d.getDate() === dia.getDate() && d.getMonth() === dia.getMonth() && d.getHours() === hora
    })
  }

  return (
    <div>
      <div className="page-header">
        <h1>Agenda</h1>
        <button className="btn btn-primary" onClick={() => abrirModal()}>+ Novo Agendamento</button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Navegação de semana */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="btn btn-secondary btn-sm" onClick={() => setSemana(d => { const n = new Date(d); n.setDate(d.getDate() - 7); return n })}>← Anterior</button>
          <span style={{ fontWeight: 600, fontSize: 14 }}>{semanaStr}</span>
          <button className="btn btn-secondary btn-sm" onClick={() => setSemana(d => { const n = new Date(d); n.setDate(d.getDate() + 7); return n })}>Próxima →</button>
          <button className="btn btn-ghost btn-sm" onClick={() => setSemana(new Date())}>Hoje</button>
        </div>

        {/* Grade */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 800 }}>
            <thead>
              <tr>
                <th style={{ width: 60, padding: '10px 12px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', fontSize: 11, color: 'var(--text-muted)' }}>Hora</th>
                {dias.map((dia, i) => {
                  const hoje = new Date()
                  const isHoje = dia.toDateString() === hoje.toDateString()
                  return (
                    <th key={i} style={{ padding: '10px 8px', background: isHoje ? 'var(--rose-bg)' : 'var(--bg)', borderBottom: '1px solid var(--border)', textAlign: 'center', fontSize: 12 }}>
                      <div style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{diasSemana[i]}</div>
                      <div style={{ color: isHoje ? 'var(--rose)' : 'var(--text)', fontWeight: 700, fontSize: 16, marginTop: 2 }}>{dia.getDate()}</div>
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {HORAS.map(hora => (
                <tr key={hora}>
                  <td style={{ padding: '6px 12px', fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, borderBottom: '1px solid #f3f4f6', textAlign: 'right', verticalAlign: 'top', paddingTop: 8 }}>
                    {hora}:00
                  </td>
                  {dias.map((dia, diaIdx) => {
                    const ags = agsPorDiaHora(diaIdx, hora)
                    return (
                      <td key={diaIdx} style={{ borderBottom: '1px solid #f3f4f6', borderLeft: '1px solid #f3f4f6', padding: '4px', verticalAlign: 'top', minHeight: 48, cursor: 'pointer' }}
                        onClick={() => {
                          const dt = new Date(dia)
                          dt.setHours(hora, 0, 0, 0)
                          const pad = n => String(n).padStart(2, '0')
                          const local = `${dt.getFullYear()}-${pad(dt.getMonth()+1)}-${pad(dt.getDate())}T${pad(hora)}:00`
                          abrirModal(local)
                        }}>
                        {ags.map(a => {
                          const s = statusLabel(a.status)
                          return (
                            <div key={a.id}
                              style={{ background: a.status === 'cancelado' ? '#f3f4f6' : a.status === 'concluido' ? '#d1fae5' : 'var(--rose-bg)', border: `1px solid ${a.status === 'cancelado' ? '#d1d5db' : a.status === 'concluido' ? '#a7f3d0' : '#fecdd3'}`, borderRadius: 6, padding: '4px 7px', marginBottom: 3, cursor: 'pointer', fontSize: 12 }}
                              onClick={e => { e.stopPropagation(); setDetalhe(a) }}>
                              <div style={{ fontWeight: 600, color: 'var(--text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.cliente.nome}</div>
                              <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>{a.servico.nome}</div>
                            </div>
                          )
                        })}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Novo/Editar */}
      {modal && (
        <div className="modal-overlay" onClick={() => setModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editando ? 'Editar Agendamento' : 'Novo Agendamento'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setModal(false)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div className="form-group">
                <label>Cliente</label>
                <select className="form-control" value={form.clienteId} onChange={e => setForm(p => ({ ...p, clienteId: e.target.value }))}>
                  <option value="">Selecione...</option>
                  {clientes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                </select>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label>Profissional</label>
                  <select className="form-control" value={form.profissionalId} onChange={e => setForm(p => ({ ...p, profissionalId: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {profissionais.filter(p => p.ativo).map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Serviço</label>
                  <select className="form-control" value={form.servicoId} onChange={e => setForm(p => ({ ...p, servicoId: e.target.value }))}>
                    <option value="">Selecione...</option>
                    {servicos.map(s => <option key={s.id} value={s.id}>{s.nome} — {formatCurrency(s.preco)}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Data e Hora</label>
                <input type="datetime-local" className="form-control" value={form.dataHora} onChange={e => setForm(p => ({ ...p, dataHora: e.target.value }))} />
              </div>
              <div className="form-group">
                <label>Observações</label>
                <textarea className="form-control" rows={2} value={form.observacoes} onChange={e => setForm(p => ({ ...p, observacoes: e.target.value }))} placeholder="Opcional..." />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModal(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={salvar} disabled={loading || !form.clienteId || !form.profissionalId || !form.servicoId || !form.dataHora}>
                {loading ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Detalhe */}
      {detalhe && (
        <div className="modal-overlay" onClick={() => setDetalhe(null)}>
          <div className="modal" style={{ maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Detalhes</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setDetalhe(null)}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cliente</span>
                <strong>{detalhe.cliente.nome}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Profissional</span>
                <strong>{detalhe.profissional.nome}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Serviço</span>
                <strong>{detalhe.servico.nome}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Valor</span>
                <strong style={{ color: 'var(--success)' }}>{formatCurrency(detalhe.servico.preco)}</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Horário</span>
                <strong>{new Date(detalhe.dataHora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</strong>
              </div>
              {detalhe.observacoes && (
                <div style={{ background: 'var(--bg)', padding: '10px 12px', borderRadius: 6, fontSize: 13 }}>
                  {detalhe.observacoes}
                </div>
              )}
            </div>

            <div className="modal-footer" style={{ flexWrap: 'wrap', gap: 8 }}>
              {detalhe.status === 'agendado' && (
                <>
                  <button className="btn btn-secondary btn-sm" onClick={() => atualizarStatus(detalhe.id, 'confirmado')}>✓ Confirmar</button>
                  <button className="btn btn-primary btn-sm" onClick={() => atualizarStatus(detalhe.id, 'concluido')}>✓ Concluir</button>
                  <button className="btn btn-danger btn-sm" onClick={() => atualizarStatus(detalhe.id, 'cancelado')}>✕ Cancelar</button>
                </>
              )}
              {detalhe.status === 'confirmado' && (
                <>
                  <button className="btn btn-primary btn-sm" onClick={() => atualizarStatus(detalhe.id, 'concluido')}>✓ Concluir</button>
                  <button className="btn btn-danger btn-sm" onClick={() => atualizarStatus(detalhe.id, 'cancelado')}>✕ Cancelar</button>
                </>
              )}
              <button className="btn btn-ghost btn-sm" onClick={() => setDetalhe(null)}>Fechar</button>
            </div>
          </div>
        </div>
      )}

      {ToastComponent}
    </div>
  )
}
