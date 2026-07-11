import type { Piece } from "../types/chess";

export const traceDirections = (board: Piece[], row: number, col: number, directions: number[][]): number[] => {
    const moves: number[] = [];
    for (const direction of directions){
        const rowAdd = direction[0];
        const colAdd = direction[1];
        let newRow = row+rowAdd;
        let newCol = col+colAdd;
        while(newRow>=0 && newRow<8 && newCol>=0 && newCol<8){
           const newIndex = newRow * 8 + newCol;
            if (board[newIndex] !== "") break;
            moves.push(newIndex);
            newRow = newRow+rowAdd;
            newCol = newCol+colAdd;
        }
    }
    return moves;
}