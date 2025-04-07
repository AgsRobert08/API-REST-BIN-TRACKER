const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const usuariosSchema = require('../models/usuarios');

// Función para generar una nueva matrícula
const generateMatricula = async () => {
  const lastUser = await usuariosSchema.findOne().sort({ matricula: -1 }).exec();
  if (!lastUser) return '001';

  const lastMatriculaNum = parseInt(lastUser.matricula, 10);
  if (isNaN(lastMatriculaNum)) throw new Error("Matrícula inválida");

  return (lastMatriculaNum + 1).toString().padStart(3, '0');
};

// POST - Registrar nuevo usuario (rol normal)
router.post('/usuarios', async (req, res) => {
  try {
    const { nombreCompleto, usuario, correo, telefono, password, creadoPor } = req.body;

    const matricula = await generateMatricula();
    const hashedPassword = await bcrypt.hash(password, 10);

    const nuevoUsuario = new usuariosSchema({
      nombreCompleto,
      usuario,
      correo,
      telefono,
      matricula,
      password: hashedPassword,
      rol: 'normal',
      creadoPor
    });

    const data = await nuevoUsuario.save();
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Listar todos los usuarios
router.get('/usuarios', async (req, res) => {
  try {
    const data = await usuariosSchema.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT - Actualizar usuario por matrícula
router.put('/usuarios/:matricula', async (req, res) => {
  try {
    const { matricula } = req.params;
    const { nombreCompleto, usuario, correo, telefono, password } = req.body;

    const updateData = { nombreCompleto, usuario, correo, telefono };
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const result = await usuariosSchema.updateOne({ matricula }, { $set: updateData });

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado o sin cambios" });
    }

    res.json({ message: "Usuario actualizado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Eliminar usuario
router.delete('/usuarios/:matricula', async (req, res) => {
  try {
    const { matricula } = req.params;
    const result = await usuariosSchema.deleteOne({ matricula });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.json({ message: "Usuario eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
