const mongoose = require('mongoose');

const usuarioSchema = mongoose.Schema({
  nombreCompleto: {
    type: String,
    required: true,
  },
  usuario: {
    type: String,
    required: true,
    unique: true,
  },
  correo: {
    type: String,
    required: true,
    unique: true,
  },
  telefono: String,
  matricula: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rol: {
    type: String,
    default: 'normal', // puede ser normal, admin, superadmin
  },
  creadoPor: {
    type: String, 
  }
});

module.exports = mongoose.model('Usuarios', usuarioSchema);
