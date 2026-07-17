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

export interface Move {

    from:number;

    to:number;

    piece:Piece;

    captured:Piece;
}

export interface ClickResult {
    boardChanged: boolean;
    selectionChanged: boolean;
    // captured: boolean;
    // check: boolean;
    // checkmate: boolean;
    // promotion?: boolean;
}

export type turn = "white" | "black";