import { useState } from 'react';
import './App.css'

const initialBoard = [
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

function App() {
  const [board, setBoard] = useState<string[]>(initialBoard);
  const [selectedSquare, setSelectedSquare] = useState<number | null>(null);

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
              <div key={index} className={`w-16 h-16 flex items-center justify-center ${selectedSquare === index ? "bg-[#A9A9A9]" : isBgWhite ? 'bg-[#EBECD0]' : 'bg-[#739552]'} ${piece && `hover:bg-[#A9A9A9] transition-colors duration-300 cursor-grab`} ${selectedSquare === index ? "bg-[#A9A9A9] border-2 border-amber-900" : ""}`  } onClick={()=> {
                if (piece) { 
                    setSelectedSquare(prev =>
                      prev === index ? null : index
                    );
                }else{
                  debugger;
                  board[index] = board[selectedSquare ?? index];
                  board[selectedSquare ?? index] = "";
                  setBoard([...board]);
                }
                console.log(`Clicked on square ${index} with piece ${piece}`);
              }}>
                {piece && <img src={pieceImages[piece]} alt={piece} className="w-12 h-12" />}
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

export default App
