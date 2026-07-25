import type { CastlingRights, ClickResult, GameSnapshot, Move, Piece, PromotionPiece, turn } from "../types/chess";
import { GameRules } from "./GameRules";
import { getPseudoLegalMoves } from "./moveGenerator";

export class Game {
    board : Piece[];
    currentTurn : turn;
    history: Move[] ;
    selectedSquare: number | null;
    legalMoves: number[];
    castlingRights: CastlingRights;
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
        this.castlingRights = {
            white: {
                kingSide: true,
                queenSide: true,
            },
            black: {
                kingSide: true,
                queenSide: true,
            }
        }
    }
    getSnapshot = (options?: { clearSelection?: boolean }): GameSnapshot => {
        return {
            board: [...this.board],
            currentTurn: this.currentTurn,
            history: this.history.map((move) => ({ ...move })),
            selectedSquare: options?.clearSelection ? null : this.selectedSquare,
            legalMoves: options?.clearSelection ? [] : [...this.legalMoves],
            castlingRights: {
                white: {
                    kingSide: this.castlingRights.white.kingSide,
                    queenSide: this.castlingRights.white.queenSide,
                },
                black: {
                    kingSide: this.castlingRights.black.kingSide,
                    queenSide: this.castlingRights.black.queenSide,
                },
            },
        };
    }
    restoreSnapshot = (snapshot: GameSnapshot) => {
        this.board = [...snapshot.board];
        this.currentTurn = snapshot.currentTurn;
        this.history = snapshot.history.map((move) => ({ ...move }));
        this.selectedSquare = snapshot.selectedSquare;
        this.legalMoves = [...snapshot.legalMoves];
        this.castlingRights = {
            white: {
                kingSide: snapshot.castlingRights.white.kingSide,
                queenSide: snapshot.castlingRights.white.queenSide,
            },
            black: {
                kingSide: snapshot.castlingRights.black.kingSide,
                queenSide: snapshot.castlingRights.black.queenSide,
            },
        };
    }
    clearSelection = () => {
        this.selectedSquare = null;
        this.legalMoves = [];
    }
    selectSquare = (position: number) => {
        this.selectedSquare = position;
        this.legalMoves = this.getLegalMoves(position);
    }
    changeTurn = () => {
        if (this.currentTurn=="white") {
            this.currentTurn = "black";
        }else {
            this.currentTurn = "white";
        }
    }
    commitMove = (from: number, to: number, promotionPiece?: PromotionPiece): boolean => {    
        if (this.getPieceColor(from) !== this.currentTurn) return false;
        if (!this.getLegalMoves(from).includes(to)) return false;

        const movingPiece = this.board[from];
        const enPassantCapturePosition = GameRules.getEnPassantCapturePosition(this.board, from, to, this.currentTurn, this.history);
        const capturedPiece = enPassantCapturePosition === null ? this.board[to] : this.board[enPassantCapturePosition];
        const promotion = GameRules.isPromotionMove(movingPiece, to)
            ? this.getPromotionPiece(movingPiece, promotionPiece)
            : undefined;

        if (movingPiece === "K" && from === 60 && to === 62) {
            this.makeMove(from, to);
            this.makeMove(63, 61);
        }else if (movingPiece === "K" && from === 60 && to === 58) {
            this.makeMove(from, to);
            this.makeMove(56, 59);
        }else if (movingPiece === "k" && from === 4 && to === 6) {
            this.makeMove(from, to);
            this.makeMove(7, 5);
        }else if (movingPiece === "k" && from === 4 && to === 2) {
            this.makeMove(from, to);
            this.makeMove(0, 3);
        } else if (enPassantCapturePosition !== null) {
            this.makeMove(from, to);
            this.board[enPassantCapturePosition] = "";
        } else if (promotion !== undefined){
            this.makeMove(from, to);
            this.board[to] = promotion;
        } else this.makeMove(from,to);

        this.changeTurn();
        const move: Move = {
            from,
            to,
            piece: movingPiece,
            captured: capturedPiece,
        };

        if (promotion !== undefined) {
            move.promotion = promotion;
        }

        this.history.push(move)
        if (movingPiece=="K") {
            this.castlingRights.white.kingSide=false;
            this.castlingRights.white.queenSide=false;
        }
        if (movingPiece=="k") {
            this.castlingRights.black.kingSide=false;
            this.castlingRights.black.queenSide=false;
        }
        if ((movingPiece=="r" && from==0) || (capturedPiece=="r" && to==0)) {
            this.castlingRights.black.queenSide=false;
        }
        if ((movingPiece=="r" && from==7) || (capturedPiece=="r" && to==7)) {
            this.castlingRights.black.kingSide=false;
        }
        if ((movingPiece=="R" && from==56) || (capturedPiece=="R" && to==56)) {
            this.castlingRights.white.queenSide=false;
        }
        if ((movingPiece=="R" && from==63) || (capturedPiece=="R" && to==63)) {
            this.castlingRights.white.kingSide=false;
        }

        return true;
    }
    getPromotionPiece = (movingPiece: Piece, promotionPiece?: PromotionPiece): PromotionPiece => {
        const fallback = movingPiece === "P" ? "Q" : "q";

        if (promotionPiece === undefined) return fallback;

        const isWhitePromotion = movingPiece === "P" && ["Q", "R", "B", "N"].includes(promotionPiece);
        const isBlackPromotion = movingPiece === "p" && ["q", "r", "b", "n"].includes(promotionPiece);

        return isWhitePromotion || isBlackPromotion ? promotionPiece : fallback;
    }
    isPromotionMove = (from: number, to: number): boolean => {
        return GameRules.isPromotionMove(this.board[from], to);
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
        return GameRules.getLegalMoves(this.board, position, this.currentTurn, this.castlingRights, this.history);
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
        return GameRules.findKing(this.board, color);
    }

    isSquareAttacked = (position: number, color: turn): boolean => {
        return GameRules.isSquareAttacked(this.board, position, color);
    }
    isKingInCheck = (color: turn): boolean => {
        return GameRules.isKingInCheck(this.board, color);
    }
    hasLegalMoves = (color: turn): boolean => {
        return GameRules.hasLegalMoves(this.board, color, this.currentTurn, this.castlingRights, this.history);
    }
    checkmate = (color: turn): boolean => {
        return GameRules.checkmate(this.board, color, this.currentTurn, this.castlingRights, this.history);
    }
    staleMate = (color: turn): boolean => {
        return GameRules.staleMate(this.board, color, this.currentTurn, this.castlingRights, this.history);
    }
    insufficientMaterial = (): boolean => {
        return GameRules.insufficientMaterial(this.board);
    }
    fiftyMoveRule = (): boolean => {
        return GameRules.fiftyMoveRule(this.history);
    }
    threefoldRepetition = (): boolean => {
        return GameRules.threefoldRepetition(this.history);
    }

    // castling = (color: turn): boolean => {
    //     if (!(this.castlingRights[color].kingSide || this.castlingRights[color].queenSide)) {
    //         return false;
    //     }
    //     if (this.isKingInCheck(color)) return false;

    //     const opponent: turn = color=="white" ? "black" : "white";
    //     const index = {
    //         white: {
    //             kingSide: {
    //                 start: 60,
    //                 end: 63
    //             },
    //             queenSide: {
    //                 start: 56,
    //                 end: 60
    //             },
    //         },
    //         black: {
    //             kingSide: {
    //                 start: 4,
    //                 end: 7
    //             },
    //             queenSide: {
    //                 start: 0,
    //                 end: 4
    //             },
    //         }
    //     }
    //     let start = 0;
    //     let end = 0;
    //     if (this.castlingRights[color].kingSide) {
    //         start = index[color].kingSide.start;
    //         end = index[color].kingSide.end;
    //     }else if (this.castlingRights[color].queenSide) {
    //         start = index[color].queenSide.start;
    //         end = index[color].queenSide.end;
    //     }
        
    //     for (let index = start+1; index < end; index++) {
    //         if (!this.isEmpty(index)) {
    //             return false;
    //         }
    //         if (this.isSquareAttacked(index,opponent)) {
    //             return false;
    //         }
    //     }
    //     return true;
    // }

    canCastleKingSide(color: turn): boolean {
        return GameRules.canCastleKingSide(this.board, color, this.castlingRights);
    }

    canCastleQueenSide(color: turn): boolean {
        return GameRules.canCastleQueenSide(this.board, color, this.castlingRights);
    }

    getCastleMoves(color: turn): number[] {
        return GameRules.getCastleMoves(this.board, color, this.castlingRights);
    }
}
