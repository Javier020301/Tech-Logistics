import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Simplex from './pages/Simplex'
import Layout from './components/Layout'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const token = localStorage.getItem('token')
  return token ? <Layout>{children}</Layout> : <Navigate to="/login" />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<PrivateRoute><Simplex /></PrivateRoute>} />
    </Routes>
  )
}
