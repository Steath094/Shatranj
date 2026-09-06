import type { Position } from "../../types/chess";
import { getAllLegalMoves } from "../Position";
import { applyMove } from "../MoveApplication";
import { GameRules } from "../GameRules";
import { evaluatePosition } from "./evaluation";
import { MATE_SCORE, type SearchStats } from "./minimax";

export const alphaBeta = (
    position: Position,
    depth: number,
    alpha: number,
    beta: number,
    stats?: SearchStats,
): number => {
    if (stats) stats.nodes += 1;

    const moves = getAllLegalMoves(position);

    if (moves.length === 0) {
        if (GameRules.isKingInCheck(position.board, position.currentTurn)) {
            return position.currentTurn === "white" ? -MATE_SCORE : MATE_SCORE;
        }

        return 0;
    }

    if (GameRules.threefoldRepetition(position.history)) {
        return 0;
    }

    if (depth === 0) {
        return evaluatePosition(position);
    }

    if (position.currentTurn === "white") {
        let bestScore = -Infinity;

        for (const move of moves) {
            const score = alphaBeta(
                applyMove(position, move),
                depth - 1,
                alpha,
                beta,
                stats,
            );
            bestScore = Math.max(bestScore, score);
            alpha = Math.max(alpha, bestScore);

            if (alpha >= beta) break;
        }

        return bestScore;
    }

    let bestScore = Infinity;

    for (const move of moves) {
        const score = alphaBeta(
            applyMove(position, move),
            depth - 1,
            alpha,
            beta,
            stats,
        );
        bestScore = Math.min(bestScore, score);
        beta = Math.min(beta, bestScore);

        if (alpha >= beta) break;
    }

    return bestScore;
};