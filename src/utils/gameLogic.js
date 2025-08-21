// src/utils/gameLogic.js

// 1. Definimos as regras de vantagem em um objeto.
// A chave é o elemento, e o valor é o elemento que ele vence.
const advantages = {
  mecanico: 'mutante',
  mutante: 'radioativo',
  radioativo: 'mecanico',
};

// 2. A função agora usa este objeto para a lógica, ficando muito mais limpa.
export function elementAdvantage(e1, e2) {
  // Caso 1: Empate
  if (e1 === e2) {
    return 0;
  }
  
  // Caso 2: Vantagem (e1 vence e2)
  // A lógica lê-se como: "O elemento que 'mecanico' vence é 'mutante'?"
  if (advantages[e1] === e2) {
    return 1;
  }
  
  // Caso 3: Desvantagem (e2 vence e1)
  // A lógica lê-se como: "O elemento que 'mutante' vence é 'mecanico'?"
  if (advantages[e2] === e1) {
    return -1;
  }

  // Caso 4: Sem relação de vantagem (se houver elementos neutros no futuro)
  return 0;
}