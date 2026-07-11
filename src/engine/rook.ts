import type { Piece } from "../types/chess";

export const getRookMoves = (board: Piece[], index: number): number[] => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const moves: number[] = [];
    const direction: number[][] = [
        [0,-1],
        [0,1],
        [-1,0],
        [1,0]
    ]
    for (const dir of direction){
        const rowAdd = dir[0];
        const colAdd = dir[1];
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