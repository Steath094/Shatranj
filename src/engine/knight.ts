import type { Piece } from "../types/chess";
import { isEnemyPiece } from "./common";

export const getKnightMoves = (board: Piece[], index: number): number[] => {
    const piece = board[index];
    if (piece !== "N" && piece !== "n") return [];

    const row = Math.floor(index / 8);
    const col = index % 8;
    const moves: number[] = [];
    const knightMoves = [
        [row - 2, col - 1],
        [row - 2, col + 1],
        [row - 1, col - 2],
        [row - 1, col + 2],
        [row + 1, col - 2],
        [row + 1, col + 2],
        [row + 2, col - 1],
        [row + 2, col + 1]
    ];

    for (const [newRow, newCol] of knightMoves) {
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const newIndex = newRow * 8 + newCol;
            const currPiece = board[newIndex];
            if (board[newIndex] !== "") {
                if (isEnemyPiece(piece,currPiece)) {
                    moves.push(newIndex);
                }
                continue;
            }
            moves.push(newIndex);
        }
    }

    return moves;
}