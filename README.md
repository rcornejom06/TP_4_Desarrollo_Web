# 🔐 Sistema de Autenticación JWT + OAuth + CRUD

Sistema completo de autenticación con JWT, OAuth de Google, CRUD de usuarios y panel de administración.



## 🛠️ Tecnologías Utilizadas

### **Backend**
- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Bcrypt.js
- Passport.js + Google OAuth 2.0
- Express Session
- CORS

### **Frontend**
- React.js
- CSS3 (sin frameworks)
- LocalStorage para persistencia de tokens

---

## 📁 Estructura del Proyecto

```
auth-project/
│
├── backend/                    # Servidor Node.js
│   ├── config/
│   │   └── passport.js        # Configuración de Google OAuth
│   ├── middleware/
│   │   └── auth.js            # Middleware de verificación JWT
│   ├── models/
│   │   └── Usuario.js         # Modelo de datos de Usuario
│   ├── routes/
│   │   ├── auth.js            # Rutas de autenticación
│   │   └── usuarios.js        # Rutas CRUD de usuarios
│   ├── .env                   # Variables de entorno (NO subir a Git)
│   ├── .gitignore
│   ├── server.js              # Punto de entrada del servidor
│   └── package.json
│
└── frontend/                   # Aplicación React
    ├── public/
    ├── src/
    │   ├── App.js             # Componente principal
    │   ├── App.css            # Estilos de login/registro
    │   ├── AdminPanel.js      # Panel de administración CRUD
    │   ├── AdminPanel.css     # Estilos del panel
    │   ├── index.js
    │   └── index.css
    └── package.json
```

---

## 🚀 Instalación y Configuración

### **Requisitos Previos**

- Node.js (v18 o superior)
- npm o yarn
- Cuenta de MongoDB Atlas
- Cuenta de Google Cloud (para OAuth)

---

## 📦 INSTALACIÓN LOCAL

### **1. Clonar el Repositorio**

```bash
# Clonar 
git clone https://github.com/rcornejom06/TP_4_Desarrollo_Web.git
---

```bash
cd backend
npm install
```

#### **2.2 Crear archivo `.env`**

Crea un archivo `.env` en la carpeta `backend/` con el siguiente contenido:

```env
# MongoDB
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/authdb?retryWrites=true&w=majority

# JWT
JWT_SECRET=tu_secreto_super_seguro_cambiar_en_produccion

# Puerto
PORT=5000

# Google OAuth
GOOGLE_CLIENT_ID=tu_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=tu_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

#### **2.5 Ejecutar el backend**

```bash
# Modo desarrollo (con nodemon)
npm run dev

# Modo producción
npm start
```

El servidor estará en: `http://localhost:5000`

---

### **3. Configurar el Frontend**

#### **3.1 Instalar dependencias**

```bash
cd frontend
npm install
```

#### **3.2 Verificar la URL del API**

Abre `src/App.js` y `src/AdminPanel.js` y verifica que la URL sea:

```javascript
const API_URL = 'http://localhost:5000/api';
```

#### **3.3 Ejecutar el frontend**

```bash
npm start
```


## 🌐 Deploy en Producción

### **Backend en Render/Railway**

1. Sube tu código a GitHub
2. Crea un nuevo servicio en [Render.com](https://render.com/) o [Railway.app](https://railway.app/)
3. Conecta tu repositorio
4. Configura las variables de entorno (todas las del `.env`)
5. Start Command: `npm start`
6. Deploy

### **Frontend en Vercel**

1. Sube tu código a GitHub
2. Ve a [Vercel.com](https://vercel.com/)
3. Importa tu repositorio
4. Actualiza `API_URL` en `App.js` y `AdminPanel.js` con tu URL de producción
5. Deploy automático

### **Actualizar URLs después del deploy**

- En el backend `.env`: Actualiza `FRONTEND_URL` con tu URL de Vercel
- En Google OAuth: Agrega las URLs de producción
- En MongoDB Atlas: Asegúrate de que `0.0.0.0/0` esté permitido

---

## 📝 Scripts Disponibles

### **Backend**
```bash
npm start        # Ejecutar en producción
npm run dev      # Ejecutar en desarrollo con nodemon
```

### **Frontend**
```bash
npm start        # Ejecutar en desarrollo
npm run build    # Compilar para producción
```

---

---


## 🙏 Agradecimientos

- MongoDB Atlas por la base de datos gratuita
- Render/Railway por el hosting del backend
- Vercel por el hosting del frontend
- Google Cloud por OAuth 2.0

---

