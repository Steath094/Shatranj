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
        const board = GameRules.getInitialBoard();
        const castlingRights = GameRules.getInitialCastlingRights();
        const replayedHistory: Move[] = [];
        const positionCounts = new Map<string, number>();
        let currentTurn: turn = "white";

        const countCurrentPosition = (): boolean => {
            const positionKey = GameRules.getPositionKey(board, currentTurn, castlingRights, replayedHistory);
            const count = (positionCounts.get(positionKey) ?? 0) + 1;

            positionCounts.set(positionKey, count);

            return count >= 3;
        };

        if (countCurrentPosition()) return true;

        for (const move of history) {
            GameRules.applyHistoricalMove(board, move, currentTurn, replayedHistory);
            GameRules.updateCastlingRights(castlingRights, move);
            replayedHistory.push(move);
            currentTurn = currentTurn === "white" ? "black" : "white";

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

    private static getInitialBoard(): Piece[] {
        return [
            "r", "n", "b", "q", "k", "b", "n", "r",
            "p", "p", "p", "p", "p", "p", "p", "p",
            "", "", "", "", "", "", "", "",
            "", "", "", "", "", "", "", "",
            "", "", "", "", "", "", "", "",
            "", "", "", "", "", "", "", "",
            "P", "P", "P", "P", "P", "P", "P", "P",
            "R", "N", "B", "Q", "K", "B", "N", "R",
        ];
    }

    private static getInitialCastlingRights(): CastlingRights {
        return {
            white: {
                kingSide: true,
                queenSide: true,
            },
            black: {
                kingSide: true,
                queenSide: true,
            },
        };
    }

    private static applyHistoricalMove(board: Piece[], move: Move, currentTurn: turn, history: Move[]): void {
        const enPassantCapturePosition = GameRules.getEnPassantCapturePosition(board, move.from, move.to, currentTurn, history);

        if (move.piece === "K" && move.from === 60 && move.to === 62) {
            GameRules.movePiece(board, move.from, move.to);
            GameRules.movePiece(board, 63, 61);
            return;
        }

        if (move.piece === "K" && move.from === 60 && move.to === 58) {
            GameRules.movePiece(board, move.from, move.to);
            GameRules.movePiece(board, 56, 59);
            return;
        }

        if (move.piece === "k" && move.from === 4 && move.to === 6) {
            GameRules.movePiece(board, move.from, move.to);
            GameRules.movePiece(board, 7, 5);
            return;
        }

        if (move.piece === "k" && move.from === 4 && move.to === 2) {
            GameRules.movePiece(board, move.from, move.to);
            GameRules.movePiece(board, 0, 3);
            return;
        }

        if (enPassantCapturePosition !== null) {
            GameRules.movePiece(board, move.from, move.to);
            board[enPassantCapturePosition] = "";
            return;
        }

        GameRules.movePiece(board, move.from, move.to);

        if (GameRules.isPromotionMove(move.piece, move.to)) {
            board[move.to] = move.piece === "P" ? "Q" : "q";
        }
    }

    private static movePiece(board: Piece[], from: number, to: number): void {
        board[to] = board[from];
        board[from] = "";
    }

    private static updateCastlingRights(castlingRights: CastlingRights, move: Move): void {
        if (move.piece == "K") {
            castlingRights.white.kingSide = false;
            castlingRights.white.queenSide = false;
        }
        if (move.piece == "k") {
            castlingRights.black.kingSide = false;
            castlingRights.black.queenSide = false;
        }
        if ((move.piece == "r" && move.from == 0) || (move.captured == "r" && move.to == 0)) {
            castlingRights.black.queenSide = false;
        }
        if ((move.piece == "r" && move.from == 7) || (move.captured == "r" && move.to == 7)) {
            castlingRights.black.kingSide = false;
        }
        if ((move.piece == "R" && move.from == 56) || (move.captured == "R" && move.to == 56)) {
            castlingRights.white.queenSide = false;
        }
        if ((move.piece == "R" && move.from == 63) || (move.captured == "R" && move.to == 63)) {
            castlingRights.white.kingSide = false;
        }
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
            const enPassantMove = GameRules.getEnPassantMove(board, position, currentTurn, history);
            const capturedPawnPosition = enPassantMove === null
                ? null
                : GameRules.getEnPassantCapturePosition(board, position, enPassantMove, currentTurn, history);

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
