const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  // CORREÇÃO: Este campo estava faltando no seu arquivo.
  cardCollection: [{
    type: mongoose.Schema.Types.ObjectId, // Diz que vamos armazenar IDs de outros documentos
    ref: 'Card'                           // Diz que esses IDs se referem a documentos do modelo 'Card'
  }]
}, {
  timestamps: true 
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);