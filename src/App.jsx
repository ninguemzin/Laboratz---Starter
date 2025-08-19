import React, { useEffect, useState } from "react";
import io from "socket.io-client";
import { DndContext } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import Card from "./components/Card.jsx";

const socket = io("http://localhost:4000");

export default function App() {
  const [gameId, setGameId] = useState("room1");
  const [state, setState] = useState(null);

  useEffect(() => {
    socket.on("connect", () => console.log("connected", socket.id));
    socket.on("gameState", (g) => setState(g));
    socket.on("errorMsg", (m) => alert(m));

    return () => {
      socket.off("gameState");
      socket.off("errorMsg");
    };
  }, []);

  function create() {
    socket.emit("createGame", { gameId });
  }
  function join() {
    socket.emit("joinGame", { gameId });
  }

  function play(r, c, card) {
    socket.emit("playCard", { gameId, r, c, card });
  }

  function handleDragEnd(event) {
    const { over, active } = event;

    // Se soltou em uma área válida (um slot do tabuleiro)
    if (over && active) {
      const slotId = over.id; // Ex: "slot-0-1"
      const cardId = active.id; // Ex: "rat_001"

      // Encontrar a carta inteira a partir do ID
      const cardToPlay = myHand.find((c) => c.cardId === cardId);

      // Extrair a linha e coluna do ID do slot
      const [_, r, c] = slotId.split("-"); // ["slot", "0", "1"]

      if (cardToPlay && r !== undefined && c !== undefined) {
        play(parseInt(r), parseInt(c), cardToPlay);
      }
    }
  }

  const myHand = state && state.hands ? state.hands[socket.id] : [];

  // Lógica da mensagem de fim de jogo
  let gameOverMessage = "";
  if (state?.status === "finished") {
    if (state.winner === null) {
      gameOverMessage = "Empate!";
    } else if (state.winner === socket.id) {
      gameOverMessage = "Você Venceu!";
    } else {
      gameOverMessage = "Você Perdeu!";
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen p-4 bg-gray-100 font-sans">
        <div className="max-w-3xl mx-auto relative">
          {/* MODAL DE FIM DE JOGO */}
          {state?.status === "finished" && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-20">
              <div className="bg-white p-8 rounded-lg text-center">
                <h2 className="text-4xl font-bold mb-4">{gameOverMessage}</h2>
                <p className="text-lg">
                  Placar Final: {state.score[state.players[0]]} a{" "}
                  {state.score[state.players[1]]}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="mt-6 px-4 py-2 rounded bg-blue-500 text-white"
                >
                  Jogar Novamente
                </button>
              </div>
            </div>
          )}
          <h1 className="text-2xl font-bold mb-4">Laboratz — Prototype</h1>
          <div className="flex gap-2 mb-4">
            <input
              value={gameId}
              onChange={(e) => setGameId(e.target.value)}
              className="border p-2"
            />
            <button
              onClick={create}
              className="px-3 py-2 rounded bg-blue-500 text-white"
            >
              Criar
            </button>
            <button
              onClick={join}
              className="px-3 py-2 rounded bg-green-500 text-white"
            >
              Entrar
            </button>
          </div>

          <div className="grid grid-cols-5 gap-2 mb-4 h-32 items-center">
            {myHand.map((card) => (
              <Card key={card.cardId} card={card} isDraggable={true} />
            ))}
          </div>

          <Board state={state} />
        </div>
      </div>
    </DndContext>
  );
}

function DroppableSlot({ r, c }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `slot-${r}-${c}`, // ID único para a área "soltável"
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-28 border-4 rounded-md flex items-center justify-center ${
        isOver ? "bg-green-200 border-green-400" : "bg-white border-gray-300"
      }`}
    >
      {/* Opcional: mostrar um ícone ou texto */}
    </div>
  );
}

// src/App.jsx

function Board({ state }) {
  const board = state
    ? state.board
    : Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null));
  const player1_id = state?.players[0];

  return (
    <div>
      {state?.status === "playing" && (
        <div className="text-center text-xl font-bold mb-2">
          {/* ... (código do placar continua igual) ... */}
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {board.map((row, r) =>
          row.map((cell, c) => {
            let content;
            if (cell) {
              // CÉLULA OCUPADA: Renderiza o componente Card completo
              content = <Card card={cell.card} isDraggable={false} />;
            } else {
              // CÉLULA VAZIA: Renderiza a área para soltar
              content = <DroppableSlot r={r} c={c} />;
            }

            // Lógica da borda
            const ownerId = cell ? state.players.indexOf(cell.owner) : -1;
            const borderColor =
              ownerId === -1
                ? ""
                : ownerId === 0
                ? "border-blue-500"
                : "border-red-500";

            return (
              <div
                key={`${r}-${c}`}
                className={`h-36 border-4 rounded-md ${borderColor}`}
              >
                {content}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
