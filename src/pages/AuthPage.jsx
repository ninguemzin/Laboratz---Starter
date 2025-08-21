import React, { useState, useContext } from 'react';
import { GameContext } from '../context/GameContext'; // Importaremos o contexto para usar as funções de login

export default function AuthPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  // Futuramente, pegaremos as funções de login/registro do contexto aqui
  const { login, register } = useContext(GameContext);

  const handleRegister = (e) => {
    e.preventDefault();
    if (username && password) {
      register(username, password); 
    }};
  
  const handleLogin = async (e) => {
    e.preventDefault();
     setError('');
     if (username && password) {
      const success = await login(username, password); 
      if (!success) {
        setError('Credenciais inválidas.'); // <-- Define a mensagem de erro
      }
    }};

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Laboratz</h1>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="username">
              Usuário
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="Nome de usuário"
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Senha
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="******************"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              onClick={handleLogin}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Login
            </button>
            <button
              onClick={handleRegister}
              className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
            >
              Registrar
            </button>
          </div>
      {error && <p className="text-red-500 text-xs italic">{error}</p>} {/* <-- Exibe o erro */}
      <div className="flex items-center justify-between">
        {/* ... botões ... */}
      </div>
        </form>
      </div>
    </div>
  );
}