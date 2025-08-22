import React, { useState, useEffect, useContext } from 'react';
import { GameContext } from '../context/GameContext';
import Card from '../components/Card';

export default function CollectionPage() {
  const [collection, setCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const { setView, token } = useContext(GameContext); // Usaremos setView para voltar

  useEffect(() => {
    // Função para buscar a coleção de cartas na API
    async function fetchCollection() {
      try {
        const res = await fetch('http://localhost:4000/api/users/collection', {
          headers: {
            'x-auth-token': token,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setCollection(data);
        } else {
          console.error('Falha ao buscar a coleção.');
        }
      } catch (error) {
        console.error('Erro de conexão:', error);
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      fetchCollection();
    }
  }, [token]);

  if (loading) {
    return <div className="text-center p-10">Carregando sua coleção...</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-3xl font-bold">Sua Coleção de Cartas</h1>
        <button
          onClick={() => setView('game')} // Botão para voltar à tela do jogo
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Voltar ao Jogo
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {collection.map((card) => (
          <div key={card.cardId} className="h-48">
            <Card card={card} isDraggable={false} />
          </div>
        ))}
      </div>
    </div>
  );
}