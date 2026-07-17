import type { ClickResult, Move, Piece, turn } from "../types/chess";
import { getPseudoLegalMoves } from "./moveGenerator";
import { getPawnAttackSquares } from "./pawn";

export class Game {
    board : Piece[];
    currentTurn : turn;
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
    makeMove = (from: number, to: number) => {
        this.board[to] = this.board[from];
        this.board[from] = "";
    }
    undoMove = (from: number, to: number, movingPiece: Piece, capturedPiece: Piece) => {
        this.board[from] = movingPiece;
        this.board[to] = capturedPiece;
    }
    getPseudoLegalMoves = (position: number) : number[] =>{
        return getPseudoLegalMoves(this.board,position);
    }
    getLegalMoves = (position: number) : number[] =>{
        const pseudoMoves = this.getPseudoLegalMoves(position);
        let legalMoves: number[]= [];
        for (let index = 0; index < pseudoMoves.length; index++) {
            const move = pseudoMoves[index];
            const movingPiece = this.board[position];
            const capturedPiece = this.board[move];

            this.makeMove(position,move);
            if (!this.isKingInCheck(this.currentTurn)) {
                legalMoves.push(move);
            }

            this.undoMove(position, move, movingPiece, capturedPiece);

        }
        return legalMoves;
    }
    getPieceColor = (position : number): turn | null =>{
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

    isEmpty = (position : number): boolean => {
        return this.board[position] === "";
    }

    handleSquareSelection = (position: number): ClickResult => {

        const isNothingSelected = this.selectedSquare===null
        if (isNothingSelected) {
            if (this.board[position] === "") return {
                boardChanged: false,
                selectionChanged: false,
            };
            if (this.getPieceColor(position)!==this.currentTurn) return {
                boardChanged: false,
                selectionChanged: false,
            };;
            this.selectedSquare = position;
            
            this.legalMoves = this.getLegalMoves(position);
            return {
                boardChanged: false,
                selectionChanged: true,
            };
        }else{
            if (this.getPieceColor(position)==this.currentTurn) {
                this.selectedSquare = position;
            
                this.legalMoves = this.getLegalMoves(position);
                return {
                    boardChanged: false,
                    selectionChanged: true,
                };
            }
            if (this.selectedSquare !== null) {
                this.commitMove(this.selectedSquare,position);
            }
    
            this.selectedSquare = null;
            this.legalMoves = [];
            return {
                boardChanged: true,
                selectionChanged: true,
            };
        }
    }

    findKing = (color: turn): number => {
        const piece = color=="white" ? "K" : "k";
        for (let index = 0; index < this.board.length; index++) {
            if (this.board[index]==piece) {
                return index;
            }
        }
        return -1;
    }

    isSquareAttacked = (position: number, color: turn): boolean => {
        for (let index = 0; index < this.board.length; index++) {
            if (this.getPieceColor(index)==color) {
                let legalMoves;
                if (this.board[index]=="p" || this.board[index]=="P") {
                    legalMoves = getPawnAttackSquares(this.board,index);
                }else{
                    legalMoves = this.getPseudoLegalMoves(index);
                }
                if (legalMoves.includes(position)) return true;
            }
        }
        return false;
    }
    isKingInCheck = (color: turn): boolean => {
        const position = this.findKing(color);
        const opponent: turn = color=="white" ? "black" : "white";
        return this.isSquareAttacked(position,opponent);
    }
    
}