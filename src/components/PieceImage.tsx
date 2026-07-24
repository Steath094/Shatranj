import type { Piece } from "../types/chess";

type PieceImageProps = {
  piece: Piece;
  isFlipped: boolean;
};

const pieceImages: Record<Exclude<Piece, "">, string> = {
  r: "/rook-b.svg",
  n: "/knight-b.svg",
  b: "/bishop-b.svg",
  q: "/queen-b.svg",
  k: "/king-b.svg",
  p: "/pawn-b.svg",
  R: "/rook-w.svg",
  N: "/knight-w.svg",
  B: "/bishop-w.svg",
  Q: "/queen-w.svg",
  K: "/king-w.svg",
  P: "/pawn-w.svg",
};

export function PieceImage({ piece, isFlipped }: PieceImageProps) {
  if (piece === "") return null;

  return (
    <img
      src={pieceImages[piece]}
      alt={piece}
      draggable={false}
      className={`relative z-10 h-[78%] w-[78%] select-none object-contain drop-shadow-md ${isFlipped ? "rotate-180" : ""}`}
    />
  );
}
