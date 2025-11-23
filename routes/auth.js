// routes/auth.js
const express = require('express');
const router = express.Router();
const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('../config/passport');

// POST /login - Autenticar usuario y generar token
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y password son requeridos' 
      });
    }

    // Buscar usuario por email
    const usuario = await Usuario.findOne({ email });
    if (!usuario) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar password
    const passwordValido = await bcrypt.compare(password, usuario.password);
    if (!passwordValido) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        id: usuario._id, 
        email: usuario.email,
        nombre: usuario.nombre 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' } // Token válido por 24 horas
    );

    res.json({
      message: 'Login exitoso',
      token,
      usuario: {
        id: usuario._id,
        nombre: usuario.nombre,
        email: usuario.email,
        edad: usuario.edad,
        activo: usuario.activo
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error en el servidor',
      detalle: error.message 
    });
  }
});

// POST /register - Registrar nuevo usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password, edad } = req.body;

    // Validar campos
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

    // Generar token automáticamente
    const token = jwt.sign(
      { 
        id: nuevoUsuario._id, 
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      usuario: {
        id: nuevoUsuario._id,
        nombre: nuevoUsuario.nombre,
        email: nuevoUsuario.email,
        edad: nuevoUsuario.edad
      }
    });
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al registrar usuario',
      detalle: error.message 
    });
  }
});

// GET /perfil - Obtener perfil del usuario autenticado
router.get('/perfil', async (req, res) => {
  try {
    // req.usuario viene del middleware de autenticación
    const usuario = await Usuario.findById(req.usuario.id)
      .select('-password');

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(usuario);
  } catch (error) {
    res.status(500).json({ 
      error: 'Error al obtener perfil',
      detalle: error.message 
    });
  }
});

// OAuth con Google - Iniciar autenticación
router.get('/google',
  passport.authenticate('google', { 
    scope: ['profile', 'email'],
    session: false 
  })
);

// OAuth con Google - Callback
router.get('/google/callback',
  passport.authenticate('google', { 
    failureRedirect: '/login',
    session: false 
  }),
  (req, res) => {
    // Generar token JWT
    const token = jwt.sign(
      { 
        id: req.user._id, 
        email: req.user.email,
        nombre: req.user.nombre 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Redireccionar al frontend con el token
    const frontendURL = process.env.FRONTEND_URL || 'http://localhost:3000';
    res.redirect(`${frontendURL}/auth/success?token=${token}`);
  }
);

module.exports = router;