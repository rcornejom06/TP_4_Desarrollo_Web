const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const Usuario = require('../auth-project/backend/models/Usuario');
const bcrypt = require('bcryptjs');

passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/auth/google/callback"
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      // Buscar usuario por Google ID
      let usuario = await Usuario.findOne({ googleId: profile.id });

      if (usuario) {
        // Usuario ya existe
        return done(null, usuario);
      }

      // Verificar si existe usuario con ese email
      usuario = await Usuario.findOne({ email: profile.emails[0].value });

      if (usuario) {
        // Vincular cuenta de Google a usuario existente
        usuario.googleId = profile.id;
        await usuario.save();
        return done(null, usuario);
      }

      // Crear nuevo usuario
      const passwordAleatorio = Math.random().toString(36).slice(-8);
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(passwordAleatorio, salt);

      const nuevoUsuario = new Usuario({
        googleId: profile.id,
        nombre: profile.displayName,
        email: profile.emails[0].value,
        password: passwordHash,
        activo: true
      });

      await nuevoUsuario.save();
      done(null, nuevoUsuario);
    } catch (error) {
      done(error, null);
    }
  }
));

passport.serializeUser((usuario, done) => {
  done(null, usuario.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const usuario = await Usuario.findById(id);
    done(null, usuario);
  } catch (error) {
    done(error, null);
  }
});

module.exports = passport;