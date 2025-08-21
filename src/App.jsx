import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import { DndContext } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import Card from "./components/Card.jsx";

const socket = io("http://localhost:4000");

// CORREÇÃO: Links diretos para os arquivos .mp3
const SOUNDS = {
  place: '/sounds/place.mp3',
  flip:  '/sounds/flip.mp3',
  win:   '/sounds/win.mp3',
  lose:  '/sounds/lose.mp3'
};

function playSound(soundUrl) {
  const audio = new Audio(soundUrl);
  audio.play()
}

export default function App() {
  // CORREÇÃO: Todas as declarações de estado agrupadas no topo
  const [gameId, setGameId] = useState("room1");
  const [state, setState] = useState(null);
  const [previousBoard, setPreviousBoard] = useState(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const prevStateRef = useRef();

  // Função para destravar o áudio
  function unlockAudio() {
    if (audioUnlocked) return;
    const silentSound = new Audio('data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
    silentSound.play().catch(() => {});
    setAudioUnlocked(true);
  }
  
  // Hook para efeitos sonoros
  useEffect(() => {
    if (!state) return;
    const prevState = prevStateRef.current;
    
    if (state.status === "finished" && prevState?.status !== "finished") {
      if (state.winner === socket.id) playSound(SOUNDS.win);
      else playSound(SOUNDS.lose);
    }

    if (state.status === "playing" && prevState?.board) {
      const prevCardCount = prevState.board.flat().filter(Boolean).length;
      const currentCardCount = state.board.flat().filter(Boolean).length;
      if (currentCardCount > prevCardCount) {
        playSound(SOUNDS.place);
      } else if (currentCardCount === prevCardCount) {
        const myPrevScore = prevState.board.flat().filter(c => c && c.owner === socket.id).length;
        const myCurrentScore = state.board.flat().filter(c => c && c.owner === socket.id).length;
        if (myCurrentScore > myPrevScore) playSound(SOUNDS.flip);
      }
    }
    prevStateRef.current = state;
  }, [state]);

  // Hook para conexão e eventos do socket
  useEffect(() => {
    const handleGameState = (g) => {
      setState((prev) => {
        setPreviousBoard(prev?.board);
        return g;
      });
    };
    socket.on("gameState", handleGameState);
    socket.on("errorMsg", (m) => alert(m));
    return () => {
      socket.off("gameState", handleGameState);
      socket.off("errorMsg");
    };
  }, []);

  // Funções de lógica do jogo
  function create() {
    unlockAudio();
    socket.emit("createGame", { gameId });
  }

  function join() {
    unlockAudio();
    socket.emit("joinGame", { gameId });
  }

  function play(r, c, card) {
    socket.emit("playCard", { gameId, r, c, card });
  }

  function handleDragEnd(event) {
    const { over, active } = event;
    if (over && active) {
      const slotId = over.id;
      const cardId = active.id;
      const myHand = state?.hands?.[socket.id] || [];
      const cardToPlay = myHand.find((c) => c.cardId === cardId);
      const [_, r, c] = slotId.split("-");
      if (cardToPlay && r !== undefined && c !== undefined) {
        play(parseInt(r), parseInt(c), cardToPlay);
      }
    }
  }

  const myHand = state?.hands?.[socket.id] || [];
  let gameOverMessage = "";
  if (state?.status === "finished") {
    if (state.winner === null) gameOverMessage = "Empate!";
    else if (state.winner === socket.id) gameOverMessage = "Você Venceu!";
    else gameOverMessage = "Você Perdeu!";
  }

  // Renderização do componente (JSX)
  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen p-4 bg-gray-100 font-sans">
        <div className="max-w-3xl mx-auto relative">
          {/* CORREÇÃO: Modal de fim de jogo aparece apenas uma vez */}
          {state?.status === "finished" && (
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
          )}
          <h1 className="text-2xl font-bold mb-4">Laboratz — Prototype</h1>
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
          <div className="grid grid-cols-5 gap-2 mb-4 h-36 items-center">
            {myHand.map((card) => (
              <Card
                key={card.cardId}
                card={card}
                isDraggable={true}
                owner={socket.id}
                player1Id={state?.players?.[0]}
              />
            ))}
          </div>
          <Board state={state} previousBoard={previousBoard} />
        </div>
      </div>
    </DndContext>
  );
}

function Board({ state, previousBoard }) {
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
              content = <LocalDroppableSlot r={r} c={c} />;
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

function LocalDroppableSlot({ r, c }) {
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