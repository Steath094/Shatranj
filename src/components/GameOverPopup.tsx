type GameStatus = {
  title: string;
  detail: string;
  isGameOver: boolean;
};

type GameOverPopupProps = {
  status: GameStatus;
  onClose: () => void;
  onRestart: () => void;
};

export function GameOverPopup({ status, onClose, onRestart }: GameOverPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="relative w-full max-w-sm rounded border border-stone-600 bg-[#302e2b] p-5 text-center text-stone-100 shadow-2xl shadow-black/50">
        <button
          type="button"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded border border-stone-600 text-sm font-semibold text-stone-200 transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
          onClick={onClose}
          aria-label="Close game over popup"
        >
          X
        </button>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Game over</p>
        <h2 className="mt-2 text-3xl font-semibold">{status.title}</h2>
        <p className="mt-2 text-sm text-stone-300">{status.detail}</p>
        <div className="mt-5 grid grid-cols-2 gap-2">
          <button
            type="button"
            className="rounded border border-stone-600 px-4 py-2 text-sm font-semibold text-stone-100 transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
            onClick={onRestart}
          >
            Restart
          </button>
          <button
            type="button"
            className="rounded bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
            onClick={onClose}
          >
            Review position
          </button>
        </div>
      </div>
    </div>
  );
}
