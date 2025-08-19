import { useDraggable } from "@dnd-kit/core";

export default function Card({
  card,
  isDraggable = false,
  owner = null,
  player1Id = null,
  isFlipping = false,
}) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.cardId,
    disabled: !isDraggable,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100,
      }
    : undefined;

  let cardColorClass = "bg-gray-400"; // Cor padrão/neutra
  if (owner && player1Id) {
    cardColorClass = owner === player1Id ? "bg-green-600" : "bg-pink-600";
  }

  const dragListeners = isDraggable ? listeners : {};
  const dragAttributes = isDraggable ? attributes : {};

  return (
    // O container principal agora tem a ref, os listeners e a perspective
    <div
      ref={setNodeRef}
      style={{ ...style, perspective: "1000px" }}
      {...dragListeners}
      {...dragAttributes}
      className="h-full w-full touch-none select-none"
    >
      {/* O elemento interno é o que vai girar */}
      <div
        className={`relative h-full w-full rounded-md shadow-md text-white font-bold text-lg transition-transform duration-500 ${
          isFlipping ? "animate-flip" : ""
        }`}
        style={{ transformStyle: "preserve-3d" }} // Necessário para a animação 3D
      >
        {/* Este é o conteúdo visível da carta */}
        <div className={`w-full h-full ${cardColorClass} rounded-md`}>
          <div
            style={{
              backgroundImage: `url('${card.imageUrl}')`,
              backgroundSize: "contain",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
              opacity: 0.5,
            }}
            className="absolute inset-0"
          ></div>

          <div className="absolute bottom-1 left-0 right-0 text-center text-xs bg-black bg-opacity-50 px-1 rounded-b-md">
            {card.name}
          </div>

          <div className="absolute top-0 left-1">{card.sides.top}</div>
          <div className="absolute top-1/2 -translate-y-1/2 right-1">
            {card.sides.right}
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
            {card.sides.bottom}
          </div>
          <div className="absolute top-1/2 -translate-y-1/2 left-1">
            {card.sides.left}
          </div>
        </div>
      </div>
    </div>
  );
}
