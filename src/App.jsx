// src/App.jsx
import React, { useContext } from 'react'; // Adicione useContext
import { GameProvider, GameContext } from './context/GameContext';
import GamePage from './pages/GamePage';
import AuthPage from './pages/AuthPage'; // <-- NOVO: Importe a AuthPage

function AppContent() {
  const { token } = useContext(GameContext); // Pega o token do contexto

  // Se houver um token, mostre a página do jogo. Senão, mostre a de autenticação.
  return token ? <GamePage /> : <AuthPage />;
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;