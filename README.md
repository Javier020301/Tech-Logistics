# Tech-Logistics

Sistema de optimización logística para pequeños y medianos negocios dedidcados a la venta de tecnología. Permite calcular el plan de producción óptimo que maximiza la ganancia, sujeto a restricciones de recursos (tiempo, presupuesto, espacio, etc.).

## Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Backend**: Python 3.12 + FastAPI
- **Motor de optimización**: PuLP (CBC solver)
- **Visualización gráfica**: Matplotlib

## Requisitos

- Docker + Docker Compose

## Inicio rápido

```bash
docker compose up -d
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- Documentación API: http://localhost:8000/docs

### Credenciales

- Usuario: `admin`
- Contraseña: `admin123`

## Funcionalidades

### Plan de Producción (única página)

Una tabla unificada donde defines:

| Sucursal / Recurso | Producto 1 | Producto 2 | ... | Disponible |
|---|---|---|---|---|
| Centro | 1 | 0 | ... | 4 |
| Sur | 0 | 2 | ... | 12 |

- **Productos**: nombre y ganancia por unidad (agregar/eliminar columnas)
- **Recursos**: nombre, coeficientes de consumo por producto, y cantidad disponible (agregar/eliminar filas)
- **Función objetivo**: se muestra debajo de la tabla con la expresión `Maximizar: Z = (5 × Mouse) + (8 × Teclado)`

### Métodos de cálculo

- **Simplex** (N productos) — resuelve con N productos y M recursos. Muestra plan de producción, costos reducidos, precios duales (sombra) y holgura por recurso.
- **Gráfico** (2 productos) — limitado a 2 productos. Muestra el punto óptimo y la región factible en un gráfico generado con Matplotlib.

Siempre maximiza ganancia (no incluye minimización).

## API

### Autenticación

```
POST /auth/login
{ "username": "admin", "password": "admin123" }
→ { "access_token": "...", "token_type": "bearer" }
```

### LP (requiere token Bearer)

```
POST /linear/simplex
{ "objective_type": "max", "variables": [...], "objective_coeffs": [...], "constraints": [...] }
→ { "objective_value": 68.0, "variables": {...}, "reduced_costs": {...}, "shadow_prices": {...}, "slack": {...} }

POST /linear/graphical
{ "objective_type": "max", "variables": ["A","B"], "objective_coeffs": [...], "constraints": [...] }
→ { "objective_value": 68.0, "solution_point": {...}, "plot_base64": "...", "status": "Optimal" }
```

### Health

```
GET /health → { "status": "ok" }
```

## Estructura

```
Tech-Logistics/
├── backend/
│   ├── app/
│   │   ├── api/          # auth.py, deps.py, linear.py
│   │   ├── core/         # config.py (clave secreta, algoritmo)
│   │   ├── schemas/      # modelos Pydantic
│   │   ├── services/     # lp_simplex.py, lp_graphical.py
│   │   └── main.py       # punto de entrada FastAPI
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/   # Layout.tsx (sidebar + navbar)
│   │   ├── pages/        # Login.tsx, Simplex.tsx
│   │   ├── services/     # api.ts (cliente HTTP)
│   │   ├── App.tsx       # rutas
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
├── docker-compose.yml
└── README.md
```
