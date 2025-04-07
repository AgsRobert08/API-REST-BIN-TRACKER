const express = require('express');
const router = express.Router();
const Contacto = require('../models/contactos');
const Usuario = require('../models/usuarios');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// POST - Registrar nuevo contacto
router.post('/contacto', async (req, res) => {
    try {
        const { nombre, correo, telefono, mensaje } = req.body;

        const usuarioExistente = await Usuario.findOne({ correo });
        if (usuarioExistente) {
            return res.status(400).json({ message: 'Este correo ya está registrado como usuario.' });
        }

        const contactoExistente = await Contacto.findOne({ correo, estado: 'pendiente' });
        if (contactoExistente) {
            return res.status(400).json({ message: 'Ya has enviado una solicitud. Estamos en proceso de contactarte.' });
        }

        const nuevoContacto = new Contacto({ nombre, correo, telefono, mensaje });
        const data = await nuevoContacto.save();
        res.status(201).json(data);

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// GET - Obtener todas las solicitudes
router.get('/contacto', async (req, res) => {
    try {
        const contactos = await Contacto.find().sort({ fecha: -1 });
        res.status(200).json(contactos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// POST - Convertir contacto en usuario y enviar acceso
router.post('/contacto/convertir/:id', async (req, res) => {
    try {
        const contacto = await Contacto.findById(req.params.id);
        if (!contacto) {
            return res.status(404).json({ message: 'Contacto no encontrado.' });
        }

        const { nombre, correo, telefono } = contacto;

        // Verificar si ya es usuario
        const yaExiste = await Usuario.findOne({ correo });
        if (yaExiste) {
            return res.status(400).json({ message: 'Este contacto ya fue registrado como usuario.' });
        }

        // Generar credenciales
        const usuario = correo.split('@')[0];
        const passwordPlano = Math.random().toString(36).slice(-8);
        const passwordHasheada = await bcrypt.hash(passwordPlano, 10);

        // Generar matrícula automática
        const lastUser = await Usuario.findOne().sort({ matricula: -1 });
        const nuevaMatricula = lastUser
            ? String(parseInt(lastUser.matricula) + 1).padStart(3, '0')
            : '001';

        // Crear nuevo usuario
        const nuevoUsuario = new Usuario({
            nombreCompleto: nombre,
            correo,
            telefono: telefono || 0,
            usuario,
            matricula: nuevaMatricula,
            password: passwordHasheada,
            rol: 'admin'
        });

        await nuevoUsuario.save();

        // Marcar contacto como atendido
        contacto.estado = 'atendido';
        await contacto.save();

        // Validar variables necesarias
        const frontendUrl = process.env.FRONTEND_URL;
        if (!frontendUrl || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
            console.error('❌ Variables de entorno faltantes.');
            return res.status(500).json({ message: 'Error de configuración del servidor.' });
        }

        // Configurar transporte de correo
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        // Enviar correo con enlace dinámico
        await transporter.sendMail({
            from: `"Bin Tracker" <${process.env.MAIL_USER}>`,
            to: correo,
            subject: 'Acceso a Bin Tracker - Panel de Administrador',
            html: `
                <div style="font-family: Arial, sans-serif; color: #333;">
                    <h2 style="color: #2e7d32;">Bienvenido a Bin Tracker 🌱</h2>
                    <p>Ya puedes acceder a tu panel de monitoreo con estas credenciales:</p>
                    <ul>
                        <li><strong>Usuario:</strong> ${usuario}</li>
                        <li><strong>Contraseña:</strong> ${passwordPlano}</li>
                    </ul>
                    <p>
                        Accede desde: 
                        <a href="${frontendUrl}/LoginScreen" style="color: #2e7d32; font-weight: bold;">
                            ${frontendUrl}/LoginScreen
                        </a>
                    </p>
                    <br />
                    <p>Este acceso es exclusivo como <strong>Administrador</strong>. Desde tu panel podrás registrar a tu personal y gestionar tus contenedores de recolección.</p>
                    <p style="margin-top: 30px;">💡 Consejo: cambia tu contraseña al iniciar sesión por seguridad.</p>
                </div>
            `
        });

        console.log(`📬 Correo enviado a: ${correo}`);
        res.status(200).json({ message: '✅ Usuario creado y correo enviado correctamente.' });

    } catch (error) {
        console.error('❌ Error al convertir contacto:', error);
        res.status(500).json({ message: 'Error al crear el usuario desde el contacto.' });
    }
});

module.exports = router;
