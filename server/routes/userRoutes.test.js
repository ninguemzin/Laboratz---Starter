import { describe, it, expect, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import userRoutes from './userRoutes'; // Usaremos as rotas diretamente
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