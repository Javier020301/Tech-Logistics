import { useState } from 'react'
import { solveSimplex, solveGraphical } from '../services/api'

interface Product {
  name: string
  profit: number
}

interface Resource {
  name: string
  rhs: number
  coeffs: number[]
}

export default function Simplex() {
  const [method, setMethod] = useState<'simplex' | 'graphical'>('simplex')
  const [products, setProducts] = useState<Product[]>([
    { name: 'Mouse', profit: 5 },
    { name: 'Teclado', profit: 8 },
  ])
  const [resources, setResources] = useState<Resource[]>([
    { name: 'Centro', rhs: 4, coeffs: [1, 0] },
    { name: 'Sur', rhs: 12, coeffs: [0, 2] },
  ])
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const addProduct = () => {
    setProducts(prev => [...prev, { name: '', profit: 0 }])
    setResources(prev => prev.map(r => ({ ...r, coeffs: [...r.coeffs, 0] })))
  }
  const removeProduct = (i: number) => {
    if (products.length <= 1) return
    setProducts(prev => prev.filter((_, idx) => idx !== i))
    setResources(prev => prev.map(r => ({ ...r, coeffs: r.coeffs.filter((_, idx) => idx !== i) })))
  }
  const updateProduct = (i: number, field: keyof Product, value: string | number) => {
    setProducts(prev => prev.map((p, idx) => idx === i ? { ...p, [field]: value } : p))
  }

  const addResource = () => {
    setResources(prev => [...prev, { name: '', rhs: 0, coeffs: products.map(() => 0) }])
  }
  const removeResource = (i: number) => {
    if (resources.length <= 1) return
    setResources(prev => prev.filter((_, idx) => idx !== i))
  }
  const updateResource = (i: number, field: keyof Resource, value: string | number) => {
    setResources(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r))
  }
  const updateCoeff = (ri: number, ci: number, value: number) => {
    setResources(prev => prev.map((r, idx) => idx === ri ? { ...r, coeffs: r.coeffs.map((c, j) => j === ci ? value : c) } : r))
  }

  const handleRun = async () => {
    const validP = products.filter(p => p.name.trim() && p.profit > 0)
    const validR = resources.filter(r => r.name.trim() && r.rhs > 0)
    if (validP.length === 0) { setError('Agrega al menos un producto válido'); return }
    if (validR.length === 0) { setError('Agrega al menos un recurso'); return }
    if (method === 'graphical' && validP.length !== 2) { setError('El método gráfico requiere exactamente 2 productos'); return }

    setLoading(true); setError('')
    try {
      const body = {
        objective_type: 'max',
        variables: validP.map(p => p.name),
        objective_coeffs: validP.map(p => p.profit),
        constraints: validR.map(r => ({
          coeffs: r.coeffs.slice(0, validP.length),
          rhs: r.rhs,
          sense: '<=',
        })),
      }
      const data = method === 'simplex' ? await solveSimplex(body) : await solveGraphical(body)
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="card" style={{ borderLeft: '4px solid #4361ee', marginBottom: 16 }}>
        <h2 style={{ color: '#4361ee' }}>Plan de Producción</h2>
        <p style={{ color: '#555', fontSize: 14, lineHeight: 1.5 }}>
          Define tus productos, sucursales y recursos. El sistema calcula las cantidades óptimas
          que <strong>maximizan tu ganancia</strong>.
        </p>
      </div>

      <div className="card">
        <div className="flex gap-4" style={{ alignItems: 'end', flexWrap: 'wrap' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Método de cálculo</label>
            <select value={method} onChange={e => { setMethod(e.target.value as 'simplex' | 'graphical'); setResult(null) }}>
              <option value="simplex">Simplex (N productos)</option>
              <option value="graphical">Gráfico (2 productos)</option>
            </select>
          </div>

        </div>
      </div>

      <div className="card">
        <div className="flex flex-between" style={{ marginBottom: 12 }}>
          <h2 style={{ margin: 0 }}>Tabla de producción</h2>
          <div className="flex gap-4">
            <button className="btn-secondary" onClick={addProduct} disabled={method === 'graphical'} style={method === 'graphical' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>+ Producto</button>
            <button className="btn-secondary" onClick={addResource} disabled={method === 'graphical'} style={method === 'graphical' ? { opacity: 0.4, cursor: 'not-allowed' } : {}}>+ Sucursal/Recurso</button>
          </div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ minWidth: 100 }}>Sucursal / Recurso</th>
                {products.map((p, i) => (
                  <th key={i} style={{ minWidth: 100 }}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={p.name}
                        onChange={e => updateProduct(i, 'name', e.target.value)}
                        placeholder="Producto"
                        style={{ width: 80, padding: '2px 6px', fontSize: 12 }}
                      />
                      {products.length > 1 && method !== 'graphical' && (
                        <button className="btn-danger" onClick={() => removeProduct(i)} style={{ padding: '2px 6px', fontSize: 10 }}>X</button>
                      )}
                    </div>
                  </th>
                ))}
                <th style={{ minWidth: 100 }}>Disponible</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((r, ri) => (
                <tr key={ri}>
                  <td>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                      <input
                        type="text"
                        value={r.name}
                        onChange={e => updateResource(ri, 'name', e.target.value)}
                        placeholder="Sucursal"
                        style={{ width: 90, padding: '2px 6px', fontSize: 12 }}
                      />
                      {resources.length > 1 && (
                        <button className="btn-danger" onClick={() => removeResource(ri)} style={{ padding: '2px 6px', fontSize: 10 }}>X</button>
                      )}
                    </div>
                  </td>
                  {products.map((_, ci) => (
                    <td key={ci}>
                      <input
                        type="number"
                        value={r.coeffs[ci] ?? 0}
                        onChange={e => updateCoeff(ri, ci, parseFloat(e.target.value) || 0)}
                        style={{ width: 60, padding: '4px 6px' }}
                        step="0.1"
                      />
                    </td>
                  ))}
                  <td>
                    <input
                      type="number"
                      value={r.rhs || ''}
                      onChange={e => updateResource(ri, 'rhs', parseFloat(e.target.value) || 0)}
                      style={{ width: 70, padding: '4px 6px', fontWeight: 600 }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
          Los coeficientes indican cuánto consume cada producto del recurso por unidad producida.
        </p>
      </div>

      <div className="card">
        <h2>Función Objetivo</h2>
        <table>
          <thead><tr><th>Producto</th><th>Ganancia por unidad</th></tr></thead>
          <tbody>
            {products.map((p, i) => (
              <tr key={i}>
                <td><strong>{p.name || `Producto ${i + 1}`}</strong></td>
                <td>
                  $ <input
                    type="number"
                    value={p.profit || ''}
                    onChange={e => updateProduct(i, 'profit', parseFloat(e.target.value) || 0)}
                    style={{ width: 80, padding: '4px 8px', fontWeight: 600 }}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p style={{ color: '#888', fontSize: 12, marginTop: 8 }}>
          Maximizar: Z = {products.filter(p => p.name.trim()).map((p, i) => `(${p.profit} × ${p.name})`).join(' + ')}
        </p>
      </div>

      <button className="btn-primary" onClick={handleRun} disabled={loading} style={{ fontSize: 16, padding: '12px 32px' }}>
        {loading ? 'Calculando...' : `Calcular con ${method === 'simplex' ? 'Simplex' : 'Método Gráfico'}`}
      </button>

      {error && <div className="card" style={{ marginTop: 16, borderLeft: '4px solid #e63946' }}><p style={{ color: '#e63946' }}>{error}</p></div>}

      {result && (
        <>
          <div className="card" style={{ marginTop: 16, borderLeft: '4px solid #4361ee', background: '#f0f4ff' }}>
            <div className="flex flex-between">
              <div>
                <p style={{ fontSize: 13, color: '#888' }}>GANANCIA MÁXIMA PROYECTADA</p>
                <h2 style={{ color: '#4361ee', fontSize: 36, margin: 0 }}>${result.objective_value?.toFixed(2)}</h2>
              </div>
              <span className="tag tag-success">{result.status}</span>
            </div>
          </div>

          {method === 'simplex' && result.variables && (
            <>
              <div className="card">
                <h2>Plan de Producción</h2>
                <table>
                  <thead><tr><th>Producto</th><th>Cantidad</th><th>Costo Reducido</th></tr></thead>
                  <tbody>
                    {Object.entries(result.variables).map(([k, v]: any) => {
                      const rc = result.reduced_costs?.[k]
                      return (
                        <tr key={k}>
                          <td><strong>{k}</strong></td>
                          <td style={{ fontSize: 18, fontWeight: 700 }}>{v.toFixed(2)} und.</td>
                          <td>{rc?.toFixed(2) ?? '-'}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
                <p style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
                  {Object.entries(result.variables).map(([k, v]: any) => {
                    const p = products.find(pr => pr.name === k)
                    return `${Number(v).toFixed(0)} ${k} × $${p?.profit ?? 0}`
                  }).join(' + ')} = ${result.objective_value?.toFixed(2)}
                </p>
              </div>

              {result.shadow_prices && (
                <div className="card">
                  <h2>Análisis de Sensibilidad</h2>
                  <table>
                    <thead><tr><th>Recurso</th><th>Precio Dual (sombra)</th><th>Holgura</th></tr></thead>
                    <tbody>
                      {Object.entries(result.shadow_prices).map(([k, v]: any, i: number) => (
                        <tr key={k}>
                          <td><strong>{resources[i]?.name || k}</strong></td>
                          <td style={{ fontWeight: 700, color: '#4361ee' }}>${v.toFixed(4)}</td>
                          <td>{result.slack?.[k]?.toFixed(2) ?? '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {method === 'graphical' && (
            <>
              {result.solution_point && (
                <div className="card">
                  <h2>Punto Óptimo</h2>
                  <table>
                    <thead><tr><th>Producto</th><th>Cantidad</th></tr></thead>
                    <tbody>
                      {Object.entries(result.solution_point).map(([k, v]: any) => (
                        <tr key={k}>
                          <td>{k}</td>
                          <td style={{ fontSize: 18, fontWeight: 700 }}>{v.toFixed(2)} und.</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ color: '#888', fontSize: 13, marginTop: 8 }}>
                    {Object.entries(result.solution_point).map(([k, v]: any) => {
                      const p = products.find(pr => pr.name === k)
                      return `${Number(v).toFixed(0)} ${k} × $${p?.profit ?? 0}`
                    }).join(' + ')} = ${result.objective_value?.toFixed(2)}
                  </p>
                </div>
              )}

              {result.plot_base64 && (
                <div className="card" style={{ textAlign: 'center' }}>
                  <h2>Región Factible</h2>
                  <img src={`data:image/png;base64,${result.plot_base64}`} alt="Gráfico" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid #e8e8e8' }} />
                  <p style={{ marginTop: 12, color: '#888', fontSize: 13 }}>
                    Eje X = {products[0]?.name}, Eje Y = {products[1]?.name}
                  </p>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
