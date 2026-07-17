import type { Piece } from "../types/chess";
import { traceDirections } from "./traceDirection";

export const getQueenMoves = (board: Piece[], index: number) : number[]  => {
    const directions: number[][] = [
        [-1,-1],
        [1,1],
        [-1,1],
        [1,-1],
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