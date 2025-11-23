// routes/usuarios.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');

// CREATE - Crear nuevo usuario
router.post('/', async (req, res) => {
  try {
    const { nombre, email, password, edad } = req.body;

    // Validar que los campos requeridos existan
    if (!nombre || !email || !password) {
      return res.status(400).json({ 
        error: 'Nombre, email y password son requeridos' 
      });
    }

    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ email });
    if (usuarioExistente) {
      return res.status(400).json({ 
        error: 'El email ya está registrado' 
      });
    }

    // Encriptar password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Crear usuario
    const nuevoUsuario = new Usuario({
      nombre,
      email,
      password: passwordHash,
      edad
    });

    await nuevoUsuario.save();

    // Responder sin enviar el password
    const usuarioRespuesta = nuevoUsuario.toObject();
    delete usuarioRespuesta.password;

    res.status(201).json({
      message: 'Usuario creado exitosamente',
      usuario: usuarioRespuesta
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al crear usuario', 
      detalle: error.message 
    });
  }
});

// READ - Obtener todos los usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.find()
      .select('-password') // No enviar passwords
      .sort({ createdAt: -1 }); // Más recientes primero

    res.json({
      total: usuarios.length,
      usuarios
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al obtener usuarios',
      detalle: error.message 
    });
  }
});

// READ - Obtener usuario por ID
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.params.id)
      .select('-password');

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al obtener usuario',
      detalle: error.message 
    });
  }
});

// UPDATE - Actualizar usuario
router.put('/:id', async (req, res) => {
  try {
    const { nombre, email, edad, activo, password } = req.body;
    
    const actualizacion = {};
    if (nombre) actualizacion.nombre = nombre;
    if (email) actualizacion.email = email;
    if (edad !== undefined) actualizacion.edad = edad;
    if (activo !== undefined) actualizacion.activo = activo;

    // Si se envía nuevo password, encriptarlo
    if (password) {
      const salt = await bcrypt.genSalt(10);
      actualizacion.password = await bcrypt.hash(password, salt);
    }

    const usuarioActualizado = await Usuario.findByIdAndUpdate(
      req.params.id,
      actualizacion,
      { new: true, runValidators: true }
    ).select('-password');

    if (!usuarioActualizado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario actualizado exitosamente',
      usuario: usuarioActualizado
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al actualizar usuario',
      detalle: error.message 
    });
  }
});

// DELETE - Eliminar usuario
router.delete('/:id', async (req, res) => {
  try {
    const usuarioEliminado = await Usuario.findByIdAndDelete(req.params.id);

    if (!usuarioEliminado) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      message: 'Usuario eliminado exitosamente',
      usuario: {
        id: usuarioEliminado._id,
        nombre: usuarioEliminado.nombre,
        email: usuarioEliminado.email
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al eliminar usuario',
      detalle: error.message 
    });
  }
});

module.exports = router;