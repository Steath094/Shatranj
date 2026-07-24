import type { Move, Piece } from "../types/chess";
import { PieceImage } from "./PieceImage";

type CapturedPiece = Exclude<Piece, "">;

type CapturedPiecesProps = {
  history: Move[];
};

const isCapturedPiece = (piece: Piece): piece is CapturedPiece => piece !== "";

const isWhitePiece = (piece: CapturedPiece): boolean => piece === piece.toUpperCase();

export function CapturedPieces({ history }: CapturedPiecesProps) {
  const capturedPieces = history
    .map((move) => move.captured)
    .filter(isCapturedPiece);

  const capturedByWhite = capturedPieces.filter((piece) => !isWhitePiece(piece));
  const capturedByBlack = capturedPieces.filter(isWhitePiece);

  return (
    <div className="mt-5">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Captured</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
        <CapturedGroup
          label="White"
          pieces={capturedByWhite}
        />
        <CapturedGroup
          label="Black"
          pieces={capturedByBlack}
        />
      </div>
    </div>
  );
}

function CapturedGroup({ label, pieces }: { label: string; pieces: CapturedPiece[] }) {
  return (
    <div className="rounded border border-stone-700 bg-stone-900/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-stone-200">{label} captured</span>
        <span className="rounded bg-stone-800 px-2 py-0.5 text-xs text-stone-300">{pieces.length}</span>
      </div>

      <div className="mt-2 flex min-h-8 flex-wrap items-center gap-1.5">
        {pieces.length === 0 ? (
          <span className="text-sm text-stone-500">None</span>
        ) : (
          pieces.map((piece, index) => (
            <span
              key={`${piece}-${index}`}
              className="flex h-7 w-7 items-center justify-center rounded bg-stone-800"
            >
              <PieceImage
                piece={piece}
                isFlipped={false}
              />
            </span>
          ))
        )}
      </div>
    </div>
  );
}
