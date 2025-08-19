import React, { useEffect, useState, useMemo, useRef } from "react";
import io from "socket.io-client";
import { DndContext } from "@dnd-kit/core";
import { useDroppable } from "@dnd-kit/core";
import Card from "./components/Card.jsx";
// CORREÇÃO: A inicialização do socket pode ficar aqui fora ou ser movida para dentro do componente com useMemo para melhor prática. Vamos mantê-la simples por enquanto.
const socket = io("http://localhost:4000");

// CORREÇÃO: O hook useState foi removido do topo do arquivo.

const SOUNDS = {
  place: "https://cdn.pixabay.com/audio/2022/03/15/audio_51b70c3f5d.mp3",
  flip: "https://cdn.pixabay.com/audio/2021/08/04/audio_12b0c342f5.mp3",
  win: "https://cdn.pixabay.com/audio/2022/11/17/audio_88f2f37b3f.mp3",
  lose: "https://cdn.pixabay.com/audio/2022/02/21/audio_03a11d8c11.mp3",
};

function playSound(soundUrl) {
  const audio = new Audio(soundUrl);
  audio.play();
}

// src/App.jsx

export default function App() {
  const [gameId, setGameId] = useState("room1");
  const [state, setState] = useState(null);
  const [previousBoard, setPreviousBoard] = useState(null);
  const prevStateRef = useRef();

  // --- HOOK PARA EFEITOS SONOROS ---
  // Este hook depende do 'state' e roda a cada mudança para verificar se um som deve ser tocado.
  useEffect(() => {
    if (!state) return;

    const prevState = prevStateRef.current;

    // 1. Som de Fim de Jogo
    if (state.status === "finished" && prevState?.status !== "finished") {
      if (state.winner === socket.id) {
        playSound(SOUNDS.win);
      } else {
        playSound(SOUNDS.lose);
      }
    }

    // 2. Som de Jogar ou Virar Carta
    if (state.status === "playing" && prevState?.board) {
      const prevCardCount = prevState.board.flat().filter(Boolean).length;
      const currentCardCount = state.board.flat().filter(Boolean).length;

      if (currentCardCount > prevCardCount) {
        playSound(SOUNDS.place);
      } else if (currentCardCount === prevCardCount) {
        const myPrevScore = prevState.board
          .flat()
          .filter((c) => c && c.owner === socket.id).length;
        const myCurrentScore = state.board
          .flat()
          .filter((c) => c && c.owner === socket.id).length;
        if (myCurrentScore > myPrevScore) {
          playSound(SOUNDS.flip);
        }
      }
    }

    // Guarda o estado atual para a próxima comparação
    prevStateRef.current = state;
  }, [state]);

  // --- HOOK PARA CONEXÃO E EVENTOS DO SOCKET ---
  // Este hook tem um array de dependências vazio [] e roda apenas uma vez.
  useEffect(() => {
    const handleGameState = (g) => {
      setState((prev) => {
        setPreviousBoard(prev?.board);
        return g;
      });
    };

    socket.on("connect", () => console.log("connected", socket.id));
    socket.on("gameState", handleGameState);
    socket.on("errorMsg", (m) => alert(m));

    return () => {
      socket.off("gameState", handleGameState);
      socket.off("errorMsg");
    };
  }, []);

  // --- FUNÇÕES DE LÓGICA DO JOGO ---
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
    if (state.winner === null) {
      gameOverMessage = "Empate!";
    } else if (state.winner === socket.id) {
      gameOverMessage = "Você Venceu!";
    } else {
      gameOverMessage = "Você Perdeu!";
    }
  }

  // --- RENDERIZAÇÃO DO COMPONENTE (JSX) ---
  return (
    <DndContext onDragEnd={handleDragEnd}>
      {/* ... todo o seu JSX continua aqui, ele já estava correto ... */}
      <div className="min-h-screen p-4 bg-gray-100 font-sans">
        <div className="max-w-3xl mx-auto relative">
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
            if (
              previousBoard &&
              cell &&
              previousBoard[r]?.[c]?.owner !== cell.owner
            ) {
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
              // Assumindo que DroppableSlot está em um arquivo separado
              // Se não, você precisa do código dele aqui.
              // Por agora, vamos recriá-lo para garantir que funcione.
              content = <LocalDroppableSlot r={r} c={c} />;
            }
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
