const jwt = require('jsonwebtoken');

const verificarToken = (req, res, next) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers['authorization'];
    
    if (!authHeader) {
      return res.status(401).json({ 
        error: 'Acceso denegado. No se proporcionó token' 
      });
    }

    // El formato esperado es: "Bearer TOKEN"
    const token = authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Acceso denegado. Token inválido' 
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Añadir información del usuario al request
    req.usuario = decoded;
    
    next(); // Continuar al siguiente middleware o ruta
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: 'Token expirado. Por favor inicia sesión nuevamente' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: 'Token inválido' 
      });
    }

    res.status(500).json({ 
      error: 'Error al verificar token',
      detalle: error.message 
    });
  }
};

module.exports = verificarToken;