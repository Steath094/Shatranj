import type { Piece } from "../types/chess";
import { getBishopMoves } from "./bishop";
import { getRookMoves } from "./rook";

export const getQueenMoves = (board: Piece[], index: number) : number[]  => {
    const bishopMoves = getBishopMoves(board,index);
    const rookMoves = getRookMoves(board,index);
    return [...bishopMoves,...rookMoves];
}