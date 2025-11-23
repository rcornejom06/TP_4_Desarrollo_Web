// src/AdminPanel.js
import React, { useState, useEffect } from 'react';
import './AdminPanel.css';

const API_URL = 'http://localhost:5000/api';

export default function AdminPanel({ token, onLogout }) {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    password: '',
    edad: ''
  });
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    obtenerUsuarios();
  }, []);

  const obtenerUsuarios = async () => {
    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsuarios(data.usuarios);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    try {
      const url = usuarioEditando 
        ? `${API_URL}/usuarios/${usuarioEditando._id}`
        : `${API_URL}/usuarios`;
      
      const method = usuarioEditando ? 'PUT' : 'POST';
      
      const body = usuarioEditando
        ? { nombre: formData.nombre, email: formData.email, edad: formData.edad }
        : formData;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ tipo: 'success', texto: data.message });
        setFormData({ nombre: '', email: '', password: '', edad: '' });
        setMostrarFormulario(false);
        setUsuarioEditando(null);
        obtenerUsuarios();
      } else {
        setMensaje({ tipo: 'error', texto: data.error });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error de conexión' });
    }
  };

  const handleEditar = (usuario) => {
    setUsuarioEditando(usuario);
    setFormData({
      nombre: usuario.nombre,
      email: usuario.email,
      password: '',
      edad: usuario.edad || ''
    });
    setMostrarFormulario(true);
    setMensaje({ tipo: '', texto: '' });
  };

  const handleEliminar = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;

    try {
      const res = await fetch(`${API_URL}/usuarios/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();

      if (res.ok) {
        setMensaje({ tipo: 'success', texto: data.message });
        obtenerUsuarios();
      } else {
        setMensaje({ tipo: 'error', texto: data.error });
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error al eliminar' });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const cancelarEdicion = () => {
    setMostrarFormulario(false);
    setUsuarioEditando(null);
    setFormData({ nombre: '', email: '', password: '', edad: '' });
    setMensaje({ tipo: '', texto: '' });
  };

  if (loading) {
    return (
      <div className="admin-container">
        <div className="loading">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>👥 Panel de Administración</h1>
        <button onClick={onLogout} className="btn btn-logout-admin">
          🚪 Cerrar Sesión
        </button>
      </div>

      {mensaje.texto && (
        <div className={`mensaje ${mensaje.tipo}`}>
          {mensaje.texto}
        </div>
      )}

      <div className="admin-actions">
        {!mostrarFormulario && (
          <button 
            onClick={() => setMostrarFormulario(true)} 
            className="btn btn-primary"
          >
            ➕ Nuevo Usuario
          </button>
        )}
      </div>

      {mostrarFormulario && (
        <div className="form-card">
          <h3>{usuarioEditando ? '✏️ Editar Usuario' : '➕ Crear Usuario'}</h3>
          <div className="form-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre"
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="email@ejemplo.com"
              required
              disabled={usuarioEditando}
            />
          </div>

          {!usuarioEditando && (
            <div className="form-group">
              <label>Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>
          )}

          <div className="form-group">
            <label>Edad</label>
            <input
              type="number"
              name="edad"
              value={formData.edad}
              onChange={handleChange}
              placeholder="25"
            />
          </div>

          <div className="form-buttons">
            <button onClick={handleSubmit} className="btn btn-success">
              {usuarioEditando ? '💾 Guardar' : '✨ Crear'}
            </button>
            <button onClick={cancelarEdicion} className="btn btn-secondary">
              ❌ Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="usuarios-table">
        <h3>📋 Lista de Usuarios ({usuarios.length})</h3>
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Edad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario._id}>
                <td>{usuario.nombre}</td>
                <td>{usuario.email}</td>
                <td>{usuario.edad || '-'}</td>
                <td>
                  <span className={`badge ${usuario.activo ? 'activo' : 'inactivo'}`}>
                    {usuario.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="acciones">
                  <button 
                    onClick={() => handleEditar(usuario)}
                    className="btn-icon btn-edit"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button 
                    onClick={() => handleEliminar(usuario._id)}
                    className="btn-icon btn-delete"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {usuarios.length === 0 && (
          <div className="empty-state">
            <p>No hay usuarios registrados</p>
          </div>
        )}
      </div>
    </div>
  );
}