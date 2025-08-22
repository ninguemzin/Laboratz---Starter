import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import deckRoutes from '../routes/deckRoutes';
import userRoutes from '../routes/userRoutes'; // <-- 1. IMPORT user routes
import User from '../models/User';
import Card from '../models/Card';
import authMiddleware from '../middleware/authMiddleware';
require('dotenv').config();

// Configuração do app de teste
const app = express();
app.use(express.json());

// 2. ADICIONE AS ROTAS DE USUÁRIO AO APP DE TESTE
app.use('/api/users', userRoutes); 
// O middleware de autenticação é aplicado aqui apenas para as rotas de deck
app.use('/api/decks', authMiddleware, deckRoutes);


describe('Deck API Routes', () => {
  let token;
  let testUser;

  // Conexão com o banco
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI.replace('Cluster0', 'laboratz_test_db_decks');
    await mongoose.connect(mongoUri);
    // Limpar e popular as cartas uma vez antes de todos os testes de deck
    await Card.deleteMany({});
    const cardsSeed = require('../data/cards_seed.json');
    await Card.insertMany(cardsSeed);
  });

  // Limpeza e criação do usuário/token antes de cada teste
  beforeEach(async () => {
    await User.deleteMany({});
    
    // Agora o registro funcionará, pois a rota /api/users/register existe no nosso app de teste
    await request(app)
      .post('/api/users/register')
      .send({ username: 'decktester', password: 'password' });

    // E o login também funcionará
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ username: 'decktester', password: 'password' });

    token = loginRes.body.token;
    testUser = await User.findOne({ username: 'decktester' });
  });

  // Desconexão após todos os testes
  afterAll(async () => {
    await mongoose.connection.close();
  });

  describe('POST /api/decks', () => {
    it('should create a new empty deck for the logged-in user', async () => {
      const res = await request(app)
        .post('/api/decks')
        .set('x-auth-token', token);

      expect(res.statusCode).toBe(201);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body.length).toBe(1);
      expect(res.body[0].name).toBe('Deck 1');
      
      const userInDb = await User.findById(testUser._id);
      expect(userInDb.decks.length).toBe(1);
    });
  });
});