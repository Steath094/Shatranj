import type { turn } from "../types/chess";

type PromotionPopupProps = {
  notice: {
    color: turn;
    square: number;
  };
  onClose: () => void;
};

const formatSquare = (position: number): string => {
  const file = String.fromCharCode(97 + (position % 8));
  const rank = 8 - Math.floor(position / 8);

  return `${file}${rank}`;
};

export function PromotionPopup({ notice, onClose }: PromotionPopupProps) {
  return (
    <div className="fixed inset-x-4 top-4 z-40 mx-auto max-w-sm rounded border border-amber-300/50 bg-[#302e2b] p-4 text-stone-100 shadow-2xl shadow-black/40">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-amber-300">Promotion</p>
          <h2 className="mt-1 text-lg font-semibold">
            {notice.color === "white" ? "White" : "Black"} pawn promoted
          </h2>
          <p className="mt-1 text-sm text-stone-300">
            The pawn on {formatSquare(notice.square)} became a queen.
          </p>
        </div>
        <button
          type="button"
          className="rounded border border-stone-600 px-3 py-1.5 text-sm font-semibold text-stone-100 transition hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>
  );
}
