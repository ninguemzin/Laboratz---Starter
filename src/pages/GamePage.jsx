import React, { useContext } from 'react';
import { DndContext } from '@dnd-kit/core';
import { GameContext } from '../context/GameContext';
import Board from '../components/Board';
import Hand from '../components/Hand';
import GameControls from '../components/GameControls';
import GameOverModal from '../components/GameOverModal';
import Header from '../components/Header';

export default function GamePage() {
  const { socketId, gameId, setGameId, state, previousBoard, create, join, play } = useContext(GameContext);

  function handleDragEnd(event) {
    const { over, active } = event;
    if (over && active) {
      const slotId = over.id;
      const cardId = active.id;
      const myHand = state?.hands?.[socketId] || [];
      const cardToPlay = myHand.find((c) => c.cardId === cardId);
      const [_, r, c] = slotId.split('-');
      if (cardToPlay && r !== undefined && c !== undefined) {
        play(parseInt(r), parseInt(c), cardToPlay);
      }
    }
  }

  const myHand = state?.hands?.[socketId] || [];

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen p-4 bg-gray-100 font-sans">
        <div className="max-w-3xl mx-auto relative">
          <GameOverModal state={state} socketId={socketId} />
          
          <Header />

          <h1 className="text-2xl font-bold mb-4">Laboratz — Prototype</h1>
          
          <GameControls
            gameId={gameId}
            setGameId={setGameId}
            create={create}
            join={join}
          />
          <Hand
            hand={myHand}
            socketId={socketId}
            player1Id={state?.players?.[0]}
          />
          <Board state={state} previousBoard={previousBoard} />
        </div>
      </div>
    </DndContext>
  );
}