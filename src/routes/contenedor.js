const express = require('express');
const router = express.Router();
const contenedorSchema = require('../models/contenedor');

// POST - Crear contenedor
router.post('/contenedor', async (req, res) => {
  try {
    const { nombreZona, tipoContenedor, ubicacion, configSensor, asignadoA } = req.body;

    const ultimo = await contenedorSchema.findOne().sort({ matricula: -1 });
    let nuevoNumero = 1;
    if (ultimo) {
      const numero = parseInt(ultimo.matricula.replace('BT', ''));
      nuevoNumero = numero + 1;
    }
    const nuevaMatricula = 'BT' + nuevoNumero.toString().padStart(3, '0');

    const contenedor = new contenedorSchema({
      matricula: nuevaMatricula,
      nombreZona,
      tipoContenedor,
      ubicacion,
      configSensor,
      asignadoA // nuevo campo
    });

    const data = await contenedor.save();
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET - Todos los contenedores
router.get('/contenedor', async (req, res) => {
  try {
    const data = await contenedorSchema.find().populate('asignadoA', 'nombreCompleto usuario');
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT - Actualizar contenedor por matrícula
router.put('/contenedor/:matricula', async (req, res) => {
  const { matricula } = req.params;
  const { nombreZona, tipoContenedor, ubicacion, configSensor, asignadoA } = req.body;

  try {
    const actualizado = await contenedorSchema.findOneAndUpdate(
      { matricula },
      { nombreZona, tipoContenedor, ubicacion, configSensor, asignadoA },
      { new: true }
    );

    if (!actualizado) {
      return res.status(404).json({ message: 'Contenedor no encontrado' });
    }

    res.json(actualizado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// DELETE - Eliminar contenedor
router.delete('/contenedor/:matricula', async (req, res) => {
  try {
    const { matricula } = req.params;
    const result = await contenedorSchema.deleteOne({ matricula });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Contenedor no encontrado' });
    }

    res.json({ message: 'Contenedor eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NUEVO - GET por usuario (ver contenedores asignados a un usuario)
router.get('/contenedor/usuario/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const data = await contenedorSchema.find({ asignadoA: id });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// NUEVO - PUT para asignar un contenedor a un usuario
router.put('/contenedor/:id/asignar', async (req, res) => {
    const { id } = req.params;
    const { asignadoA } = req.body;
    const contenedor = await contenedorSchema.findByIdAndUpdate(id, { asignadoA }, { new: true });
    res.json(contenedor);
  });
  

module.exports = router;
