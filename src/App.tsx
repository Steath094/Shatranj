import { useEffect, useState } from 'react';
import './App.css'

const board = [
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
const map: { [key: string]: string } = {
  "r": "♜",
  "n": "♞",
  "b": "♝",
  "q": "♛",
  "k": "♚",
  "p": "♟",
  "R": "♖",
  "N": "♘",
  "B": "♗",
  "Q": "♕",
  "K": "♔",
  "P": "♙"
};

function App() {
  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen bg-[#302E2B]">
        <h1 className="text-4xl font-bold mb-8 text-white">Chess Board</h1>
        <div className="grid grid-cols-8 gap-0 border-4 border-red-950">
          {board.map((piece, index) => {
            const row = Math.floor(index / 8);
            const col = index % 8;

            const isBgWhite = (row + col) % 2 === 0;
            return (
              <div key={index} className={`w-16 h-16 flex items-center justify-center ${isBgWhite ? 'bg-[#EBECD0]' : 'bg-[#739552]'}`}>
                {piece && <span className="text-2xl">{map[piece]}</span>}
              </div>
            )
          })}
       
        </div>
      </div>
    </>
  )
}

export default App
