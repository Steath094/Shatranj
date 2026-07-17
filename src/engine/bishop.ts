import type { Piece } from "../types/chess";
import { traceDirections } from "./traceDirection";

export const getBishopMoves = (board: Piece[], index: number): number[] => {
    const directions: number[][] = [
        [-1,-1],
        [1,1],
        [-1,1],
        [1,-1],
    ]

    return traceDirections(
        board,
        index,
        directions
    );
}