import { useDraggable } from "@dnd-kit/core";

export default function Card({ card, isDraggable = false }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.cardId,
    disabled: !isDraggable, // Desabilita o hook se não for arrastável
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: 100, // Garante que a carta arrastada fique por cima
      }
    : undefined;

  // Estilo para a imagem de fundo
  const cardBgStyle = {
    backgroundImage: `url('${card.imageUrl}')`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  };

  // Condicional para aplicar listeners de drag and drop
  const dragListeners = isDraggable ? listeners : {};
  const dragAttributes = isDraggable ? attributes : {};

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...dragListeners}
      {...dragAttributes}
      className="h-full w-full touch-none select-none" // A altura será definida pelo container pai
    >
      <div
        style={cardBgStyle}
        className="relative h-full w-full rounded-md shadow-md text-white font-bold text-lg p-1"
      >
        {/* Nome do Card */}
        <div className="absolute bottom-1 left-0 right-0 text-center text-xs bg-black bg-opacity-50 px-1 rounded-b-md">
          {card.name}
        </div>

        {/* Números */}
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
  );
}
