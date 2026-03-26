import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../utils/api'
import './Login.css'

export default function Setup() {
  const [form, setForm] = useState({ nome: '', email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      await api.post('/auth/setup', form)
      navigate('/login')
    } catch (err) {
      setErro(err.response?.data?.error || 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-brand">
          <span className="login-mark">✦</span>
          <div>
            <h1 className="login-title">Setup</h1>
            <p className="login-tagline">Criar conta admin</p>
          </div>
        </div>
        <div className="login-divider" />
        {erro && <div className="login-error">{erro}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Nome</label>
            <input className="form-control" value={form.nome}
              onChange={e => setForm(p => ({ ...p, nome: e.target.value }))} required placeholder="Seu nome" />
          </div>
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" className="form-control" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required placeholder="seu@email.com" />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input type="password" className="form-control" value={form.senha}
              onChange={e => setForm(p => ({ ...p, senha: e.target.value }))} required placeholder="Mínimo 6 caracteres" minLength={6} />
          </div>
          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
            {loading ? 'Criando...' : 'Criar conta'}
          </button>
        </form>
        <p className="login-setup-link">Já tem conta? <Link to="/login">Fazer login</Link></p>
      </div>
    </div>
  )
}
