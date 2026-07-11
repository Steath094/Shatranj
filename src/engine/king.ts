import type { Piece } from "../types/chess";

export const getKingMoves = (board: Piece[], index: number): number[] => {
    const piece = board[index];
    if (piece !== "K" && piece !== "k") return [];
    const row = Math.floor(index / 8);
    const col = index % 8;
    const moves: number[] = [];
    const kingMoves = [
        [row-1,col],
        [row+1,col],
        [row,col+1],
        [row,col+1],
        [row+1,col+1],
        [row+1,col-1],
        [row-1,col-1],
        [row-1,col+1],
    ]
    for (const [newRow,newCol] of kingMoves){
        if (newRow >= 0 && newRow < 8 && newCol >= 0 && newCol < 8) {
            const newIndex = newRow * 8 + newCol;
            if (board[newIndex] === "") {
                moves.push(newIndex);
            }
        }
    }
    return moves;
}