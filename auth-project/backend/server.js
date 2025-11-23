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
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());

// Configurar sesiones para Passport
app.use(session({
  secret: process.env.JWT_SECRET || 'secret-key',
  resave: false,
  saveUninitialized: false
}));

// Inicializar Passport
app.use(passport.initialize());
app.use(passport.session());

// Conexión a MongoDB
console.log('🔄 Conectando a MongoDB...');
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err.message));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ 
    message: '🚀 API funcionando correctamente',
    timestamp: new Date(),
    port: process.env.PORT || 5000
  });
});

// Health check para Render
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date(),
    mongodb: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado'
  });
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

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Puerto y Host
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

console.log('🔍 Configuración del servidor:');
console.log('   PORT:', PORT);
console.log('   HOST:', HOST);
console.log('   NODE_ENV:', process.env.NODE_ENV || 'development');

// Iniciar servidor
const server = app.listen(PORT, HOST, function() {
  console.log(`✅ Servidor iniciado exitosamente en ${HOST}:${PORT}`);
});

// Evento de listening
server.on('listening', () => {
  const addr = server.address();
  console.log(`🎉 SERVIDOR ACTIVO - Puerto: ${addr.port}, Host: ${addr.address}`);
});

// Manejo de errores del servidor
server.on('error', (error) => {
  console.error('❌ Error del servidor:', error);
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`);
  }
  process.exit(1);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM recibido. Cerrando servidor...');
  server.close(() => {
    console.log('✅ Servidor cerrado');
    mongoose.connection.close(false, () => {
      console.log('✅ Conexión MongoDB cerrada');
      process.exit(0);
    });
  });
});

module.exports = app;