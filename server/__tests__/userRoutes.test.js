import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import userRoutes from '../routes/userRoutes'; // Usaremos as rotas diretamente
import mongoose from 'mongoose';
import User from '../models/User';

require('dotenv').config();
// Configuração de um app Express de teste
const app = express();
app.use(express.json());
app.use('/api/users', userRoutes);

// Conexão com um banco de dados de teste
beforeAll(async () => {
  const mongoUri = process.env.MONGO_URI.replace('Cluster0', 'laboratz_test_db');
  vi.setConfig({ hookTimeout: 30000 });
  await mongoose.connect(mongoUri);
});

// Limpeza após os testes
afterAll(async () => {
  await User.deleteMany({});
  await mongoose.connection.close();
});

describe('POST /api/users/register', () => {
  it('should return 400 if username already exists', async () => {
    // Primeiro, criamos um usuário
    const user = { username: 'teste', password: 'password123' };
    await request(app).post('/api/users/register').send(user);

    // 🔴 TENTAMOS REGISTRAR O MESMO USUÁRIO NOVAMENTE
    const response = await request(app).post('/api/users/register').send(user);

    // Esperamos que o servidor retorne um erro 400 (Bad Request)
    expect(response.statusCode).toBe(400);
    expect(response.body.msg).toBe('Usuário já existe.');
  });
});

// server/__tests__/userRoutes.test.js
import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
// ... (outros imports, como request, app, mongoose, User, etc.)
import Card from '../models/Card'; // Importe o Card model

// ... (bloco 'describe' do '/register')

// vvv ADICIONE ESTE NOVO BLOCO DE TESTE vvv
describe('GET /api/users/collection', () => {
  let token;
  let testUser;
  let starterCards;

  // Antes de cada teste neste bloco, crie um usuário e faça login
  
  beforeEach(async () => {
    // Limpa o banco para garantir um teste isolado
    await User.deleteMany({});
    
    // 1. Registra um usuário de teste. A API irá criar o usuário E adicionar as cartas.
    await request(app)
      .post('/api/users/register')
      .send({ username: 'testuser_collection', password: 'password' });

    // 2. CORREÇÃO: Busca o usuário recém-criado diretamente do banco de dados.
    // Isso garante que estamos trabalhando com o objeto de usuário completo,
    // incluindo o array `cardCollection` que foi adicionado durante o registro.
    testUser = await User.findOne({ username: 'testuser_collection' });

    // 3. Pega as cartas para a verificação final no teste
    starterCards = await Card.find().limit(5);

    // 4. Faz login para obter o token de sessão
    const loginRes = await request(app)
      .post('/api/users/login')
      .send({ username: 'testuser_collection', password: 'password' });
    
    token = loginRes.body.token;
  });

  it('should fetch the logged-in user card collection', async () => {
    // 🔴 O TESTE VAI FALHAR AQUI, pois a rota não existe
    const res = await request(app)
      .get('/api/users/collection')
      .set('x-auth-token', token); // Envia o token no header

    // Verificações
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body.length).toBe(5);
    // Verifica se o nome da primeira carta retornada corresponde à primeira carta do banco
    expect(res.body[0].name).toBe(starterCards[0].name);
  });
});