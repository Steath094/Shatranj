import type { Piece } from "../types/chess";
import { PieceImage } from "./PieceImage";

type ChessSquareProps = {
  position: number;
  displayIndex: number;
  piece: Piece;
  isSelected: boolean;
  isLegalMove: boolean;
  isLastMove: boolean;
  isCheck: boolean;
  isFlipped: boolean;
  onClick: () => void;
};

const getFile = (position: number): string => String.fromCharCode(97 + (position % 8));

const getRank = (position: number): string => (8 - Math.floor(position / 8)).toString();

export function ChessSquare({
  position,
  displayIndex,
  piece,
  isSelected,
  isLegalMove,
  isLastMove,
  isCheck,
  isFlipped,
  onClick,
}: ChessSquareProps) {
  const row = Math.floor(position / 8);
  const col = position % 8;
  const displayRow = Math.floor(displayIndex / 8);
  const displayCol = displayIndex % 8;
  const isLight = (row + col) % 2 === 0;
  const showRank = displayCol === 0;
  const showFile = displayRow === 7;
  const coordinateColor = isLight ? "text-stone-600" : "text-stone-200";
  const baseColor = isLight ? "bg-[#eee6d1]" : "bg-[#71945d]";
  const cursor = piece || isLegalMove ? "cursor-pointer" : "cursor-default";

  return (
    <button
      type="button"
      className={`relative flex h-full w-full items-center justify-center ${baseColor} ${cursor} outline-none transition-colors hover:brightness-105 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-amber-300`}
      onClick={onClick}
      aria-label={`${getFile(position)}${getRank(position)}`}
    >
      {isLastMove && <span className="absolute inset-0 bg-amber-300/35" />}
      {isSelected && <span className="absolute inset-0 ring-4 ring-inset ring-sky-400" />}
      {isCheck && <span className="absolute inset-0 bg-red-500/55" />}

      {showRank && (
        <span className={`pointer-events-none absolute left-1 top-0.5 text-[10px] font-bold sm:left-1.5 sm:top-1 sm:text-xs ${coordinateColor}`}>
          {getRank(position)}
        </span>
      )}

      {showFile && (
        <span className={`pointer-events-none absolute bottom-0.5 right-1 text-[10px] font-bold sm:bottom-1 sm:right-1.5 sm:text-xs ${coordinateColor}`}>
          {getFile(position)}
        </span>
      )}

      {piece && (
        <PieceImage
          piece={piece}
          isFlipped={isFlipped}
        />
      )}

      {isLegalMove && !piece && <span className="absolute h-[24%] w-[24%] rounded-full bg-stone-900/35" />}
      {isLegalMove && piece && <span className="absolute inset-[10%] rounded-full border-4 border-stone-900/30" />}
    </button>
  );
}
