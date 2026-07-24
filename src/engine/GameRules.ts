import type { CastlingRights, Piece, turn } from "../types/chess";
import { getPseudoLegalMoves } from "./moveGenerator";
import { getPawnAttackSquares } from "./pawn";

export class GameRules {
    static getLegalMoves(board: Piece[], position: number, currentTurn: turn, castlingRights: CastlingRights): number[] {
        const piece = board[position];
        const pseudoMoves = getPseudoLegalMoves(board, position);
        const legalMoves: number[] = [];

        for (let index = 0; index < pseudoMoves.length; index++) {
            const move = pseudoMoves[index];
            const nextBoard = [...board];

            nextBoard[move] = nextBoard[position];
            nextBoard[position] = "";

            if (!GameRules.isKingInCheck(nextBoard, currentTurn)) {
                legalMoves.push(move);
            }
        }

        if (piece === "K" || piece === "k") {
            const color = GameRules.getPieceColor(board, position)!;
            legalMoves.push(...GameRules.getCastleMoves(board, color, castlingRights));
        }

        return legalMoves;
    }

    static findKing(board: Piece[], color: turn): number {
        const piece = color == "white" ? "K" : "k";
        for (let index = 0; index < board.length; index++) {
            if (board[index] == piece) {
                return index;
            }
        }
        return -1;
    }

    static isSquareAttacked(board: Piece[], position: number, color: turn): boolean {
        for (let index = 0; index < board.length; index++) {
            if (GameRules.getPieceColor(board, index) == color) {
                let legalMoves;
                if (board[index] == "p" || board[index] == "P") {
                    legalMoves = getPawnAttackSquares(board, index);
                } else {
                    legalMoves = getPseudoLegalMoves(board, index);
                }
                if (legalMoves.includes(position)) return true;
            }
        }
        return false;
    }

    static isKingInCheck(board: Piece[], color: turn): boolean {
        const position = GameRules.findKing(board, color);
        const opponent: turn = color == "white" ? "black" : "white";
        return GameRules.isSquareAttacked(board, position, opponent);
    }

    static hasLegalMoves(board: Piece[], color: turn, currentTurn: turn, castlingRights: CastlingRights): boolean {
        for (let index = 0; index < board.length; index++) {
            if (GameRules.getPieceColor(board, index) == color) {
                const legalMoves = GameRules.getLegalMoves(board, index, currentTurn, castlingRights);
                if (legalMoves.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    static checkmate(board: Piece[], color: turn, currentTurn: turn, castlingRights: CastlingRights): boolean {
        return GameRules.isKingInCheck(board, color) && !GameRules.hasLegalMoves(board, color, currentTurn, castlingRights);
    }

    static staleMate(board: Piece[], color: turn, currentTurn: turn, castlingRights: CastlingRights): boolean {
        return !GameRules.isKingInCheck(board, color) && !GameRules.hasLegalMoves(board, color, currentTurn, castlingRights);
    }

    static canCastleKingSide(board: Piece[], color: turn, castlingRights: CastlingRights): boolean {
        if (!castlingRights[color].kingSide) return false;

        if (GameRules.isKingInCheck(board, color)) return false;

        const opponent: turn = color === "white" ? "black" : "white";

        const kingPos = color === "white" ? 60 : 4;
        const rookPos = color === "white" ? 63 : 7;

        if (board[kingPos] !== (color === "white" ? "K" : "k"))
            return false;

        if (board[rookPos] !== (color === "white" ? "R" : "r"))
            return false;

        const squares =
            color === "white"
                ? [61, 62]
                : [5, 6];

        for (const square of squares) {
            if (!GameRules.isEmpty(board, square))
                return false;
        }

        for (const square of [kingPos, ...squares]) {
            if (GameRules.isSquareAttacked(board, square, opponent))
                return false;
        }

        return true;
    }

    static canCastleQueenSide(board: Piece[], color: turn, castlingRights: CastlingRights): boolean {
        if (!castlingRights[color].queenSide) return false;

        if (GameRules.isKingInCheck(board, color)) return false;

        const opponent: turn = color === "white" ? "black" : "white";

        const kingPos = color === "white" ? 60 : 4;
        const rookPos = color === "white" ? 56 : 0;

        if (board[kingPos] !== (color === "white" ? "K" : "k"))
            return false;

        if (board[rookPos] !== (color === "white" ? "R" : "r"))
            return false;

        const emptySquares =
            color === "white"
                ? [57, 58, 59]
                : [1, 2, 3];

        const attackedSquares =
            color === "white"
                ? [60, 59, 58]
                : [4, 3, 2];

        for (const square of emptySquares) {
            if (!GameRules.isEmpty(board, square))
                return false;
        }

        for (const square of attackedSquares) {
            if (GameRules.isSquareAttacked(board, square, opponent))
                return false;
        }

        return true;
    }

    static getCastleMoves(board: Piece[], color: turn, castlingRights: CastlingRights): number[] {
        const moves: number[] = [];

        if (GameRules.canCastleKingSide(board, color, castlingRights)) {
            moves.push(color === "white" ? 62 : 6);
        }

        if (GameRules.canCastleQueenSide(board, color, castlingRights)) {
            moves.push(color === "white" ? 58 : 2);
        }

        return moves;
    }

    static isPromotionMove(piece: Piece, to: number): boolean {
        return (piece === "P" && to >= 0 && to < 8) || (piece === "p" && to >= 56 && to < 64);
    }

    private static isEmpty(board: Piece[], position: number): boolean {
        return board[position] === "";
    }

    private static getPieceColor(board: Piece[], position: number): turn | null {
        const piece = board[position];
        switch (piece) {
            case "P":
            case "R":
            case "N":
            case "B":
            case "Q":
            case "K":
                return "white";
            case "p":
            case "r":
            case "n":
            case "b":
            case "q":
            case "k":
                return "black";
            default:
                return null;
        }
    }
}
