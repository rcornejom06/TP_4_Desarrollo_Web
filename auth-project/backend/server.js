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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Conectado a MongoDB'))
  .catch((err) => console.error('❌ Error conectando a MongoDB:', err));

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ message: '🚀 API funcionando correctamente' });
});

// Health check para Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
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

console.log(`🔍 Intentando iniciar servidor en ${HOST}:${PORT}`);
console.log(`📦 NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
console.log(`🔌 Puerto desde variable: ${process.env.PORT}`);

// Iniciar servidor
const server = app.listen(PORT, HOST, (err) => {
  if (err) {
    console.error('❌ Error al iniciar servidor:', err);
    process.exit(1);
  }
  console.log(`✅ Servidor escuchando exitosamente`);
  console.log(`🚀 Servidor corriendo en ${HOST}:${PORT}`);
  console.log(`📍 URL: http://${HOST}:${PORT}`);
});

// Timeout de seguridad
setTimeout(() => {
  console.log(`⏰ Servidor corriendo por 30 segundos - Puerto activo: ${PORT}`);
}, 30000);

server.on('listening', () => {
  const addr = server.address();
  console.log(`🎉 Servidor listening event - Puerto: ${addr.port}`);
});

// Manejo de errores del servidor
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`❌ Puerto ${PORT} ya está en uso`);
    process.exit(1);
  } else {
    console.error('❌ Error del servidor:', error);
    process.exit(1);
  }
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