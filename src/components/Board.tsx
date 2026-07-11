import { useState } from 'react';
import type { Piece } from '../types/chess';
import { getLegalMoves } from '../engine/moveGenerator';

const initialBoard: Piece[] = [
  // Rank 8 (Black back rank)
  "r", "n", "b", "q", "k", "b", "n", "r",
  // Rank 7 (Black pawns)
  "p", "p", "p", "p", "p", "p", "p", "p",
  // Rank 6 (Empty)
  "", "", "", "", "", "", "", "",
  // Rank 5 (Empty)
  "", "", "", "", "", "", "", "",
  // Rank 4 (Empty)
  "", "", "", "", "", "", "", "",
  // Rank 3 (Empty)
  "", "", "", "", "", "", "", "",
  // Rank 2 (White pawns)
  "P", "P", "P", "P", "P", "P", "P", "P",
  // Rank 1 (White back rank)
  "R", "N", "B", "Q", "K", "B", "N", "R"
];
const pieceImages: { [key: string]: string } = {
  "r": "./rook-b.svg",
  "n": "./knight-b.svg",
  "b": "./bishop-b.svg",
  "q": "./queen-b.svg",
  "k": "./king-b.svg",
  "p": "./pawn-b.svg",
  "R": "./rook-w.svg",
  "N": "./knight-w.svg",
  "B": "./bishop-w.svg",
  "Q": "./queen-w.svg",
  "K": "./king-w.svg",
  "P": "./pawn-w.svg"
};

function Board() {
  const [board, setBoard] = useState<Piece[]>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);
  const [legalMoves, setLegalMoves] = useState<number[]>([]);

  const handleSquareClick = (index: number) => {
    const piece = board[index];
    setLegalMoves([]);
    if (piece) { 
        setSelectedSquare(prev =>
          prev === index ? null : index
        );
        const moves = getLegalMoves(board, index);
        console.log(moves);
        setLegalMoves(moves);
    }else{
      if (selectedSquare === null) return;
      if (index === null) return;
      if (!legalMoves.includes(index)) return;
      const newBoard = [...board];
      newBoard[index] = newBoard[selectedSquare!];
      newBoard[selectedSquare!] = "";
      setBoard(newBoard);
    }
    console.log(`Clicked on square ${index} with piece ${piece}`);
  }
  
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#302E2B]">
        <h1 className="text-6xl font-bold mb-8 text-white">शतरंज</h1>
        <div className="grid grid-cols-8 gap-0 border-4 border-red-950">
          {board.map((piece, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;

            const isBgWhite = (row + col) % 2 === 0;

            return (
              <div key={index} className={`w-16 h-16 flex items-center justify-center ${selectedSquare === index ? "bg-[#A9A9A9]" : isBgWhite ? 'bg-[#EBECD0]' : 'bg-[#739552]'} ${piece && `hover:bg-[#A9A9A9] transition-colors duration-300 cursor-grab`} ${selectedSquare === index ? "bg-[#A9A9A9] border-2 border-amber-900" : ""}`  } onClick={() => handleSquareClick(index)}>
                {legalMoves.includes(index) && <div className="w-4 h-4 bg-[#A9A9A9] rounded-full"></div>}
                {(piece && pieceImages[piece]) && <img src={pieceImages[piece]} alt={piece} className="w-12 h-12" />}
                {col === 0 && <span className={`relative ${piece ? `-top-4 right-12` : `-top-5 -left-6`} text-xs font-bold text-gray-600`}>{8 - row}</span>}
                {row === 7 && <span className={`relative ${piece ? `-bottom-5 right-1` : `-bottom-5 -right-5`} text-xs font-bold text-gray-600`}>{String.fromCharCode(97 + col)}</span>}
              </div>
            )
          })}
       
        </div>
      </div>
    </>
  )
}

export default Board
