import { useDraggable } from "@dnd-kit/core";

function Card({ card }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: card.cardId, // ID único para o item arrastável
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="border p-2 bg-white rounded shadow-md touch-none"
    >
      <div className="text-sm font-semibold">{card.name}</div>
      <div className="text-xs">
        {card.element} • {card.rarity}
      </div>
      <div className="mt-2 grid grid-cols-3 text-center text-xs">
        <div></div>
        <div>{card.sides.top}</div>
        <div></div>
        <div>{card.sides.left}</div>
        <div className="font-bold">⚪</div>
        <div>{card.sides.right}</div>
        <div></div>
        <div>{card.sides.bottom}</div>
        <div></div>
      </div>
    </div>
  );
}

export default Card;
