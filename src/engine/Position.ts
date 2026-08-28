import type { CastlingRights, Move, Piece, Position, PromotionPiece, turn } from "../types/chess";
import { createMove } from "./MoveApplication";
import { GameRules } from "./GameRules";

export type { Position } from "../types/chess";

export const createInitialBoard = (): Piece[] => [
  "r", "n", "b", "q", "k", "b", "n", "r",
  "p", "p", "p", "p", "p", "p", "p", "p",
  "", "", "", "", "", "", "", "",
  "", "", "", "", "", "", "", "",
  "", "", "", "", "", "", "", "",
  "", "", "", "", "", "", "", "",
  "P", "P", "P", "P", "P", "P", "P", "P",
  "R", "N", "B", "Q", "K", "B", "N", "R",
];

export const createInitialCastlingRights = (): CastlingRights => ({
  white: {
    kingSide: true,
    queenSide: true,
  },
  black: {
    kingSide: true,
    queenSide: true,
  },
});

export const createInitialPosition = (): Position => ({
  board: createInitialBoard(),
  currentTurn: "white",
  history: [],
  castlingRights: createInitialCastlingRights(),
});

export const clonePosition = (position: Position): Position => ({
  board: [...position.board],
  currentTurn: position.currentTurn,
  history: position.history.map((move) => ({ ...move })),
  castlingRights: {
    white: {
      kingSide: position.castlingRights.white.kingSide,
      queenSide: position.castlingRights.white.queenSide,
    },
    black: {
      kingSide: position.castlingRights.black.kingSide,
      queenSide: position.castlingRights.black.queenSide,
    },
  },
});

export const getLegalMoves = (position: Position, square: number): number[] => {
  return GameRules.getLegalMoves(
    position.board,
    square,
    position.currentTurn,
    position.castlingRights,
    position.history,
  );
};

export const getAllLegalMoves = (position: Position): Move[] => {
  const moves: Move[] = [];

  for (let square = 0; square < position.board.length; square++) {
    if (getPieceColor(position.board[square]) !== position.currentTurn) continue;

    for (const target of getLegalMoves(position, square)) {
      const piece = position.board[square];

      if (piece === "P" && target >= 0 && target < 8) {
        addPromotionMoves(position, moves, square, target, ["Q", "R", "B", "N"]);
        continue;
      }

      if (piece === "p" && target >= 56 && target < 64) {
        addPromotionMoves(position, moves, square, target, ["q", "r", "b", "n"]);
        continue;
      }

      const move = createMove(position, square, target);
      if (move) moves.push(move);
    }
  }

  return moves;
};

const addPromotionMoves = (
  position: Position,
  moves: Move[],
  from: number,
  to: number,
  promotions: PromotionPiece[],
): void => {
  for (const promotion of promotions) {
    const move = createMove(position, from, to, promotion);
    if (move) moves.push(move);
  }
};

const getPieceColor = (piece: Piece): turn | null => {
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
};
