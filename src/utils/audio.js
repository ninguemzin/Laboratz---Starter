export const SOUNDS = {
  place: '/sounds/place.mp3',
  flip:  '/sounds/flip.mp3',
  win:   '/sounds/win.mp3',
  lose:  '/sounds/lose.mp3'
};

export function playSound(soundUrl) {
  const audio = new Audio(soundUrl);
  audio.play().catch(error => console.error("Erro ao tocar áudio:", error));
}