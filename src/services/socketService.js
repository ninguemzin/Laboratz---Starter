import { io } from 'socket.io-client';

const socket = io('http://localhost:4000');

const socketService = {
  connect: (callback) => {
    socket.on('connect', () => {
      console.log('connected', socket.id);
      if (callback) callback(socket.id);
    });
  },
  onGameState: (callback) => {
    socket.on('gameState', callback);
  },
  onError: (callback) => {
    socket.on('errorMsg', callback);
  },
  createGame: (gameId) => {
    socket.emit('createGame', { gameId });
  },
  joinGame: (gameId) => {
    socket.emit('joinGame', { gameId });
  },
  playCard: (gameId, r, c, card) => {
    socket.emit('playCard', { gameId, r, c, card });
  },
  disconnect: () => {
    socket.off('gameState');
    socket.off('errorMsg');
    socket.off('connect');
  },
  getSocket: () => socket,
};

export default socketService;