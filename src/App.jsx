import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

export default function App() {
  const [gameId, setGameId] = useState("room1");
  const [state, setState] = useState(null);
  const [hand, setHand] = useState([]);

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
    // remover da mão local para UX (servidor valida de verdade)
    setHand((prev) => prev.filter((p) => p.cardId !== card.cardId));
  }

  return (
    <div className="min-h-screen p-4 bg-gray-100 font-sans">
      <div className="max-w-3xl mx-auto">
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
          {hand.map((card) => (
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

        <Board state={state} onPlay={play} hand={hand} />
      </div>
    </div>
  );
}

function Board({ state, onPlay, hand }) {
  const board = state
    ? state.board
    : Array.from({ length: 3 }, () => Array.from({ length: 3 }, () => null));
  return (
    <div>
      <div className="grid grid-cols-3 gap-2">
        {board.map((row, r) =>
          row.map((cell, c) => (
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
          ))
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
