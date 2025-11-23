// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');
const cors = require("cors");

const app = express();

app.use(cors({
  origin: "*",
  methods: "GET,POST,PUT,PATCH,DELETE",
  allowedHeaders: "Content-Type,Authorization"
}));

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Configurar sesiones para Passport
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '🚀 API funcionando correctamente' });
});

// Importar middleware de autenticación
const verificarToken = require('./middleware/auth');

// Importar rutas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');
const Usuario = require('./models/Usuario');

// Rutas públicas (no requieren token)
app.use('/api/auth', authRoutes);

// Ruta de perfil PROTEGIDA
app.get('/api/auth/perfil', verificarToken, async (req, res) => {
  try {
    const usuario = await Usuario.findById(req.usuario.id).select('-password');

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

// Rutas protegidas (requieren token)
app.use('/api/usuarios', verificarToken, usuariosRoutes);

// Puerto
const port = process.env.PORT || 5000;
app.listen(port, "0.0.0.0", () => {
  console.log(`Server running on port ${port}`);
});