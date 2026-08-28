import type { CastlingRights, Move, Piece, Position, PromotionPiece, turn } from "../types/chess";

const cloneCastlingRights = (castlingRights: CastlingRights): CastlingRights => ({
  white: {
    kingSide: castlingRights.white.kingSide,
    queenSide: castlingRights.white.queenSide,
  },
  black: {
    kingSide: castlingRights.black.kingSide,
    queenSide: castlingRights.black.queenSide,
  },
});

const movePiece = (board: Piece[], from: number, to: number): void => {
  board[to] = board[from];
  board[from] = "";
};

export const getPromotionPiece = (movingPiece: Piece, promotionPiece?: PromotionPiece): PromotionPiece => {
  const fallback = movingPiece === "P" ? "Q" : "q";

  if (promotionPiece === undefined) return fallback;

  const isWhitePromotion = movingPiece === "P" && ["Q", "R", "B", "N"].includes(promotionPiece);
  const isBlackPromotion = movingPiece === "p" && ["q", "r", "b", "n"].includes(promotionPiece);

  return isWhitePromotion || isBlackPromotion ? promotionPiece : fallback;
};

export const isPromotionMove = (piece: Piece, to: number): boolean => {
  return (piece === "P" && to >= 0 && to < 8) || (piece === "p" && to >= 56 && to < 64);
};

export const getEnPassantMove = (board: Piece[], position: number, currentTurn: turn, history: Move[]): number | null => {
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
};

export const getEnPassantCapturePosition = (
  board: Piece[],
  from: number,
  to: number,
  currentTurn: turn,
  history: Move[],
): number | null => {
  const enPassantMove = getEnPassantMove(board, from, currentTurn, history);
  if (enPassantMove !== to) return null;

  const lastMove = history[history.length - 1];
  if (!lastMove) return null;

  return lastMove.to;
};

export const updateCastlingRights = (castlingRights: CastlingRights, move: Move): CastlingRights => {
  const nextCastlingRights = cloneCastlingRights(castlingRights);

  if (move.piece == "K") {
    nextCastlingRights.white.kingSide = false;
    nextCastlingRights.white.queenSide = false;
  }
  if (move.piece == "k") {
    nextCastlingRights.black.kingSide = false;
    nextCastlingRights.black.queenSide = false;
  }
  if ((move.piece == "r" && move.from == 0) || (move.captured == "r" && move.to == 0)) {
    nextCastlingRights.black.queenSide = false;
  }
  if ((move.piece == "r" && move.from == 7) || (move.captured == "r" && move.to == 7)) {
    nextCastlingRights.black.kingSide = false;
  }
  if ((move.piece == "R" && move.from == 56) || (move.captured == "R" && move.to == 56)) {
    nextCastlingRights.white.queenSide = false;
  }
  if ((move.piece == "R" && move.from == 63) || (move.captured == "R" && move.to == 63)) {
    nextCastlingRights.white.kingSide = false;
  }

  return nextCastlingRights;
};

export const createMove = (position: Position, from: number, to: number, promotionPiece?: PromotionPiece): Move | null => {
  const movingPiece = position.board[from];
  if (movingPiece === "") return null;

  const enPassantCapturePosition = getEnPassantCapturePosition(
    position.board,
    from,
    to,
    position.currentTurn,
    position.history,
  );
  const capturedPiece = enPassantCapturePosition === null
    ? position.board[to]
    : position.board[enPassantCapturePosition];
  const promotion = isPromotionMove(movingPiece, to)
    ? getPromotionPiece(movingPiece, promotionPiece)
    : undefined;

  return {
    from,
    to,
    piece: movingPiece,
    captured: capturedPiece,
    ...(promotion !== undefined ? { promotion } : {}),
  };
};

export const applyMove = (position: Position, move: Move): Position => {
  const board = [...position.board];
  const history = position.history.map((historicalMove) => ({ ...historicalMove }));
  const movingPiece = board[move.from];
  const enPassantCapturePosition = getEnPassantCapturePosition(
    board,
    move.from,
    move.to,
    position.currentTurn,
    history,
  );
  const promotion = isPromotionMove(movingPiece, move.to)
    ? getPromotionPiece(movingPiece, move.promotion)
    : undefined;
  const appliedMove: Move = {
    ...move,
    piece: movingPiece,
    captured: enPassantCapturePosition === null ? board[move.to] : board[enPassantCapturePosition],
    ...(promotion !== undefined ? { promotion } : {}),
  };

  if (movingPiece === "K" && move.from === 60 && move.to === 62) {
    movePiece(board, move.from, move.to);
    movePiece(board, 63, 61);
  } else if (movingPiece === "K" && move.from === 60 && move.to === 58) {
    movePiece(board, move.from, move.to);
    movePiece(board, 56, 59);
  } else if (movingPiece === "k" && move.from === 4 && move.to === 6) {
    movePiece(board, move.from, move.to);
    movePiece(board, 7, 5);
  } else if (movingPiece === "k" && move.from === 4 && move.to === 2) {
    movePiece(board, move.from, move.to);
    movePiece(board, 0, 3);
  } else if (enPassantCapturePosition !== null) {
    movePiece(board, move.from, move.to);
    board[enPassantCapturePosition] = "";
  } else if (promotion !== undefined) {
    movePiece(board, move.from, move.to);
    board[move.to] = promotion;
  } else {
    movePiece(board, move.from, move.to);
  }

  return {
    board,
    currentTurn: position.currentTurn === "white" ? "black" : "white",
    history: [...history, appliedMove],
    castlingRights: updateCastlingRights(position.castlingRights, appliedMove),
  };
};
