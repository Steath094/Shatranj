import type { Position } from "../../types/chess";
import { getAllLegalMoves } from "../Position";
import { applyMove } from "../MoveApplication";
import { GameRules } from "../GameRules";
import { evaluatePosition } from "./evaluation";

const MATE_SCORE = 1_000_000;

export const minimax = (
    position: Position,
    depth: number
): number => {

    const moves = getAllLegalMoves(position);

    // Terminal position
    if (moves.length === 0) {
        // Current player has no legal moves and is in check
        if (GameRules.isKingInCheck(
            position.board,
            position.currentTurn
        )) {
            if (position.currentTurn === "white") {
                return -MATE_SCORE;
            }

            return MATE_SCORE;
        }

        // No legal moves + not in check = stalemate
        return 0;
    }

    // Search depth reached
    if (depth === 0) {
        return evaluatePosition(position);
    }

    if (position.currentTurn === "white") {
        let bestScore = -Infinity;

        for (const move of moves) {
            const nextPosition = applyMove(position, move);

            const score = minimax(
                nextPosition,
                depth - 1
            );

            bestScore = Math.max(bestScore, score);
        }

        return bestScore;
    }

    let bestScore = Infinity;

    for (const move of moves) {
        const nextPosition = applyMove(position, move);

        const score = minimax(
            nextPosition,
            depth - 1
        );

        bestScore = Math.min(bestScore, score);
    }

    return bestScore;
};