import { useEffect, useRef, useState } from "react";
import { AI_CONFIG, findBestMove } from "../engine/AI/findBestMove";
import { Game } from "../engine/Game";
import type { GameMode, GameSnapshot, Move, PromotionPiece, turn } from "../types/chess";
import { ChessBoard } from "./ChessBoard";
import { GameInfoPanel } from "./GameInfoPanel";
import { GameOverPopup } from "./GameOverPopup";
import { PromotionPopup } from "./PromotionPopup";

type GameStatus = {
  title: string;
  detail: string;
  isGameOver: boolean;
};

type PendingPromotion = {
  color: turn;
  from: number;
  to: number;
  choices: PromotionPiece[];
  beforeMove: GameSnapshot;
} | null;

type RedoEntry = {
  snapshot: GameSnapshot;
  undoSnapshots: GameSnapshot[];
};

const promotionChoices: Record<turn, PromotionPiece[]> = {
  white: ["Q", "R", "B", "N"],
  black: ["q", "r", "b", "n"],
};

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

type BoardProps = {
  gameMode: GameMode;
  onReturnToMenu: () => void;
};

function Board({ gameMode, onReturnToMenu }: BoardProps) {
  const [game, setGame] = useState(() => new Game());
  const [revision, setRevision] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [pendingPromotion, setPendingPromotion] = useState<PendingPromotion>(null);
  const [undoStack, setUndoStack] = useState<GameSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<RedoEntry[]>([]);
  const [dismissedCheckmateAt, setDismissedCheckmateAt] = useState<number | null>(null);
  const [botThinking, setBotThinking] = useState(false);
  const botRequestId = useRef(0);
  const botThinkingRef = useRef(false);

  const lastMove: Move | null = game.history[game.history.length - 1] ?? null;
  const gameStatus = getGameStatus(game);
  const isBotTurn = gameMode === "bot-easy" && game.currentTurn === "black" && !gameStatus.isGameOver;
  const checkedKingSquare = game.isKingInCheck(game.currentTurn) ? game.findKing(game.currentTurn) : null;
  const showCheckmatePopup = gameStatus.title === "Checkmate" && dismissedCheckmateAt !== game.history.length;
  const controlsLocked = botThinking || isBotTurn;
  const effectiveStatus = botThinking && isBotTurn
    ? {
        title: "Bot is thinking...",
        detail: "Black is calculating a move.",
        isGameOver: false,
      }
    : gameStatus;

  const refresh = () => {
    setRevision((revision) => revision + 1);
  };

  const selectSquare = (position: number) => {
    game.selectSquare(position);
    refresh();
  };

  const commitMove = (
    from: number,
    to: number,
    promotionPiece?: PromotionPiece,
    beforeMove = game.getSnapshot({ clearSelection: true }),
  ) => {
    const didCommit = game.commitMove(from, to, promotionPiece);

    if (!didCommit) return;

    game.clearSelection();
    setUndoStack((history) => [...history, beforeMove]);
    setRedoStack([]);
    setPendingPromotion(null);
    setDismissedCheckmateAt(null);
    refresh();
  };

  const handleSquareClick = (position: number) => {
    if (controlsLocked || pendingPromotion || gameStatus.isGameOver || (gameMode === "bot-easy" && game.currentTurn === "black")) return;

    if (game.selectedSquare === null) {
      if (game.board[position] === "") return;
      if (game.getPieceColor(position) !== game.currentTurn) return;

      selectSquare(position);
      return;
    }

    if (game.getPieceColor(position) === game.currentTurn) {
      selectSquare(position);
      return;
    }

    if (!game.legalMoves.includes(position)) {
      game.clearSelection();
      refresh();
      return;
    }

    const from = game.selectedSquare;
    const beforeMove = game.getSnapshot({ clearSelection: true });

    if (game.isPromotionMove(from, position)) {
      const color = game.currentTurn;

      game.clearSelection();
      setPendingPromotion({
        color,
        from,
        to: position,
        choices: promotionChoices[color],
        beforeMove,
      });
      refresh();
      return;
    }

    commitMove(from, position, undefined, beforeMove);
  };

  const completePromotion = (piece: PromotionPiece) => {
    if (!pendingPromotion) return;

    commitMove(pendingPromotion.from, pendingPromotion.to, piece, pendingPromotion.beforeMove);
  };

  const cancelPromotion = () => {
    setPendingPromotion(null);
    game.clearSelection();
    refresh();
  };

  const undoMove = () => {
    if (controlsLocked) return;
    if (undoStack.length === 0) return;

    const current = game.getSnapshot({ clearSelection: true });
    const undoCount = gameMode === "bot-easy" && game.currentTurn === "white" && undoStack.length >= 2
      ? 2
      : 1;
    const previous = undoStack[undoStack.length - undoCount];
    const retainedUndoStack = undoStack.slice(0, -undoCount);
    const redoUndoSnapshots = undoStack.slice(-undoCount);

    game.restoreSnapshot(previous);
    setPendingPromotion(null);
    setUndoStack(retainedUndoStack);
    setRedoStack([...redoStack, { snapshot: current, undoSnapshots: redoUndoSnapshots }]);
    refresh();
  };

  const redoMove = () => {
    if (controlsLocked) return;
    if (redoStack.length === 0) return;

    const next = redoStack[redoStack.length - 1];

    game.restoreSnapshot(next.snapshot);
    setPendingPromotion(null);
    setUndoStack([...undoStack, ...next.undoSnapshots]);
    setRedoStack(redoStack.slice(0, -1));
    refresh();
  };

  const restartGame = () => {
    botRequestId.current += 1;
    botThinkingRef.current = false;
    setBotThinking(false);
    setGame(new Game());
    setPendingPromotion(null);
    setUndoStack([]);
    setRedoStack([]);
    setDismissedCheckmateAt(null);
  };

  useEffect(() => {
    if (gameMode !== "bot-easy" || botThinkingRef.current || pendingPromotion) return;
    if (game.currentTurn !== "black" || gameStatus.isGameOver) return;

    const requestId = ++botRequestId.current;
    botThinkingRef.current = true;

    window.setTimeout(() => {
      if (requestId === botRequestId.current) {
        setBotThinking(true);
      }
    }, 0);

    window.setTimeout(() => {
      if (requestId !== botRequestId.current) return;

      const position = game.getPosition();
      const status = getGameStatus(game);

      if (position.currentTurn !== "black" || status.isGameOver) {
        botThinkingRef.current = false;
        setBotThinking(false);
        return;
      }

      const move = findBestMove(position, AI_CONFIG.easy.depth);

      if (!move) {
        botThinkingRef.current = false;
        setBotThinking(false);
        return;
      }

      const beforeMove = game.getSnapshot({ clearSelection: true });
      const didApply = game.applyMove(move);

      if (!didApply) {
        botThinkingRef.current = false;
        setBotThinking(false);
        return;
      }

      game.clearSelection();
      setUndoStack((history) => [...history, beforeMove]);
      setRedoStack([]);
      setDismissedCheckmateAt(null);
      botThinkingRef.current = false;
      setBotThinking(false);
      refresh();
    }, 550);
  }, [game, gameMode, gameStatus.isGameOver, pendingPromotion, revision]);

  return (
    <main className="min-h-screen bg-[#262421] px-4 py-4 text-stone-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-center">
        <section className="flex min-w-0 flex-1 flex-col items-center gap-3">
          <div className="flex w-full max-w-[min(92vw,76vh,720px)] items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Shatranj</p>
              <h1 className="text-2xl font-semibold text-stone-50 sm:text-3xl">Chess Engine</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-stone-200 transition hover:border-amber-300 hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                onClick={onReturnToMenu}
              >
                Mode Select
              </button>
              <div className="rounded border border-stone-600 bg-stone-800 px-3 py-2 text-sm text-stone-200">
                {effectiveStatus.isGameOver ? effectiveStatus.title : `${game.currentTurn === "white" ? "White" : "Black"} to move`}
              </div>
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
          status={effectiveStatus}
          lastMove={lastMove}
          isFlipped={isFlipped}
          isCheck={checkedKingSquare !== null}
          isInsufficientMaterial={game.insufficientMaterial()}
          isFiftyMoveRule={game.fiftyMoveRule()}
          isThreefoldRepetition={game.threefoldRepetition()}
          canUndo={!controlsLocked && undoStack.length > 0}
          canRedo={!controlsLocked && redoStack.length > 0}
          onFlip={() => setIsFlipped((value) => !value)}
          onRestart={restartGame}
          onUndo={undoMove}
          onRedo={redoMove}
        />
      </div>

      {pendingPromotion && (
        <PromotionPopup
          color={pendingPromotion.color}
          square={pendingPromotion.to}
          choices={pendingPromotion.choices}
          onPromote={completePromotion}
          onCancel={cancelPromotion}
        />
      )}

      {showCheckmatePopup && (
        <GameOverPopup
          status={effectiveStatus}
          onClose={() => setDismissedCheckmateAt(game.history.length)}
          onRestart={restartGame}
        />
      )}
    </main>
  );
}

export default Board;
