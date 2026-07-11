import type { Piece } from "../types/chess";
import { traceDirections } from "./traceDirection";

export const getBishopMoves = (board: Piece[], index: number): number[] => {
    const row = Math.floor(index / 8);
    const col = index % 8;
    const directions: number[][] = [
        [-1,-1],
        [1,1],
        [-1,1],
        [1,-1],
    ]

    return traceDirections(
        board,
        row,
        col,
        directions
    );
}