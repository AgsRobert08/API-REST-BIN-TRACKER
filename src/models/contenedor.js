const mongoose = require('mongoose');

const contenedorSchema = mongoose.Schema({
  matricula: {
    type: String,
    unique: true,
    required: true
  },
  nombreZona: {
    type: String,
    required: true
  },
  tipoContenedor: {
    type: String,
    required: true
  },
  ubicacion: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  configSensor: {
    distanciaMin: { type: Number, default: 5 },
    distanciaMax: { type: Number, default: 50 },
    temperaturaMax: { type: Number, default: 40 }
  },
  asignadoA: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Usuarios',
    default: null // Puede estar sin asignar
  }
});

module.exports = mongoose.model('Contenedor', contenedorSchema);
