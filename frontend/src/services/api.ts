const API_BASE = '/api';

function getToken(): string | null {
  return localStorage.getItem('token');
}

async function request(path: string, options: RequestInit = {}): Promise<any> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    throw new Error('Sesión expirada');
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.detail || 'Error en la solicitud');
  }
  return data;
}

export function login(username: string, password: string) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function solveSimplex(data: any) {
  return request('/linear/simplex', { method: 'POST', body: JSON.stringify(data) });
}

export function solveGraphical(data: any) {
  return request('/linear/graphical', { method: 'POST', body: JSON.stringify(data) });
}
