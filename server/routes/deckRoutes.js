const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const User = require('../models/User');
const mongoose = require('mongoose');

// @route   POST /api/decks
// @desc    Create a new empty deck for the logged-in user
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    // Adiciona um novo deck com um nome padrão ao array de decks do usuário
    user.decks.push({ name: `Deck ${user.decks.length + 1}`, cards: [] });
    await user.save();

    res.status(201).json(user.decks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   GET /api/decks
// @desc    Get all decks for the logged-in user
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate({
      path: 'decks',
      populate: {
         path: 'cards',
         model: 'Card'
      }
   });

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    res.json(user.decks);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   PUT /api/decks/:id
// @desc    Update a specific deck
// @access  Private
router.put('/:id', auth, async (req, res) => {
  try {
    const { cards } = req.body; // Espera receber um array de IDs de cartas

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado' });
    }

    // Encontra o deck específico dentro do array de decks do usuário
    const deck = user.decks.id(req.params.id);
    if (!deck) {
      return res.status(404).json({ msg: 'Deck não encontrado' });
    }

    // Atualiza a lista de cartas do deck
    deck.cards = cards.map(cardId => new mongoose.Types.ObjectId(cardId));
    
    await user.save();
    res.json(deck);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});


module.exports = router;