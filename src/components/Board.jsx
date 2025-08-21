import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import Card from './Card.jsx';

function DroppableSlot({ r, c }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${r}-${c}`,
  });
  return (
    <div
      ref={setNodeRef}
      className={`h-full w-full rounded-md flex items-center justify-center ${
        isOver ? "bg-green-200 border-green-400" : "bg-white/50"
      }`}
    />
  );
}

export default function Board({ state, previousBoard }) {
  const board = state
    ? state.board
    : Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null));
  const player1_id = state?.players?.[0];

  return (
    <div>
      <div className="text-center text-xl font-bold mb-2">
        {state?.status === "playing" && (
          <>
            <span className="text-blue-600">
              {board.flat().filter((c) => c && c.owner === player1_id).length}
            </span>
            <span> x </span>
            <span className="text-red-600">
              {board.flat().filter((c) => c && c.owner !== player1_id).length}
            </span>
          </>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((row, r) =>
          row.map((cell, c) => {
            let content;
            let isFlipping = false;
            if (previousBoard && cell && previousBoard[r]?.[c]?.owner !== cell.owner) {
              isFlipping = true;
            }
            if (cell) {
              content = (
                <Card
                  card={cell.card}
                  owner={cell.owner}
                  player1Id={player1_id}
                  isFlipping={isFlipping}
                />
              );
            } else {
              content = <DroppableSlot r={r} c={c} />;
            }
            const ownerId = cell ? state.players.indexOf(cell.owner) : -1;
            const borderColor = ownerId === -1 ? "" : ownerId === 0 ? "border-blue-500" : "border-red-500";
            return (
              <div key={`${r}-${c}`} className={`h-36 border-4 rounded-md ${borderColor}`}>
                {content}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}