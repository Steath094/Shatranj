import type { Move, Position } from "../../types/chess";
import { getAllLegalMoves } from "../Position";
import { applyMove } from "../MoveApplication";
import { GameRules } from "../GameRules";
import { alphaBeta } from "./alphaBeta";
import { minimax, type SearchStats } from "./minimax";

export type SearchAlgorithm = "minimax" | "alpha-beta";

export const AI_CONFIG = {
    easy: {
        depth: 2,
        algorithm: "minimax" as const,
    },
    medium: {
        depth: 3,
        algorithm: "alpha-beta" as const,
    },
} as const;

export const findBestMove = (
    position: Position,
    depth: number,
    algorithm: SearchAlgorithm = "minimax",
    stats?: SearchStats,
): Move | null => {
    const moves = getAllLegalMoves(position);

    if (moves.length === 0) {
        return null;
    }

    let bestMove: Move | null = null;

    const isBetterTieBreak = (move: Move, currentBestMove: Move | null): boolean => {
        if (currentBestMove === null) return true;

        return isRepeatedPosition(position, currentBestMove) && !isRepeatedPosition(position, move);
    };

    if (position.currentTurn === "white") {
        let bestScore = -Infinity;

        for (const move of moves) {
            const nextPosition = applyMove(position, move);
            const score = search(nextPosition, depth - 1, algorithm, stats);

            if (score > bestScore || (score === bestScore && isBetterTieBreak(move, bestMove))) {
                bestScore = score;
                bestMove = move;
            }
        }
    } else {
        let bestScore = Infinity;

        for (const move of moves) {
            const nextPosition = applyMove(position, move);
            const score = search(nextPosition, depth - 1, algorithm, stats);

            if (score < bestScore || (score === bestScore && isBetterTieBreak(move, bestMove))) {
                bestScore = score;
                bestMove = move;
            }
        }
    }

    return bestMove;
};

const search = (
    position: Position,
    depth: number,
    algorithm: SearchAlgorithm,
    stats?: SearchStats,
): number => {
    if (algorithm === "alpha-beta") {
        return alphaBeta(position, depth, -Infinity, Infinity, stats);
    }

    return minimax(position, depth, stats);
};

const isRepeatedPosition = (position: Position, move: Move): boolean => {
    return GameRules.getPositionRepetitionCount(applyMove(position, move)) > 1;
};
