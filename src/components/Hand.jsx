import React from 'react';
import Card from './Card.jsx';

export default function Hand({ hand, socketId, player1Id }) {
  return (
    <div className="grid grid-cols-5 gap-2 mb-4 h-36 items-center">
      {hand.map((card) => (
        <Card
          key={card.cardId}
          card={card}
          isDraggable={true}
          owner={socketId}
          player1Id={player1Id}
        />
      ))}
    </div>
  );
}