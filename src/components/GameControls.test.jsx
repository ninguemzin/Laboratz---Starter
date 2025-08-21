import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GameControls from './GameControls';

describe('GameControls', () => {
  it('should render an input and two buttons', () => {
    // Renderiza o componente no ambiente de teste
    render(
      <GameControls
        gameId="test-room"
        setGameId={() => {}}
        create={() => {}}
        join={() => {}}
      />
    );

    // Procura pelos elementos na tela virtual
    const input = screen.getByDisplayValue('test-room');
    const createButton = screen.getByText('Criar');
    const joinButton = screen.getByText('Entrar');

    // Afirma que os elementos existem
    expect(input).toBeInTheDocument();
    expect(createButton).toBeInTheDocument();
    expect(joinButton).toBeInTheDocument();
  });

  it('should call the create function when the "Criar" button is clicked', () => {
    // `vi.fn()` cria uma função "espiã" que podemos observar
    const createFn = vi.fn();

    render(
      <GameControls
        gameId="test-room"
        setGameId={() => {}}
        create={createFn}
        join={() => {}}
      />
    );

    const createButton = screen.getByText('Criar');
    // Simula um clique do usuário no botão
    fireEvent.click(createButton);

    // Afirma que nossa função espiã foi chamada
    expect(createFn).toHaveBeenCalled();
  });
});