const express = require('express');
const router = express.Router();
const Sensor = require('../models/sensor');
const Contenedor = require('../models/contenedor');

// Crear nuevo dato del sensor
router.post('/sensor', async (req, res) => {
  try {
    const { matriculaContenedor, temperatura, distancia } = req.body;

    const contenedor = await Contenedor.findOne({ matricula: matriculaContenedor });
    if (!contenedor) {
      return res.status(404).json({ message: 'Contenedor no encontrado' });
    }

    const config = contenedor.configSensor;
    const alertas = [];

    if (distancia < config.distanciaMin) {
      alertas.push('Estoy lleno');
    }
    if (distancia > config.distanciaMax) {
      alertas.push('Estoy vacio');
    }
    if (temperatura > config.temperaturaMax) {
      alertas.push('Mucha temperatura');
    }

    let estado = 'desconocido';
    const rango = config.distanciaMax - config.distanciaMin;

    if (distancia <= config.distanciaMin + 0.2 * rango) {
      estado = 'lleno';
    } else if (distancia <= config.distanciaMin + 0.6 * rango) {
      estado = 'medio';
    } else {
      estado = 'vacío';
    }

    const sensorData = new Sensor({
      matriculaContenedor,
      temperatura,
      distancia,
      alertas,
      estado
    });

    const data = await sensorData.save();
    res.json(data);
  } catch (error) {
    console.error("Error al guardar sensor:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Obtener TODOS los registros por matrícula
router.get('/sensor/:matricula', async (req, res) => {
  try {
    const data = await Sensor.find({ matriculaContenedor: req.params.matricula })
      .sort({ fechaRegistro: -1 });
    res.json(data);
  } catch (error) {
    console.error("Error al obtener datos del sensor:", error);
    res.status(500).json({ message: error.message });
  }
});

// ✅ Obtener el ÚLTIMO registro
router.get('/sensor/:matricula/ultimo', async (req, res) => {
  try {
    const data = await Sensor.findOne({ matriculaContenedor: req.params.matricula })
      .sort({ fechaRegistro: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/sensor/:matricula/estadisticas', async (req, res) => {
    try {
      const { matricula } = req.params;
  
      const registros = await Sensor.find({ matriculaContenedor: matricula });
  
      if (!registros || registros.length === 0) {
        return res.status(404).json({ message: 'No hay registros para esta matrícula.' });
      }
  
      const total = registros.length;
      const estados = { lleno: 0, medio: 0, vacio: 0 };
      let sumaTemp = 0;
      let sumaDist = 0;
  
      registros.forEach((r) => {
        estados[r.estado] = (estados[r.estado] || 0) + 1;
        sumaTemp += r.temperatura;
        sumaDist += r.distancia;
      });
  
      res.json({
        count: total,
        promedioTemperatura: sumaTemp / total,
        promedioDistancia: sumaDist / total,
        conteoEstados: {
          lleno: estados.lleno,
          medio: estados.medio,
          vacio: estados.vacio
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  });
  

module.exports = router;
