import type { Piece } from "../types/chess";

export const isEnemyPiece = (source: Piece,destination: Piece) => {
    const srcCOlor  = getColor(source);
    const destCOlor = getColor(destination);
    return srcCOlor!==destCOlor;
}
export const getColor = (piece: Piece) =>{
    if (piece==="") {
        return "empty"
    }
    const white: Piece[] = ["R","P","K","N","B","Q"];
    return white.includes(piece) ? "white" : "black";
}
export const indexOutOfBound =(index: number): boolean =>{
    if (index<0 || index>63) return true;
    return false;
}

export const OutOfBound = (row: number ,col: number): boolean =>{
    if (row<0 || row>7) return true;
    if (col<0 || col>7) return true;
    return false;
}