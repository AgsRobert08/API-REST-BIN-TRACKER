const mongoose = require('mongoose');

const sensorSchema = mongoose.Schema({
  matriculaContenedor: {
    type: String,
    required: true,
    ref: 'Contenedor'
  },
  temperatura: {
    type: Number,
    required: true
  },
  distancia: {
    type: Number,
    required: true
  },
  estado: {
    type: String,
    enum: ['vacío', 'medio', 'lleno', 'desconocido'],
    default: 'desconocido'
  },
  alertas: {
    type: [String],
    default: []
  },
  fechaRegistro: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Sensor', sensorSchema);
