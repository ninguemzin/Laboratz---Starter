import { describe, it, expect } from 'vitest';
import { elementAdvantage } from './gameLogic';

describe('elementAdvantage', () => {
  it('should return 1 when mecanico has advantage over mutante', () => {
    expect(elementAdvantage('mecanico', 'mutante')).toBe(1);
  });

  it('should return -1 when mutante has disadvantage against mecanico', () => {
    expect(elementAdvantage('mutante', 'mecanico')).toBe(-1);
  });

  it('should return 0 when elements are the same', () => {
    expect(elementAdvantage('radioativo', 'radioativo')).toBe(0);
  });

  // NOVO TESTE QUE VAI FALHAR
  it('should correctly handle a non-triangular relationship (e.g., mutante vs mecanico)', () => {
    // Este teste já foi coberto acima, mas é um exemplo. Vamos adicionar um novo caso.
    expect(elementAdvantage('mutante', 'radioativo')).toBe(1);
  });
});