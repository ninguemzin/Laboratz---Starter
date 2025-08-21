import React from 'react';

export default function GameOverModal({ state, socketId }) {
  if (state?.status !== 'finished') {
    return null; // Não renderiza nada se o jogo não acabou
  }

  let gameOverMessage = '';
  if (state.winner === null) {
    gameOverMessage = 'Empate!';
  } else if (state.winner === socketId) {
    gameOverMessage = 'Você Venceu!';
  } else {
    gameOverMessage = 'Você Perdeu!';
  }

  return (
    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
      <div className="bg-white p-8 rounded-lg text-center">
        <h2 className="text-4xl font-bold mb-4">{gameOverMessage}</h2>
        <p className="text-lg">
          Placar Final: {state.score[state.players[0]]} a {state.score[state.players[1]]}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-6 px-4 py-2 rounded bg-blue-500 text-white"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );
}