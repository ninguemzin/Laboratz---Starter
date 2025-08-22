const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); // Importamos nosso Model de Usuário
const Card = require('../models/Card');
const auth = require('../middleware/authMiddleware');
// --- ROTA DE REGISTRO ---
// @route   POST /api/users/register
// @desc    Registra um novo usuário
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validação simples
    if (!username || !password) {
      return res.status(400).json({ msg: 'Por favor, insira todos os campos.' });
    }

    // 2. Verifica se o usuário já existe
    let user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'Usuário já existe.' });
    }

    // 3. Cria o novo usuário com o nosso Model
    user = new User({ username, password });

    // 4. Criptografa a senha antes de salvar
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // 5. Salva o usuário no banco de dados MongoDB
    await user.save();

// 6. ADICIONA CARTAS INICIAIS AO NOVO USUÁRIO
const starterCards = await Card.find().limit(5); // Pega as 5 primeiras cartas do DB
user.cardCollection = starterCards.map(card => card._id);
await user.save(); // Salva o usuário com sua nova coleção


    // 6. Cria e retorna um token JWT para o usuário já sair logado
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET, // Precisaremos adicionar isso ao .env
      { expiresIn: 36000 }, // Token expira em 10 horas
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// --- ROTA DE LOGIN ---
// @route   POST /api/users/login
// @desc    Autentica um usuário e retorna o token
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Validação
    if (!username || !password) {
      return res.status(400).json({ msg: 'Por favor, insira todos os campos.' });
    }

    // 2. Verifica se o usuário existe
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    // 3. Compara a senha enviada com a senha criptografada no banco
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ msg: 'Credenciais inválidas.' });
    }

    // 4. Se a senha estiver correta, retorna um novo token
    const payload = { user: { id: user.id } };
    jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: 36000 },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// @route   GET /api/users
// @desc    Get user data
router.get('/', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET /api/users/collection
// @desc    Get the logged-in user's card collection
// @access  Private
router.get('/collection', auth, async (req, res) => {
  try {
    // 1. Encontra o usuário no banco de dados usando o ID do token
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ msg: 'Usuário não encontrado.' });
    }

    // 2. Usa o método .populate() para buscar os dados completos de cada carta
    //    na coleção do usuário.
    await user.populate('cardCollection');

    // 3. Retorna a coleção de cartas populada
    res.json(user.cardCollection);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});


module.exports = router;