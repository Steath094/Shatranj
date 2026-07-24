import type { Move, Piece } from "../types/chess";
import { ChessSquare } from "./ChessSquare";

type ChessBoardProps = {
  board: Piece[];
  selectedSquare: number | null;
  legalMoves: number[];
  lastMove: Move | null;
  checkedKingSquare: number | null;
  isFlipped: boolean;
  onSquareClick: (position: number) => void;
};

const getDisplaySquares = (isFlipped: boolean): number[] => {
  const squares = Array.from({ length: 64 }, (_, index) => index);

  return isFlipped ? squares.reverse() : squares;
};

export function ChessBoard({
  board,
  selectedSquare,
  legalMoves,
  lastMove,
  checkedKingSquare,
  isFlipped,
  onSquareClick,
}: ChessBoardProps) {
  const displaySquares = getDisplaySquares(isFlipped);

  return (
    <div className="aspect-square w-full max-w-[min(92vw,76vh,720px)] overflow-hidden rounded border border-stone-700 shadow-2xl shadow-black/30">
      <div className="grid h-full w-full grid-cols-8 grid-rows-8">
        {displaySquares.map((position, displayIndex) => (
          <ChessSquare
            key={position}
            position={position}
            displayIndex={displayIndex}
            piece={board[position]}
            isSelected={selectedSquare === position}
            isLegalMove={legalMoves.includes(position)}
            isLastMove={lastMove?.from === position || lastMove?.to === position}
            isCheck={checkedKingSquare === position}
            isFlipped={isFlipped}
            onClick={() => onSquareClick(position)}
          />
        ))}
      </div>
    </div>
  );
}
