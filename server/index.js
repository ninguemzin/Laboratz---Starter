// 1. IMPORTS E CONFIGURAÇÕES INICIAIS
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
const cards = require('./data/cards_seed.json');
const cors = require('cors');

// 2. INICIALIZAÇÃO DO APP E SERVIDOR
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const PORT = process.env.PORT || 4000;
const Card = require('./models/Card');

// LÓGICA PARA POPULAR O BANCO DE DADOS (SEEDER)
const seedDatabase = async () => {
  try {
    // Verifica se já existem cartas no banco de dados
    const cardCount = await Card.countDocuments();
    if (cardCount > 0) {
      console.log('O banco de dados de cartas já está populado.');
      return;
    }

    // Se não houver cartas, insere as do arquivo de seed
    await Card.insertMany(cards);
    console.log('Banco de dados de cartas populado com sucesso!');
  } catch (error) {
    console.error('Erro ao popular o banco de dados de cartas:', error);
  }
};

connectDB().then(() => {
  seedDatabase();
});
// 4. MIDDLEWARE
// Permite que o Express leia o JSON do corpo das requisições para a API
app.use(cors());
app.use(express.json());

// 5. LÓGICA DO JOGO (FUNÇÕES AUXILIARES)
const games = {}; // Simples store na memória para o protótipo de jogo

// RESTAURADO: A função elementAdvantage precisa existir no servidor
function elementAdvantage(e1, e2) {
  const advantages = {
    mecanico: 'mutante',
    mutante: 'radioativo',
    radioativo: 'mecanico',
  };
  if (e1 === e2) return 0;
  if (advantages[e1] === e2) return 1;
  if (advantages[e2] === e1) return -1;
  return 0;
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

function createEmptyBoard() {
  return Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null));
}

function checkGameOver(game) {
  const isBoardFull = game.board.every((row) => row.every((cell) => cell !== null));
  if (!isBoardFull) return;

  const p1_id = game.players[0];
  const p2_id = game.players[1];
  let p1_score = 0;
  let p2_score = 0;

  for (const row of game.board) {
    for (const cell of row) {
      if (cell.owner === p1_id) p1_score++;
      if (cell.owner === p2_id) p2_score++;
    }
  }

  let winner = null;
  if (p1_score > p2_score) winner = p1_id;
  if (p2_score > p1_score) winner = p2_id;
  
  game.status = 'finished';
  game.winner = winner;
  game.score = { [p1_id]: p1_score, [p2_id]: p2_score };
}

function placeCard(game, r, c, card, player) {
  if (game.board[r][c]) return;
  game.board[r][c] = { card, owner: player };
  const dirs = [
    { dr: -1, dc: 0, side: 'top', opp: 'bottom' },
    { dr: 0, dc: 1, side: 'right', opp: 'left' },
    { dr: 1, dc: 0, side: 'bottom', opp: 'top' },
    { dr: 0, dc: -1, side: 'left', opp: 'right' },
  ];
  dirs.forEach(({ dr, dc, side, opp }) => {
    const nr = r + dr, nc = c + dc;
    if (nr < 0 || nr > 2 || nc < 0 || nc > 2) return;
    const neigh = game.board[nr][nc];
    if (!neigh || neigh.owner === player) return;
    let myVal = card.sides[side];
    let theirVal = neigh.card.sides[opp];
    const adv = elementAdvantage(card.element, neigh.card.element);
    if (adv === 1) myVal += 1;
    if (adv === -1) theirVal += 1;
    if (myVal > theirVal) neigh.owner = player;
  });
}

// 6. ROTAS DA API
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/decks', require('./routes/deckRoutes')); // <-- ADICIONE ESTA LINHA

// 7. LÓGICA DO SOCKET.IO
io.on('connection', (socket) => {
  console.log('socket connected', socket.id);

  socket.on('createGame', ({ gameId }) => {
    games[gameId] = {
      board: createEmptyBoard(),
      players: [socket.id],
      turn: socket.id,
    };
    socket.join(gameId);
    io.to(gameId).emit('gameState', games[gameId]);
  });

  socket.on('joinGame', ({ gameId }) => {
    const game = games[gameId];
    if (!game) return socket.emit('errorMsg', 'Jogo não existe');
    if (game.players.length >= 2) return socket.emit('errorMsg', 'Sala cheia');
    game.players.push(socket.id);
    socket.join(gameId);

    if (game.players.length === 2) {
      const shuffledDeck = shuffle([...cards]);
      game.hands = {
        [game.players[0]]: shuffledDeck.slice(0, 5),
        [game.players[1]]: shuffledDeck.slice(5, 10),
      };
      game.status = 'playing';
    }
    io.to(gameId).emit('gameState', game);
  });

  socket.on('playCard', ({ gameId, r, c, card }) => {
    const game = games[gameId];
    if (!game) return;
    if (game.turn !== socket.id) {
      return socket.emit('errorMsg', 'Não é seu turno');
    }
    const playerHand = game.hands[socket.id];
    const cardInHand = playerHand.find((c) => c.cardId === card.cardId);
    if (!cardInHand) {
      return socket.emit('errorMsg', 'Você não possui esta carta!');
    }
    if (game.board[r][c]) {
      return socket.emit('errorMsg', 'Este espaço já está ocupado!');
    }

    const player = socket.id;
    placeCard(game, r, c, card, player);
    game.hands[socket.id] = playerHand.filter((c) => c.cardId !== card.cardId);
    game.turn = game.players.find((id) => id !== socket.id) || socket.id;
    checkGameOver(game);
    io.to(gameId).emit('gameState', game);
  });

  socket.on('disconnect', () => {
    Object.keys(games).forEach((gid) => {
      const g = games[gid];
      g.players = g.players.filter((p) => p !== socket.id);
      if (g.players.length === 0) delete games[gid];
    });
  });
});

// 8. INICIAR O SERVIDOR (DEVE SER A ÚLTIMA COISA)
server.listen(PORT, () => console.log(`Server listening on port ${PORT}`));