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

    const isBetterTieBreak = (move: Move, currentBestMove: Move | null): boolean => {
        if (currentBestMove === null) return true;

        return isImmediateRepeat(position, currentBestMove) && !isImmediateRepeat(position, move);
    };

    if (position.currentTurn === "white") {
        let bestScore = -Infinity;

        for (const move of moves) {
            const nextPosition = applyMove(position, move);
            const score = minimax(nextPosition, depth - 1);

            if (score > bestScore || (score === bestScore && isBetterTieBreak(move, bestMove))) {
                bestScore = score;
                bestMove = move;
            }
        }
    } else {
        let bestScore = Infinity;

        for (const move of moves) {
            const nextPosition = applyMove(position, move);
            const score = minimax(nextPosition, depth - 1);

            if (score < bestScore || (score === bestScore && isBetterTieBreak(move, bestMove))) {
                bestScore = score;
                bestMove = move;
            }
        }
    }

    return bestMove;
};

const isImmediateRepeat = (position: Position, move: Move): boolean => {
    const previousOwnMove = [...position.history]
        .reverse()
        .find((historicalMove) => isOwnMove(position, historicalMove));

    if (!previousOwnMove) return false;

    return (
        move.piece === previousOwnMove.piece &&
        move.from === previousOwnMove.to &&
        move.to === previousOwnMove.from &&
        move.captured === ""
    );
};

const isOwnMove = (position: Position, move: Move): boolean => {
    const isWhiteMove = move.piece === move.piece.toUpperCase();

    return position.currentTurn === "white" ? isWhiteMove : !isWhiteMove;
};
