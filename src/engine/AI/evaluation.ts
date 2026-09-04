import type { Piece, Position } from "../../types/chess";

const PIECE_VALUES: Record<Exclude<Piece, "">, number> = {
    P: 100,
    N: 320,
    B: 330,
    R: 500,
    Q: 900,
    K: 20_000,

    p: 100,
    n: 320,
    b: 330,
    r: 500,
    q: 900,
    k: 20_000,
};

export const evaluatePosition = (position: Position): number => {
    let score = 0;

    for (const piece of position.board) {
        if (piece === "") continue;

        const value = PIECE_VALUES[piece];

        if (piece === piece.toUpperCase()) {
            score += value;
        } else {
            score -= value;
        }
    }

    return score;
};