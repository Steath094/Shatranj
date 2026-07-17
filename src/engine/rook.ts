import type { Piece } from "../types/chess";
import { traceDirections } from "./traceDirection";

export const getRookMoves = (board: Piece[], index: number): number[] => {
    const directions: number[][] = [
        [0,-1],
        [0,1],
        [-1,0],
        [1,0],
    ]

    return traceDirections(
        board,
        index,
        directions
    );
}