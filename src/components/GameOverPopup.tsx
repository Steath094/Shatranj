type GameStatus = {
  title: string;
  detail: string;
  isGameOver: boolean;
};

type GameOverPopupProps = {
  status: GameStatus;
  onRestart: () => void;
};

export function GameOverPopup({ status, onRestart }: GameOverPopupProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4">
      <div className="w-full max-w-sm rounded border border-stone-600 bg-[#302e2b] p-5 text-center text-stone-100 shadow-2xl shadow-black/50">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Game over</p>
        <h2 className="mt-2 text-3xl font-semibold">{status.title}</h2>
        <p className="mt-2 text-sm text-stone-300">{status.detail}</p>
        <button
          type="button"
          className="mt-5 rounded bg-stone-100 px-4 py-2 text-sm font-semibold text-stone-950 transition hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
          onClick={onRestart}
        >
          Restart game
        </button>
      </div>
    </div>
  );
}
