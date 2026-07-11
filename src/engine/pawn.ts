import type { Piece } from "../types/chess";

export function getPawnMoves(board: Piece[], index: number): number[] {
  const piece = board[index];
  if (piece !== "P" && piece !== "p") return [];
  let row = Math.floor(index / 8);
  let col = index % 8;
  let res = [];
  if (piece === "P") {
    row -= 1;
    let newIndex = row * 8 + col;
    if (board[newIndex] === "") res.push(newIndex); // Possible move for the white pawn
    if (index-7>=0 && board[index-7] !== "") res.push(index-7);
    if (index-9>=0 && board[index-9] !== "") res.push(index-9);
    if (index<48) {
        return res;
    }
    row -= 1;
    newIndex = row * 8 + col;
    if (board[newIndex] === "") res.push(newIndex); // Possible move for the white pawn
  
    return res;
  } else {
    row += 1;
    let newIndex = row * 8 + col;
    if (board[newIndex] === "") res.push(newIndex); // Possible move for the black pawn
    console.log(board[index+7]);
    if (index+7<64 && board[index+7] !== "" ) res.push(index+7);
    if (index+9<64 && board[index+9] !== "") res.push(index+9);
    if (index>15) {
        return res;
    }
    row += 1;
    newIndex = row * 8 + col;
    if (board[newIndex] === "") res.push(newIndex); // Possible move for the black pawn
    
    return res;
  }
}
