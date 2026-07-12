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