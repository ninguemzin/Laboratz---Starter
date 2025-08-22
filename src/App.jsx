// src/App.jsx
import React, { useContext } from 'react'; // Adicione useContext
import { GameProvider, GameContext } from './context/GameContext';
import GamePage from './pages/GamePage';
import AuthPage from './pages/AuthPage'; // <-- NOVO: Importe a AuthPage
import CollectionPage from './pages/CollectionPage';
import DeckBuilderPage from './pages/DeckBuilderPage';

function AppContent() {
  const { token, view } = useContext(GameContext); // Pega o token do contexto

  if (!token) {
    return <AuthPage />;
  }
   if (view === 'collection') {
    return <CollectionPage />;
  }
if (view === 'deckBuilder') {
    return <DeckBuilderPage />;
  }
  // Por padrão, mostra a página do jogo
  return <GamePage />;
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;