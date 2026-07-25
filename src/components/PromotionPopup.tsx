import type { PromotionPiece, turn } from "../types/chess";
import { PieceImage } from "./PieceImage";

type PromotionPopupProps = {
  color: turn;
  square: number;
  choices: PromotionPiece[];
  onPromote: (piece: PromotionPiece) => void;
  onCancel: () => void;
};

const pieceNames: Record<PromotionPiece, string> = {
  Q: "Queen",
  R: "Rook",
  B: "Bishop",
  N: "Knight",
  q: "Queen",
  r: "Rook",
  b: "Bishop",
  n: "Knight",
};

const formatSquare = (position: number): string => {
  const file = String.fromCharCode(97 + (position % 8));
  const rank = 8 - Math.floor(position / 8);

  return `${file}${rank}`;
};

export function PromotionPopup({ color, square, choices, onPromote, onCancel }: PromotionPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-sm rounded border border-amber-300/50 bg-[#302e2b] p-5 text-stone-100 shadow-2xl shadow-black/50">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Promotion</p>
        <h2 className="mt-2 text-2xl font-semibold">Choose a piece</h2>
        <p className="mt-1 text-sm text-stone-300">
          {color === "white" ? "White" : "Black"} pawn on {formatSquare(square)}
        </p>

        <div className="mt-5 grid grid-cols-4 gap-2">
          {choices.map((piece) => (
            <button
              key={piece}
              type="button"
              className="flex aspect-square flex-col items-center justify-center gap-1 rounded border border-stone-600 bg-stone-900/40 p-2 text-xs font-semibold text-stone-100 transition hover:border-amber-300 hover:bg-stone-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
              onClick={() => onPromote(piece)}
            >
              <span className="flex h-10 w-10 items-center justify-center">
                <PieceImage
                  piece={piece}
                  isFlipped={false}
                />
              </span>
              <span>{pieceNames[piece]}</span>
            </button>
          ))}
        </div>

        <button
          type="button"
          className="mt-4 w-full rounded border border-stone-600 px-3 py-2 text-sm font-semibold text-stone-100 transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
          onClick={onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
