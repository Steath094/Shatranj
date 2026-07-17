import type { Piece } from "../types/chess";
import { isEnemyPiece } from "./common";

export const traceDirections = (board: Piece[], fromIndex: number, directions: number[][]): number[] => {
    const moves: number[] = [];
    const row = Math.floor(fromIndex / 8);
    const col = fromIndex % 8;
    const srcPiece = board[fromIndex];
    for (const direction of directions){
        const rowAdd = direction[0];
        const colAdd = direction[1];
        let newRow = row+rowAdd;
        let newCol = col+colAdd;
        while(newRow>=0 && newRow<8 && newCol>=0 && newCol<8){
           const newIndex = newRow * 8 + newCol;
            const currPiece = board[newIndex];
            if (board[newIndex] !== "") {
                if (isEnemyPiece(srcPiece,currPiece)) {
                    moves.push(newIndex);
                }
                break;
            };
            moves.push(newIndex);
            newRow = newRow+rowAdd;
            newCol = newCol+colAdd;
        }
    }
    return moves;
}

