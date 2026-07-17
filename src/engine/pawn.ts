import type { Piece } from "../types/chess";
import { getColor, isEnemyPiece, OutOfBound } from "./common";

export function getPawnMoves(board: Piece[], index: number): number[] {
  const piece = board[index];
  if (piece !== "P" && piece !== "p") return [];
  const row = Math.floor(index / 8);
  const col = index % 8;
  let moves: number[] = [];
  let newIndex;
  let newRow = Math.floor(index / 8);
  let newCol = index % 8;
  const color = getColor(piece);
  const direction = color === "white" ? -1 : +1;
  const startRow = color === "white" ? 6 : 1;
  newRow = row + (direction*1);
  if (OutOfBound(newRow,newCol)) {
    return moves;
  }
  newIndex = newRow*8+newCol;
  if (board[newIndex]==="") {
    moves.push(newIndex);
    if (row == startRow) {
      newRow = row + (direction*2);
      if (!OutOfBound(newRow,newCol)) {
        newIndex = newRow * 8 + newCol;
        if(board[newIndex] === "") moves.push(newIndex);
      }
    }
  }
  newRow = row + (direction*1);
  newCol = col + 1;
  if (!OutOfBound(newRow,newCol)) {
    newIndex = newRow*8+newCol;
    if (isEnemyPiece(piece,board[newIndex])) {
      moves.push(newIndex);
    }
  }
  
  newCol = col - 1;
  if (!OutOfBound(newRow,newCol)) {
    newIndex = newRow*8+newCol;
    if (isEnemyPiece(piece,board[newIndex])) {
      moves.push(newIndex);
    }
  }
  
  return moves;
}
