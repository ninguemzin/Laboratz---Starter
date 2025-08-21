import React from 'react';

export default function GameControls({ gameId, setGameId, create, join }) {
  return (
    <div className="flex gap-2 mb-4">
      <input
        value={gameId}
        onChange={(e) => setGameId(e.target.value)}
        className="border p-2"
      />
      <button onClick={create} className="px-3 py-2 rounded bg-blue-500 text-white">
        Criar
      </button>
      <button onClick={join} className="px-3 py-2 rounded bg-green-500 text-white">
        Entrar
      </button>
    </div>
  );
}