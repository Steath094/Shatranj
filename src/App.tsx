import './App.css'
import { useState } from 'react'
import Board from './components/Board'
import type { GameMode } from './types/chess'

const modeOptions: Array<{ mode: GameMode; label: string; detail: string }> = [
  { mode: 'bot-easy', label: 'Play with Bot', detail: 'Easy: Minimax' },
  { mode: 'bot-medium', label: 'Play with Bot', detail: 'Medium: Alpha-Beta' },
  { mode: 'friend', label: 'Play with Friends', detail: 'Human vs Human' },
]

function App() {
  const [gameMode, setGameMode] = useState<GameMode | null>(null)

  if (!gameMode) {
    return (
      <main className="min-h-screen bg-[#262421] px-4 py-4 text-stone-100 sm:px-6 lg:px-8">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-2xl items-center justify-center">
          <div className="w-full rounded-xl border border-stone-700 bg-[#302e2b] p-8 shadow-xl shadow-black/20">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-amber-300">Shatranj</p>
            <h1 className="mt-4 text-center text-3xl font-semibold text-stone-50">Choose Game Mode</h1>

            <div className="mt-8 space-y-4">
              {modeOptions.map(({ mode, label, detail }) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setGameMode(mode)}
                  className="w-full rounded border border-stone-600 bg-stone-800 px-5 py-4 text-left transition hover:border-amber-300 hover:bg-stone-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-300"
                >
                  <span className="block text-lg font-semibold text-stone-50">{label}</span>
                  <span className="mt-1 block text-sm text-stone-300">{detail}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>
    )
  }

  return <Board gameMode={gameMode} onReturnToMenu={() => setGameMode(null)} />
}

export default App
