import type { Move, Piece } from "../types/chess";
import { getLegalMoves } from "./moveGenerator";

export class Game {
    board : Piece[];
    currentTurn : "white" | "black";
    history: Move[] ;
    selectedSquare: number | null;
    legalMoves: number[];
    constructor() {
        this.board = [
          // Rank 8 (Black back rank)
          "r","n","b","q","k","b","n","r",
          // Rank 7 (Black pawns)
          "p","p","p","p","p","p","p","p",
          // Rank 6 (Empty)
          "","","","","","","","",
          // Rank 5 (Empty)
          "","","","","","","","",
          // Rank 4 (Empty)
          "","","","","","","","",
          // Rank 3 (Empty)
          "","","","","","","","",
          // Rank 2 (White pawns)
          "P","P","P","P","P","P","P","P",
          // Rank 1 (White back rank)
          "R","N","B","Q","K","B","N","R",
        ];
        this.currentTurn = "white";
        this.history = [];
        this.selectedSquare = null;
        this.legalMoves = [];
    }
    changeTurn = () => {
        if (this.currentTurn=="white") {
            this.currentTurn = "black";
        }else {
            this.currentTurn = "white";
        }
    }
    commitMove = (from: number, to: number) => {    
        if (!this.legalMoves.includes(to)) return;

        const movingPiece = this.board[from];
        const capturedPiece = this.board[to];

        this.board[to] = this.board[from];
        this.board[from] = "";

        this.changeTurn();
        this.history.push({
            from,
            to,
            piece: movingPiece,
            captured: capturedPiece,
        })
    }

    getLegalMoves = (position: number) : number[] =>{
        return getLegalMoves(this.board,position);
    }

    getPieceColor = (position : number): "white" | "black" | null =>{
        const piece = this.board[position];
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

    clickSquare = (position: number) => {

        const isNothingSelected = this.selectedSquare===null
        if (isNothingSelected) {
            if (this.board[position] === "") return;
            if (this.getPieceColor(position)!==this.currentTurn) return;
            this.selectedSquare = position;
            
            this.legalMoves = this.getLegalMoves(position);
            return;
        }else{
            if (this.getPieceColor(position)==this.currentTurn) {
                this.selectedSquare = position;
            
                this.legalMoves = this.getLegalMoves(position);
                return;
            }
            if (this.selectedSquare !== null) {
                this.commitMove(this.selectedSquare,position);
            }
    
            this.selectedSquare = null;
            this.legalMoves = [];
        }
    }
}