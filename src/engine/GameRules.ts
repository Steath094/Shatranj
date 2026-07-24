import type { CastlingRights, Move, Piece, turn } from "../types/chess";
import { getPseudoLegalMoves } from "./moveGenerator";
import { getPawnAttackSquares } from "./pawn";

export class GameRules {
    static getLegalMoves(board: Piece[], position: number, currentTurn: turn, castlingRights: CastlingRights, history: Move[]): number[] {
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

        if (piece === "P" || piece === "p") {
            const enPassantMove = GameRules.getEnPassantMove(board, position, currentTurn, history);
            const capturedPawnPosition = enPassantMove === null
                ? null
                : GameRules.getEnPassantCapturePosition(board, position, enPassantMove, currentTurn, history);

            if (enPassantMove !== null && capturedPawnPosition !== null) {
                const nextBoard = [...board];

                nextBoard[enPassantMove] = nextBoard[position];
                nextBoard[position] = "";
                nextBoard[capturedPawnPosition] = "";

                if (!GameRules.isKingInCheck(nextBoard, currentTurn)) {
                    legalMoves.push(enPassantMove);
                }
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

    static hasLegalMoves(board: Piece[], color: turn, currentTurn: turn, castlingRights: CastlingRights, history: Move[]): boolean {
        for (let index = 0; index < board.length; index++) {
            if (GameRules.getPieceColor(board, index) == color) {
                const legalMoves = GameRules.getLegalMoves(board, index, currentTurn, castlingRights, history);
                if (legalMoves.length > 0) {
                    return true;
                }
            }
        }
        return false;
    }

    static checkmate(board: Piece[], color: turn, currentTurn: turn, castlingRights: CastlingRights, history: Move[]): boolean {
        return GameRules.isKingInCheck(board, color) && !GameRules.hasLegalMoves(board, color, currentTurn, castlingRights, history);
    }

    static staleMate(board: Piece[], color: turn, currentTurn: turn, castlingRights: CastlingRights, history: Move[]): boolean {
        return !GameRules.isKingInCheck(board, color) && !GameRules.hasLegalMoves(board, color, currentTurn, castlingRights, history);
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

    static getEnPassantMove(board: Piece[], position: number, currentTurn: turn, history: Move[]): number | null {
        const piece = board[position];
        const ownPawn = currentTurn === "white" ? "P" : "p";
        const enemyPawn = currentTurn === "white" ? "p" : "P";

        if (piece !== ownPawn) return null;

        const lastMove = history[history.length - 1];
        if (!lastMove) return null;
        if (lastMove.piece !== enemyPawn) return null;
        if (board[lastMove.to] !== enemyPawn) return null;

        const lastFromRow = Math.floor(lastMove.from / 8);
        const lastToRow = Math.floor(lastMove.to / 8);
        const lastToCol = lastMove.to % 8;
        const pawnRow = Math.floor(position / 8);
        const pawnCol = position % 8;

        const expectedFromRow = enemyPawn === "p" ? 1 : 6;
        const expectedToRow = enemyPawn === "p" ? 3 : 4;

        if (lastFromRow !== expectedFromRow) return null;
        if (lastToRow !== expectedToRow) return null;
        if (Math.abs(lastMove.to - lastMove.from) !== 16) return null;
        if (pawnRow !== lastToRow) return null;
        if (Math.abs(pawnCol - lastToCol) !== 1) return null;

        const direction = currentTurn === "white" ? -1 : 1;
        const target = (pawnRow + direction) * 8 + lastToCol;

        if (board[target] !== "") return null;

        return target;
    }

    static getEnPassantCapturePosition(board: Piece[], from: number, to: number, currentTurn: turn, history: Move[]): number | null {
        const enPassantMove = GameRules.getEnPassantMove(board, from, currentTurn, history);
        if (enPassantMove !== to) return null;

        const lastMove = history[history.length - 1];
        if (!lastMove) return null;

        return lastMove.to;
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
