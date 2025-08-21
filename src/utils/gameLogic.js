export function elementAdvantage(e1, e2) {
  if (e1 === e2) return 0;
  if (e1 === "mecanico" && e2 === "mutante") return 1;
  if (e1 === "mutante" && e2 === "radioativo") return 1;
  if (e1 === "radioativo" && e2 === "mecanico") return 1;
  // Adicionando as lógicas de desvantagem explicitamente
  if (e2 === "mecanico" && e1 === "mutante") return -1;
  if (e2 === "mutante" && e1 === "radioativo") return -1;
  if (e2 === "radioativo" && e1 === "mecanico") return -1;
  return 0;
}