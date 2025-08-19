const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const PORT = process.env.PORT || 4000;

// simples store na memória (para protótipo)
const games = {}; // gameId -> { board, players, turn }

function elementAdvantage(e1, e2) {
  if (e1 === e2) return 0;
  if (e1 === "mecanico" && e2 === "mutante") return 1;
  if (e1 === "mutante" && e2 === "radioativo") return 1;
  if (e1 === "radioativo" && e2 === "mecanico") return 1;
  if (e2 === "mecanico" && e1 === "mutante") return -1;
  if (e2 === "mutante" && e1 === "radioativo") return -1;
  if (e2 === "radioativo" && e1 === "mecanico") return -1;
  return 0;
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
    if (game.players.length >= 2) return socket.emit("errorMsg", "Sala cheia");
    game.players.push(socket.id);
    socket.join(gameId);
    io.to(gameId).emit("gameState", game);
  });

  socket.on("playCard", ({ gameId, r, c, card }) => {
    const game = games[gameId];
    if (!game) return;
    // valida turno simples
    if (game.turn !== socket.id)
      return socket.emit("errorMsg", "Não é seu turno");
    const player = socket.id;
    placeCard(game, r, c, card, player);
    // trocar turno
    game.turn = game.players.find((id) => id !== socket.id) || socket.id;
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
