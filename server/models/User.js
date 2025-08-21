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
  // Futuramente, podemos adicionar a coleção de cartas aqui
  // cardCollection: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Card' }]
}, {
  timestamps: true // Adiciona os campos createdAt e updatedAt automaticamente
});

module.exports = mongoose.models.User || mongoose.model('User', userSchema);