// src/pages/DeckBuilderPage.jsx

import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';

export default function DeckBuilderPage() {
  const { setView } = useContext(GameContext);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Construtor de Decks</h1>
        <button
          onClick={() => setView('game')} // Botão para voltar
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Voltar ao Jogo
        </button>
      </div>
      <p>Aqui você poderá montar seus decks!</p>
    </div>
  );
}