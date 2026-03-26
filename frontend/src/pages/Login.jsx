import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth.jsx'
import api from '../utils/api'
import './Login.css'

export default function Login() {
  const [form, setForm] = useState({ email: '', senha: '' })
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErro('')
    setLoading(true)
    try {
      const { data } = await api.post('/auth/login', form)
      login(data.token, data.usuario)
      navigate('/')
    } catch (err) {
      setErro(err.response?.data?.error || 'Credenciais inválidas')
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
            <h1 className="login-title">Salão</h1>
            <p className="login-tagline">Studio Management</p>
          </div>
        </div>
        <div className="login-divider" />
        {erro && <div className="login-error">{erro}</div>}
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>E-mail</label>
            <input type="email" className="form-control" value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required autoFocus placeholder="seu@email.com" />
          </div>
          <div className="form-group">
            <label>Senha</label>
            <input type="password" className="form-control" value={form.senha}
              onChange={e => setForm(p => ({ ...p, senha: e.target.value }))}
              required placeholder="••••••••" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg login-btn" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
        <p className="login-setup-link">Primeiro acesso? <Link to="/setup">Criar conta</Link></p>
      </div>
    </div>
  )
}
