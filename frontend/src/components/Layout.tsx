import { NavLink, useNavigate } from 'react-router-dom'

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login')
  }

  return (
    <div>
      <nav className="navbar">
        <h1>Tech-Logistics</h1>
        <div>
          <span style={{ color: '#4cc9f0', fontSize: 13, marginRight: 16 }}>Admin</span>
          <button className="btn-danger" onClick={handleLogout}>Salir</button>
        </div>
      </nav>
      <div className="layout">
        <aside className="sidebar">
          <h3>Optimización</h3>
          <NavLink to="/" end>Plan de Producción</NavLink>
        </aside>
        <main className="content">{children}</main>
      </div>
    </div>
  )
}
