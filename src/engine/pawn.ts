import type { Piece } from "../types/chess";
import { getColor, isEnemyPiece, OutOfBound } from "./common";

export function getPawnMoves(board: Piece[], index: number): number[] {
  const piece = board[index];
  if (piece !== "P" && piece !== "p") return [];
  const row = Math.floor(index / 8);
  const col = index % 8;
  const moves: number[] = [];
  const color = getColor(piece);
  const direction = color === "white" ? -1 : +1;
  const startRow = color === "white" ? 6 : 1;
  const forwardRow = row + direction;

  if (OutOfBound(forwardRow,col)) {
    return moves;
  }

  const forwardIndex = forwardRow*8+col;

  if (board[forwardIndex]==="") {
    moves.push(forwardIndex);

    if (row == startRow) {
      const doubleStepRow = row + (direction*2);

      if (!OutOfBound(doubleStepRow,col)) {
        const doubleStepIndex = doubleStepRow * 8 + col;

        if(board[doubleStepIndex] === "") moves.push(doubleStepIndex);
      }
    }
  }

  for (const captureCol of [col + 1, col - 1]) {
    if (!OutOfBound(forwardRow,captureCol)) {
      const captureIndex = forwardRow*8+captureCol;

      if (board[captureIndex] !== "" && isEnemyPiece(piece,board[captureIndex])) {
        moves.push(captureIndex);
      }
    }
  }

  return moves;
}


export function getPawnAttackSquares(board: Piece[], index: number): number[] {
  const piece = board[index];
  const row = Math.floor(index / 8);
  const col = index % 8;
  const moves: number[] = [];
  const color = getColor(piece);
  const direction = color === "white" ? -1 : +1;
  const newRow = row + direction;

  for (const newCol of [col + 1, col - 1]) {
    if (!OutOfBound(newRow,newCol)) {
      const newIndex = newRow*8+newCol;
      moves.push(newIndex);
    }
  }
  
  return moves;
}
