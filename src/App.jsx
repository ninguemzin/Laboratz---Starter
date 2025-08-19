import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function App() {
  const [gameId, setGameId] = useState("room1");
  const [state, setState] = useState(null);

  useEffect(() => {
    socket.on("connect", () => console.log("connected", socket.id));
    socket.on("gameState", (g) => setState(g));
    socket.on("errorMsg", (m) => alert(m));

    // seed mão local (exemplo)
    fetch("/cards_seed.json")
      .then((r) => r.json())
      .then((j) => setHand(j.slice(0, 5)));

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
    <div className="min-h-screen p-4 bg-gray-100 font-sans">
      <div className="max-w-3xl mx-auto">
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

        <div className="grid grid-cols-3 gap-2 mb-4">
          {myHand.map((card) => (
            <div key={card.cardId} className="border p-2 bg-white rounded">
              <div className="text-sm font-semibold">{card.name}</div>
              <div className="text-xs">
                {card.element} • {card.rarity}
              </div>
              <div className="mt-2 grid grid-cols-3 text-center text-xs">
                <div></div>
                <div>{card.sides.top}</div>
                <div></div>
                <div>{card.sides.left}</div>
                <div className="font-bold">⚪</div>
                <div>{card.sides.right}</div>
                <div></div>
                <div>{card.sides.bottom}</div>
                <div></div>
              </div>
            </div>
          ))}
        </div>

        <Board state={state} onPlay={play} hand={myHand} />
      </div>
    </div>
  );
}

function Board({ state, onPlay, hand }) {
  const board = state
    ? state.board
    : Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null));
  const player1_id = state?.players[0];
  const player2_id = state?.players[1];
  return (
    <div>
      {/* EXIBIR PONTUAÇÃO */}
      {state?.status === "playing" && (
        <div className="text-center text-xl font-bold mb-2">
          <span className="text-blue-600">
            {
              state.board.flat().filter((c) => c && c.owner === player1_id)
                .length
            }
          </span>
          <span> x </span>
          <span className="text-red-600">
            {
              state.board.flat().filter((c) => c && c.owner === player2_id)
                .length
            }
          </span>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {board.map((row, r) =>
          row.map((cell, c) => {
            // Lógica de cores da borda
            let borderColor = "border-gray-300";
            if (cell) {
              if (cell.owner === player1_id) borderColor = "border-blue-500";
              if (cell.owner === player2_id) borderColor = "border-red-500";
            }
            return (
              <div
                key={`${r}-${c}`}
                className="h-28 border bg-white flex items-center justify-center relative"
              >
                {cell ? (
                  <div className="text-sm text-center">
                    <div>{cell.card.name}</div>
                    <div className="text-xs">{cell.card.element}</div>
                  </div>
                ) : (
                  <DropSlot r={r} c={c} onPlay={onPlay} hand={hand} />
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function DropSlot({ r, c, onPlay, hand }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="w-full h-full flex items-center justify-center">
      <button
        onClick={() => setOpen((o) => !o)}
        className="px-2 py-1 border rounded"
      >
        Jogar
      </button>
      {open && (
        <div className="absolute top-full mt-2 p-2 bg-white border rounded z-10">
          {hand.map((card) => (
            <div key={card.cardId} className="flex items-center gap-2 mb-1">
              <div className="text-xs">{card.name}</div>
              <button
                onClick={() => {
                  onPlay(r, c, card);
                  setOpen(false);
                }}
                className="text-xs px-2 py-1 border rounded"
              >
                OK
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
