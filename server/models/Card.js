const mongoose = require('mongoose');

const cardSchema = new mongoose.Schema({
  cardId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  element: { type: String, required: true },
  rarity: { type: String, required: true },
  sides: {
    top: { type: Number, required: true },
    right: { type: Number, required: true },
    bottom: { type: Number, required: true },
    left: { type: Number, required: true },
  },
  imageUrl: { type: String, required: true },
});

module.exports = mongoose.models.Card || mongoose.model('Card', cardSchema);