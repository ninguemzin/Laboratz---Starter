// Adicione estas linhas no topo do arquivo
require('dotenv').config();
const connectDB = require('./config/db');

connectDB(); // Conecta ao banco de dados

// ... resto do seu código (const cards = require(...), etc.)

const cards = require("./cards_seed.json");

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 4000;

// simples store na memória (para protótipo)
const games = {}; // gameId -> { board, players, turn }

function checkGameOver(game) {
  const isBoardFull = game.board.every((row) =>
    row.every((cell) => cell !== null)
  );
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
  // Se for empate, winner continua null

  game.status = "finished";
  game.winner = winner;
  game.score = { [p1_id]: p1_score, [p2_id]: p2_score };
}

function createEmptyBoard() {
  return Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null));
}

function placeCard(game, r, c, card, player) {
  if (game.board[r][c]) return; // já ocupada
  game.board[r][c] = { card, owner: player };
  const dirs = [
    { dr: -1, dc: 0, side: "top", opp: "bottom" },
    { dr: 0, dc: 1, side: "right", opp: "left" },
    { dr: 1, dc: 0, side: "bottom", opp: "top" },
    { dr: 0, dc: -1, side: "left", opp: "right" },
  ];
  dirs.forEach(({ dr, dc, side, opp }) => {
    const nr = r + dr,
      nc = c + dc;
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

io.on("connection", (socket) => {
  console.log("socket connected", socket.id);

  socket.on("createGame", ({ gameId }) => {
    games[gameId] = {
      board: createEmptyBoard(),
      players: [socket.id],
      turn: socket.id,
    };
    socket.join(gameId);
    io.to(gameId).emit("gameState", games[gameId]);
  });

  socket.on("joinGame", ({ gameId }) => {
    const game = games[gameId];
    if (!game) return socket.emit("errorMsg", "Jogo não existe");
    if (game.players.length === 2) return socket.emit("errorMsg", "Sala cheia");
    game.players.push(socket.id);
    socket.join(gameId);

    // Quando a sala estiver cheia, comece o jogo!
    if (game.players.length === 2) {
      const shuffledDeck = shuffle([...cards]);
      game.hands = {
        [game.players[0]]: shuffledDeck.slice(0, 5),
        [game.players[1]]: shuffledDeck.slice(5, 10),
      };
      game.status = "playing"; // Adiciona um status ao jogo
    }
    io.to(gameId).emit("gameState", game);
  });

  socket.on("playCard", ({ gameId, r, c, card }) => {
    const game = games[gameId];
    if (!game) return;
    // Validação 1: É o turno do jogador? (Já existia, mas é importante)
    if (game.turn !== socket.id) {
      return socket.emit("errorMsg", "Não é seu turno");
    }

    // Validação 2: A carta jogada existe na mão do jogador?
    const playerHand = game.hands[socket.id];
    const cardInHand = playerHand.find((c) => c.cardId === card.cardId);

    if (!cardInHand) {
      return socket.emit("errorMsg", "Você não possui esta carta!");
    }

    // Validação 3: A posição no tabuleiro está vazia? (Já existia, mas reforçada)
    if (game.board[r][c]) {
      return socket.emit("errorMsg", "Este espaço já está ocupado!");
    }

    // --- FIM DAS NOVAS VALIDAÇÕES ---

    const player = socket.id;
    placeCard(game, r, c, card, player);

    // LÓGICA ESSENCIAL: Remover a carta da mão do jogador após a jogada
    game.hands[socket.id] = playerHand.filter((c) => c.cardId !== card.cardId);

    // Trocar turno
    game.turn = game.players.find((id) => id !== socket.id) || socket.id;

    // VERIFICAR FIM DE JOGO
    checkGameOver(game);

    io.to(gameId).emit("gameState", game);
  });

  socket.on("disconnect", () => {
    // limpeza simples
    Object.keys(games).forEach((gid) => {
      const g = games[gid];
      g.players = g.players.filter((p) => p !== socket.id);
      if (g.players.length === 0) delete games[gid];
    });
  });
});

server.listen(PORT, () => console.log("Server listening on", PORT));
