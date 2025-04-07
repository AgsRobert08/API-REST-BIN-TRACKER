const express = require('express');
const router = express.Router();
const Usuario = require('../models/usuarios');
const bcrypt = require('bcrypt');

// 🔐 Login
router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;

  try {
    const user = await Usuario.findOne({ usuario });

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    const passwordValida = await bcrypt.compare(password, user.password);
    if (!passwordValida) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }

    // ✅ Enviar respuesta con datos relevantes (incluyendo _id)
    res.status(200).json({
      _id: user._id,
      usuario: user.usuario,
      rol: user.rol,
      nombreCompleto: user.nombreCompleto,
      matricula: user.matricula
    });

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ message: 'Error del servidor' });
  }
});

module.exports = router;
