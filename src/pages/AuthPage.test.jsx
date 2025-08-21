import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import AuthPage from './AuthPage';
import { GameContext } from '../context/GameContext';

describe('AuthPage', () => {
  it('should display an error message on failed login', async () => {
    // Mock da função de login para simular uma falha
    // Agora ela retorna uma promessa que resolve para 'false'
    const loginMock = vi.fn().mockResolvedValue(false); 
    const registerMock = vi.fn();

    render(
      <GameContext.Provider value={{ login: loginMock, register: registerMock }}>
        <AuthPage />
      </GameContext.Provider>
    );
    
    // Simula o usuário preenchendo o formulário
    fireEvent.change(screen.getByLabelText(/Usuário/i), { target: { value: 'user' } });
    fireEvent.change(screen.getByLabelText(/Senha/i), { target: { value: 'wrong_pass' } });

    // Simula o clique no botão
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    // O teste agora procura por uma mensagem de erro que deve aparecer na tela.
    // Usamos `findByText` para esperar o elemento aparecer.
    const errorMessage = await screen.findByText('Credenciais inválidas.');
    expect(errorMessage).toBeInTheDocument();
  });
});