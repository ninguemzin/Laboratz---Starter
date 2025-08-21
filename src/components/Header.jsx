// src/components/Header.jsx

import React, { useContext } from 'react';
import { GameContext } from '../context/GameContext';

export default function Header() {
  const { user, logout } = useContext(GameContext);

  if (!user) return null; // Don't render if there's no user

  return (
    <div className="bg-white p-2 mb-4 rounded-md shadow-sm flex justify-between items-center">
      <span className="font-bold text-gray-700">Bem-vindo, {user.username}!</span>
      <button 
        onClick={logout}
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-3 rounded text-sm"
      >
        Logout
      </button>
    </div>
  );
}