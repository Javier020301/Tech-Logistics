import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { login } from '../services/api'

export default function Login() {
  const [username, setUsername] = useState('admin')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const data = await login(username, password)
      localStorage.setItem('token', data.access_token)
      navigate('/')
    } catch (err: any) {
      setError(err.message)
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1a1a2e, #16213e)' }}>
      <div className="card" style={{ width: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <h2 style={{ color: '#4361ee' }}>Tech-Logistics</h2>
          <p style={{ color: '#888', fontSize: 13 }}>Sistema de Optimización Logística</p>
        </div>
        <form onSubmit={handleSubmit}>
          {error && <div className="tag tag-danger" style={{ marginBottom: 12, display: 'block', textAlign: 'center' }}>{error}</div>}
          <div className="form-group">
            <label>Usuario</label>
            <input value={username} onChange={e => setUsername(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Contraseña</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 8 }}>Ingresar</button>
        </form>
        <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#aaa' }}>
          Usuario: admin / Contraseña: admin123
        </p>
      </div>
    </div>
  )
}
