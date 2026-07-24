import { useState } from "react";
import { Game } from "../engine/Game";
import type { ClickResult, Move, turn } from "../types/chess";
import { ChessBoard } from "./ChessBoard";
import { GameInfoPanel } from "./GameInfoPanel";
import { GameOverPopup } from "./GameOverPopup";
import { PromotionPopup } from "./PromotionPopup";

type GameStatus = {
  title: string;
  detail: string;
  isGameOver: boolean;
};

type PromotionNotice = {
  color: turn;
  square: number;
} | null;

const getGameStatus = (game: Game): GameStatus => {
  const color = game.currentTurn;

  if (game.checkmate(color)) {
    const winner = color === "white" ? "Black" : "White";
    return {
      title: "Checkmate",
      detail: `${winner} wins.`,
      isGameOver: true,
    };
  }

  if (game.staleMate(color)) {
    return {
      title: "Stalemate",
      detail: "The side to move has no legal moves.",
      isGameOver: true,
    };
  }

  if (game.insufficientMaterial()) {
    return {
      title: "Draw",
      detail: "Insufficient material.",
      isGameOver: true,
    };
  }

  if (game.fiftyMoveRule()) {
    return {
      title: "Draw",
      detail: "Fifty-move rule.",
      isGameOver: true,
    };
  }

  if (game.threefoldRepetition()) {
    return {
      title: "Draw",
      detail: "Threefold repetition.",
      isGameOver: true,
    };
  }

  if (game.isKingInCheck(color)) {
    return {
      title: "Check",
      detail: `${color === "white" ? "White" : "Black"} king is in check.`,
      isGameOver: false,
    };
  }

  return {
    title: "Playing",
    detail: `${color === "white" ? "White" : "Black"} to move.`,
    isGameOver: false,
  };
};

const getPromotionNotice = (game: Game, previousHistoryLength: number): PromotionNotice => {
  if (game.history.length === previousHistoryLength) return null;

  const lastMove = game.history[game.history.length - 1];
  if (!lastMove) return null;

  const promotedPiece = game.board[lastMove.to];

  if (lastMove.piece === "P" && promotedPiece === "Q") {
    return {
      color: "white",
      square: lastMove.to,
    };
  }

  if (lastMove.piece === "p" && promotedPiece === "q") {
    return {
      color: "black",
      square: lastMove.to,
    };
  }

  return null;
};

function Board() {
  const [game, setGame] = useState(() => new Game());
  const [, setRevision] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [promotionNotice, setPromotionNotice] = useState<PromotionNotice>(null);

  const lastMove: Move | null = game.history[game.history.length - 1] ?? null;
  const gameStatus = getGameStatus(game);
  const checkedKingSquare = game.isKingInCheck(game.currentTurn) ? game.findKing(game.currentTurn) : null;

  const refresh = () => {
    setRevision((revision) => revision + 1);
  };

  const handleSquareClick = (position: number) => {
    if (gameStatus.isGameOver) return;

    const previousHistoryLength = game.history.length;
    const result: ClickResult = game.handleSquareSelection(position);

    if (result.boardChanged || result.selectionChanged) {
      setPromotionNotice(getPromotionNotice(game, previousHistoryLength));
      refresh();
    }
  };

  const restartGame = () => {
    setGame(new Game());
    setPromotionNotice(null);
  };

  return (
    <main className="min-h-screen bg-[#262421] px-4 py-4 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-center">
        <section className="flex min-w-0 flex-1 flex-col items-center gap-3">
          <div className="flex w-full max-w-[min(92vw,76vh,720px)] items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Shatranj</p>
              <h1 className="text-2xl font-semibold text-stone-50 sm:text-3xl">Chess Engine</h1>
            </div>
            <div className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-sm text-stone-200">
              {game.currentTurn === "white" ? "White" : "Black"} to move
            </div>
          </div>

          <ChessBoard
            board={game.board}
            selectedSquare={game.selectedSquare}
            legalMoves={game.legalMoves}
            lastMove={lastMove}
            checkedKingSquare={checkedKingSquare}
            isFlipped={isFlipped}
            onSquareClick={handleSquareClick}
          />
        </section>

        <GameInfoPanel
          currentTurn={game.currentTurn}
          history={game.history}
          status={gameStatus}
          lastMove={lastMove}
          isFlipped={isFlipped}
          isCheck={checkedKingSquare !== null}
          isInsufficientMaterial={game.insufficientMaterial()}
          isFiftyMoveRule={game.fiftyMoveRule()}
          isThreefoldRepetition={game.threefoldRepetition()}
          onFlip={() => setIsFlipped((value) => !value)}
          onRestart={restartGame}
        />
      </div>

      {promotionNotice && (
        <PromotionPopup
          notice={promotionNotice}
          onClose={() => setPromotionNotice(null)}
        />
      )}

      {gameStatus.isGameOver && (
        <GameOverPopup
          status={gameStatus}
          onRestart={restartGame}
        />
      )}
    </main>
  );
}

export default Board;
