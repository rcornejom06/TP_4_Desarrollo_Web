// src/App.js
import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import AdminPanel from './AdminPanel';

const API_URL = process.env.REACT_APP_API_URL;

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [usuario, setUsuario] = useState(null);
  const [vista, setVista] = useState('login');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    edad: ''
  });
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const logout = useCallback(() => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    setMensaje({ tipo: '', texto: '' });
  }, []);

  const obtenerPerfil = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/auth/perfil`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUsuario(data);
      } else {
        logout();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [token, logout]);

  useEffect(() => {
    if (token) {
      obtenerPerfil();
    }

    const params = new URLSearchParams(window.location.search);
    const tokenOAuth = params.get('token');
    if (tokenOAuth) {
      setToken(tokenOAuth);
      localStorage.setItem('token', tokenOAuth);
      window.history.replaceState({}, '', '/');
    }
  }, [token, obtenerPerfil]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    const endpoint = vista === 'login' ? 'login' : 'register';
    const body = vista === 'login' 
      ? { email: formData.email, password: formData.password }
      : formData;

    try {
      const res = await fetch(`${API_URL}/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        setUsuario(data.usuario);
        setMensaje({ tipo: 'success', texto: data.message });
        setFormData({ nombre: '', email: '', password: '', edad: '' });
      } else {
        setMensaje({ tipo: 'error', texto: data.error });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión con el servidor' });
    }
  };

const loginConGoogle = () => {
  window.location.href = `${process.env.REACT_APP_API_URL}/auth/google`;
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Si el usuario está logueado, mostrar directamente el CRUD
  if (usuario) {
    return <AdminPanel token={token} onLogout={logout} />;
  }

  // Pantalla de login/registro
  return (
    <div className="container">
      <div className="card">
        <div className="card-header">
          <h1>{vista === 'login' ? 'Iniciar Sesión' : 'Registrarse'}</h1>
          <p className="subtitle">Autenticación con JWT + OAuth</p>
        </div>

        {mensaje.texto && (
          <div className={`mensaje ${mensaje.tipo}`}>
            {mensaje.texto}
          </div>
        )}

        <div className="form-container">
          {vista === 'register' && (
            <div className="form-group">
              <label>Nombre Completo</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  required
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label>Email</label>
            <div className="input-wrapper">
              <span className="input-icon">✉️</span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {vista === 'register' && (
            <div className="form-group">
              <label>Edad (opcional)</label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                placeholder="25"
              />
            </div>
          )}

          <button onClick={handleSubmit} className="btn btn-primary">
            {vista === 'login' ? '🔐 Iniciar Sesión' : '✨ Registrarse'}
          </button>
        </div>

        <div className="divider">
          <span>O continuar con</span>
        </div>

        <button onClick={loginConGoogle} className="btn btn-google">
          <span className="google-icon">G</span>
          Google
        </button>

        <div className="toggle-vista">
          <button onClick={() => setVista(vista === 'login' ? 'register' : 'login')}>
            {vista === 'login' 
              ? '¿No tienes cuenta? Regístrate' 
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}
