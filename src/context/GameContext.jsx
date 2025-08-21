import React, { createContext, useState, useEffect, useRef } from 'react';
import socketService from '../services/socketService';
import { playSound, SOUNDS } from '../utils/audio';

export const GameContext = createContext();

export const GameProvider = ({ children }) => {
  const [socketId, setSocketId] = useState(null);
  const [gameId, setGameId] = useState('room1');
  const [state, setState] = useState(null);
  const [previousBoard, setPreviousBoard] = useState(null);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  const prevStateRef = useRef();

  // --- Funções de Ação ---

  function unlockAudio() {
    if (audioUnlocked) return;
    const silentSound = new Audio('data:audio/mpeg;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV');
    silentSound.play().catch(() => {});
    setAudioUnlocked(true);
  }

  const create = () => {
    unlockAudio();
    socketService.createGame(gameId);
  };
  
  const join = () => {
    unlockAudio();
    socketService.joinGame(gameId);
  };

  const play = (r, c, card) => {
    socketService.playCard(gameId, r, c, card);
  };

  // --- Hooks de Efeito (useEffect) ---

  // Hook para conexão e eventos do socket
  useEffect(() => {
    socketService.connect(setSocketId);

    const handleGameState = (g) => {
      setState((prev) => {
        setPreviousBoard(prev?.board);
        return g;
      });
    };
    
    socketService.onGameState(handleGameState);
    socketService.onError((m) => alert(m));

    return () => socketService.disconnect();
  }, []); // Roda apenas uma vez

  // CORREÇÃO: Hook completo e funcional para efeitos sonoros
  useEffect(() => {
    if (!state) return;

    const prevState = prevStateRef.current;

    // 1. Som de Fim de Jogo
    if (state.status === 'finished' && prevState?.status !== 'finished') {
      if (state.winner === socketId) {
        playSound(SOUNDS.win);
      } else {
        playSound(SOUNDS.lose);
      }
    }

    // 2. Som de Jogar ou Virar Carta
    if (state.status === 'playing' && prevState?.board) {
      const prevCardCount = prevState.board.flat().filter(Boolean).length;
      const currentCardCount = state.board.flat().filter(Boolean).length;

      if (currentCardCount > prevCardCount) {
        playSound(SOUNDS.place);
      } else if (currentCardCount === prevCardCount) {
        const myPrevScore = prevState.board.flat().filter(c => c && c.owner === socketId).length;
        const myCurrentScore = state.board.flat().filter(c => c && c.owner === socketId).length;
        if (myCurrentScore > myPrevScore) {
          playSound(SOUNDS.flip);
        }
      }
    }

    // Guarda o estado atual para a próxima comparação
    prevStateRef.current = state;
  }, [state, socketId]); // Roda sempre que o estado do jogo ou o socketId mudar

  // --- Valor fornecido pelo Contexto ---

  const value = {
    socketId,
    gameId,
    setGameId,
    state,
    previousBoard,
    create,
    join,
    play,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};