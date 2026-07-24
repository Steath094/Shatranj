import type { Move, turn } from "../types/chess";
import { CapturedPieces } from "./CapturedPieces";

type GameStatus = {
  title: string;
  detail: string;
  isGameOver: boolean;
};

type GameInfoPanelProps = {
  currentTurn: turn;
  history: Move[];
  status: GameStatus;
  lastMove: Move | null;
  isFlipped: boolean;
  isCheck: boolean;
  isInsufficientMaterial: boolean;
  isFiftyMoveRule: boolean;
  isThreefoldRepetition: boolean;
  onFlip: () => void;
  onRestart: () => void;
};

const formatSquare = (position: number): string => {
  const file = String.fromCharCode(97 + (position % 8));
  const rank = 8 - Math.floor(position / 8);

  return `${file}${rank}`;
};

const formatMove = (move: Move | null): string => {
  if (!move) return "None";

  return `${move.piece} ${formatSquare(move.from)}-${formatSquare(move.to)}`;
};

export function GameInfoPanel({
  currentTurn,
  history,
  status,
  lastMove,
  isFlipped,
  isCheck,
  isInsufficientMaterial,
  isFiftyMoveRule,
  isThreefoldRepetition,
  onFlip,
  onRestart,
}: GameInfoPanelProps) {
  return (
    <aside className="w-full rounded border border-stone-700 bg-[#302e2b] p-4 shadow-xl shadow-black/20 lg:w-80">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Status</p>
          <h2 className="mt-1 text-2xl font-semibold text-stone-50">{status.title}</h2>
          <p className="mt-1 text-sm text-stone-300">{status.detail}</p>
        </div>
        <span className={`rounded px-2.5 py-1 text-xs font-semibold ${currentTurn === "white" ? "bg-stone-100 text-stone-900" : "bg-stone-900 text-stone-100"}`}>
          {currentTurn === "white" ? "White" : "Black"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 text-sm">
        <div className="rounded border border-stone-700 bg-stone-900/40 p-3">
          <p className="text-stone-400">Last move</p>
          <p className="mt-1 font-semibold text-stone-100">{formatMove(lastMove)}</p>
        </div>
        <div className="rounded border border-stone-700 bg-stone-900/40 p-3">
          <p className="text-stone-400">Board</p>
          <p className="mt-1 font-semibold text-stone-100">{isFlipped ? "Black side" : "White side"}</p>
        </div>
      </div>

      <div className="mt-5 space-y-2 text-sm">
        <StatusRow label="Check" active={isCheck} />
        <StatusRow label="Insufficient material" active={isInsufficientMaterial} />
        <StatusRow label="Fifty-move rule" active={isFiftyMoveRule} />
        <StatusRow label="Threefold repetition" active={isThreefoldRepetition} />
      </div>

      <CapturedPieces history={history} />

      <div className="mt-5 grid grid-cols-2 gap-2">
        <button
          type="button"
          className="rounded bg-stone-100 px-3 py-2 text-sm font-semibold text-stone-950 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
          onClick={onRestart}
        >
          Restart
        </button>
        <button
          type="button"
          className="rounded border border-stone-600 px-3 py-2 text-sm font-semibold text-stone-100 transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
          onClick={onFlip}
        >
          Flip
        </button>
      </div>
    </aside>
  );
}

function StatusRow({ label, active }: { label: string; active: boolean }) {
  return (
    <div className="flex items-center justify-between rounded border border-stone-700 px-3 py-2">
      <span className="text-stone-300">{label}</span>
      <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-amber-300" : "bg-stone-600"}`} />
    </div>
  );
}
