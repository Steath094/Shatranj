export type Piece =
  | ""
  | "P"
  | "R"
  | "N"
  | "B"
  | "Q"
  | "K"
  | "p"
  | "r"
  | "n"
  | "b"
  | "q"
  | "k";

export type PromotionPiece = "Q" | "R" | "B" | "N" | "q" | "r" | "b" | "n";

export type turn = "white" | "black";

export type CastlingRights = {
    white: {
        kingSide: boolean;
        queenSide: boolean;
    };
    black: {
        kingSide: boolean;
        queenSide: boolean;
    };
};

export interface Move {

    from:number;

    to:number;

    piece:Piece;

    captured:Piece;

    promotion?: PromotionPiece;
}

export interface ClickResult {
    boardChanged: boolean;
    selectionChanged: boolean;
    // captured: boolean;
    // check: boolean;
    // checkmate: boolean;
    // promotion?: boolean;
}

export type GameSnapshot = {
    board: Piece[];
    currentTurn: turn;
    history: Move[];
    selectedSquare: number | null;
    legalMoves: number[];
    castlingRights: CastlingRights;
};
