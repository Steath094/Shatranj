import type { Piece } from "../types/chess";
import { traceDirections } from "./traceDirection";

export const getRookMoves = (board: Piece[], index: number): number[] => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const directions: number[][] = [
        [0,-1],
        [0,1],
        [-1,0],
        [1,0],
    ]

    return traceDirections(
        board,
        row,
        col,
        directions
    );
}