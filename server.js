// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const passport = require('./config/passport');

const app = express();

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

// Rutas
app.get('/', (req, res) => {
  res.json({ message: '🚀 API funcionando correctamente' });
});

// Importar middleware de autenticación
const verificarToken = require('./middleware/auth');

// Importar rutas
const authRoutes = require('./routes/auth');
const usuariosRoutes = require('./routes/usuarios');

// Rutas públicas (no requieren token)
app.use('/api/auth', authRoutes);

// Rutas protegidas (requieren token)
app.use('/api/usuarios', verificarToken, usuariosRoutes);

// Ruta protegida de perfil
app.use('/api/auth/perfil', verificarToken, authRoutes);

// Puerto
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});