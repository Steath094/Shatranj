import type { Move, Position } from "../../types/chess";
import { getAllLegalMoves } from "../Position";
import { applyMove } from "../MoveApplication";
import { minimax } from "./minimax";

export const AI_CONFIG = {
    easy: {
        depth: 2,
    },
} as const;

export const findBestMove = (
    position: Position,
    depth: number
): Move | null => {
    const moves = getAllLegalMoves(position);

    if (moves.length === 0) {
        return null;
    }

    let bestMove: Move | null = null;

    if (position.currentTurn === "white") {
        let bestScore = -Infinity;

        for (const move of moves) {
            const nextPosition = applyMove(position, move);
            const score = minimax(nextPosition, depth - 1);

            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    } else {
        let bestScore = Infinity;

        for (const move of moves) {
            const nextPosition = applyMove(position, move);
            const score = minimax(nextPosition, depth - 1);

            if (score < bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
    }

    return bestMove;
};