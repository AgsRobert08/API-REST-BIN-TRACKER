const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');

/** Importamos los modelos y rutas */
const Usuario = require('./models/usuarios');
const contenedorRoutes = require('./routes/contenedor');
const usuariosRoutes = require('./routes/usuarios');
const datosSensor = require('./routes/sensor');
const contactosRoutes = require('./routes/contactos');
const authRoutes = require('./routes/auth');

const app = express();
const port = process.env.PORT || 9000;
const host = process.env.HOST || 'localhost';

/** Middleware */
app.use(cors());
app.use(express.json());

/** Rutas de la API */
app.use('/api', contenedorRoutes);
app.use('/api', usuariosRoutes);
app.use('/api', datosSensor);
app.use('/api', contactosRoutes);
app.use('/api', authRoutes);

/** Ruta base */
app.get('/', (req, res) => {
    res.send('✅ Servidor Bin Tracker ejecutado con éxito!!');
});

/** Conexión a MongoDB */
mongoose.connect(process.env.MONGODB_URI);

/** Evento: Conexión exitosa */
mongoose.connection.on('connected', async () => {
    console.log('✅ Conectado a la base de datos Mongo Atlas');

    // Crear superadmin si no existe
    await crearSuperadminSiNoExiste();
});

/** Evento: Error en conexión */
mongoose.connection.on('error', (err) => {
    console.log('❌ Error en la conexión a MongoDB:', err);
});

/** Iniciar servidor */
app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Servidor corriendo en http://0.0.0.0:${port}`);
  });
  
/** Función para crear el superadmin automáticamente */
async function crearSuperadminSiNoExiste() {
    try {
        const existe = await Usuario.findOne({ usuario: 'superadmin' });
        if (existe) {
            console.log('🟢 Usuario superadmin ya existe.');
            return;
        }

        const passwordHasheada = await bcrypt.hash('admin123', 10);

        const nuevo = new Usuario({
            nombreCompleto: 'Super Administrador',
            usuario: 'superadmin',
            correo: 'betoazhueyapa@gmail.com',
            telefono: 1234567890,
            matricula: '000',
            password: passwordHasheada,
            rol: 'superadmin'
        });

        await nuevo.save();
        console.log('✅ Usuario superadmin creado con éxito (usuario: superadmin, contraseña: admin123)');
    } catch (error) {
        console.error('❌ Error al crear superadmin:', error);
    }
}
