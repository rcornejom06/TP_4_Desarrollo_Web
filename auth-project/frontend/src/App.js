// src/App.js
import React, { useState, useEffect } from 'react';
import { LogIn, UserPlus, LogOut, User, Mail, Lock, Chrome } from 'lucide-react';

// ⚠️ IMPORTANTE: Cambia esta URL cuando despliegues en producción
const API_URL = 'http://localhost:5000/api';

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

  useEffect(() => {
    if (token) {
      obtenerPerfil();
    }

    // Capturar token de OAuth desde URL
    const params = new URLSearchParams(window.location.search);
    const tokenOAuth = params.get('token');
    if (tokenOAuth) {
      setToken(tokenOAuth);
      localStorage.setItem('token', tokenOAuth);
      window.history.replaceState({}, '', '/');
    }
  }, [token]);

  const obtenerPerfil = async () => {
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
  };

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
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const loginConGoogle = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const logout = () => {
    setToken(null);
    setUsuario(null);
    localStorage.removeItem('token');
    setMensaje({ tipo: '', texto: '' });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Pantalla cuando el usuario está logueado
  if (usuario) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full mx-auto flex items-center justify-center mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-800">¡Bienvenido!</h2>
          </div>

          <div className="space-y-4 mb-6">
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Nombre</p>
              <p className="text-lg font-semibold text-gray-800">{usuario.nombre}</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-lg font-semibold text-gray-800">{usuario.email}</p>
            </div>
            {usuario.edad && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Edad</p>
                <p className="text-lg font-semibold text-gray-800">{usuario.edad} años</p>
              </div>
            )}
          </div>

          <button
            onClick={logout}
            className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            <LogOut className="w-5 h-5" />
            Cerrar Sesión
          </button>
        </div>
      </div>
    );
  }

  // Pantalla de login/registro
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {vista === 'login' ? 'Iniciar Sesión' : 'Registrarse'}
          </h1>
          <p className="text-gray-600">Autenticación con JWT + OAuth</p>
        </div>

        {mensaje.texto && (
          <div className={`mb-4 p-4 rounded-lg ${
            mensaje.tipo === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}>
            {mensaje.texto}
          </div>
        )}

        <div className="space-y-4 mb-4">
          {vista === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {vista === 'register' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad (opcional)
              </label>
              <input
                type="number"
                name="edad"
                value={formData.edad}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition"
          >
            {vista === 'login' ? (
              <>
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </>
            ) : (
              <>
                <UserPlus className="w-5 h-5" />
                Registrarse
              </>
            )}
          </button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-gray-500">O continuar con</span>
          </div>
        </div>

        <button
          onClick={loginConGoogle}
          className="w-full bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center gap-2 transition mb-4"
        >
          <Chrome className="w-5 h-5 text-red-500" />
          Google
        </button>

        <div className="text-center">
          <button
            onClick={() => setVista(vista === 'login' ? 'register' : 'login')}
            className="text-purple-600 hover:text-purple-800 font-medium transition"
          >
            {vista === 'login' 
              ? '¿No tienes cuenta? Regístrate' 
              : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
}