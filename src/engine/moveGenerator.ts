import type { Piece } from "../types/chess";
import { getBishopMoves } from "./bishop";
import { getKingMoves } from "./king";
import { getKnightMoves } from "./knight";
import { getPawnMoves } from "./pawn";
import { getQueenMoves } from "./queen";
import { getRookMoves } from "./rook";

export const getLegalMoves = (board: Piece[], index: number): number[] => {
    const piece = board[index];
    switch (piece) {
        case "P":
        case "p":
            return getPawnMoves(board, index);
        case "N":
        case "n":
            return getKnightMoves(board, index);
        case "K":
        case "k":
            return getKingMoves(board, index);
        case "B":
        case "b":
            return getBishopMoves(board, index);
        case "R":
        case "r":
            return getRookMoves(board, index);
        case "Q":
        case "q":
            return getQueenMoves(board,index);
        default:
            return [];
    }
}