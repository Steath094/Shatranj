import type { CastlingRights, Move, Piece, Position, turn } from "../types/chess";
import { applyMove, getEnPassantCapturePosition, getEnPassantMove, isPromotionMove } from "./MoveApplication";
import { getPseudoLegalMoves } from "./moveGenerator";
import { getPawnAttackSquares } from "./pawn";

export class GameRules {
    static getLegalMovesForPosition(position: Position, square: number): number[] {
        return GameRules.getLegalMoves(
            position.board,
            square,
            position.currentTurn,
            position.castlingRights,
            position.history,
        );
    }

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
            const enPassantMove = getEnPassantMove(board, position, currentTurn, history);
            const capturedPawnPosition = enPassantMove === null
                ? null
                : getEnPassantCapturePosition(board, position, enPassantMove, currentTurn, history);

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

    static insufficientMaterial(board: Piece[]): boolean {
        const pieces = board
            .map((piece, position) => ({ piece, position }))
            .filter(({ piece }) => piece !== "");

        const nonKingPieces = pieces.filter(({ piece }) => piece !== "K" && piece !== "k");

        if (nonKingPieces.length === 0) return true;

        for (const { piece } of nonKingPieces) {
            if (piece === "P" || piece === "p" || piece === "R" || piece === "r" || piece === "Q" || piece === "q") {
                return false;
            }
        }

        if (nonKingPieces.length === 1) return true;

        const bishops = nonKingPieces.filter(({ piece }) => piece === "B" || piece === "b");

        if (nonKingPieces.length === 2 && bishops.length === 2) {
            return GameRules.isLightSquare(bishops[0].position) === GameRules.isLightSquare(bishops[1].position);
        }

        return false;
    }

    static fiftyMoveRule(history: Move[]): boolean {
        let halfMoves = 0;

        for (let index = history.length - 1; index >= 0; index--) {
            const move = history[index];
            const isPawnMove = move.piece === "P" || move.piece === "p";
            const isCapture = move.captured !== "";

            if (isPawnMove || isCapture) {
                break;
            }

            halfMoves++;
        }

        return halfMoves >= 100;
    }

    static threefoldRepetition(history: Move[]): boolean {
        let position: Position = {
            board: [
                "r", "n", "b", "q", "k", "b", "n", "r",
                "p", "p", "p", "p", "p", "p", "p", "p",
                "", "", "", "", "", "", "", "",
                "", "", "", "", "", "", "", "",
                "", "", "", "", "", "", "", "",
                "", "", "", "", "", "", "", "",
                "P", "P", "P", "P", "P", "P", "P", "P",
                "R", "N", "B", "Q", "K", "B", "N", "R",
            ],
            currentTurn: "white",
            history: [],
            castlingRights: {
                white: {
                    kingSide: true,
                    queenSide: true,
                },
                black: {
                    kingSide: true,
                    queenSide: true,
                },
            },
        };
        const positionCounts = new Map<string, number>();

        const countCurrentPosition = (): boolean => {
            const positionKey = GameRules.getPositionKey(
                position.board,
                position.currentTurn,
                position.castlingRights,
                position.history,
            );
            const count = (positionCounts.get(positionKey) ?? 0) + 1;

            positionCounts.set(positionKey, count);

            return count >= 3;
        };

        if (countCurrentPosition()) return true;

        for (const move of history) {
            position = applyMove(position, move);

            if (countCurrentPosition()) return true;
        }

        return false;
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
        return isPromotionMove(piece, to);
    }

    static getEnPassantMove(board: Piece[], position: number, currentTurn: turn, history: Move[]): number | null {
        return getEnPassantMove(board, position, currentTurn, history);
    }

    static getEnPassantCapturePosition(board: Piece[], from: number, to: number, currentTurn: turn, history: Move[]): number | null {
        return getEnPassantCapturePosition(board, from, to, currentTurn, history);
    }

    private static getPositionKey(board: Piece[], currentTurn: turn, castlingRights: CastlingRights, history: Move[]): string {
        return [
            board.join(","),
            currentTurn,
            GameRules.getCastlingRightsKey(castlingRights),
            GameRules.getEnPassantTargetKey(board, currentTurn, history),
        ].join("|");
    }

    private static getCastlingRightsKey(castlingRights: CastlingRights): string {
        let key = "";

        if (castlingRights.white.kingSide) key += "K";
        if (castlingRights.white.queenSide) key += "Q";
        if (castlingRights.black.kingSide) key += "k";
        if (castlingRights.black.queenSide) key += "q";

        return key === "" ? "-" : key;
    }

    private static getEnPassantTargetKey(board: Piece[], currentTurn: turn, history: Move[]): string {
        for (let position = 0; position < board.length; position++) {
            const enPassantMove = getEnPassantMove(board, position, currentTurn, history);
            const capturedPawnPosition = enPassantMove === null
                ? null
                : getEnPassantCapturePosition(board, position, enPassantMove, currentTurn, history);

            if (enPassantMove !== null && capturedPawnPosition !== null) {
                const nextBoard = [...board];

                nextBoard[enPassantMove] = nextBoard[position];
                nextBoard[position] = "";
                nextBoard[capturedPawnPosition] = "";

                if (GameRules.isKingInCheck(nextBoard, currentTurn)) {
                    continue;
                }

                return enPassantMove.toString();
            }
        }

        return "-";
    }

    private static isEmpty(board: Piece[], position: number): boolean {
        return board[position] === "";
    }

    private static isLightSquare(position: number): boolean {
        const row = Math.floor(position / 8);
        const col = position % 8;

        return (row + col) % 2 === 0;
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
