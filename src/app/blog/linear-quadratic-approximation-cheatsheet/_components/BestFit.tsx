'use client'

import { useState } from 'react'

import { Plot } from './Plot'

const TARGET_SLOPE = 1 // (e^x)' at 0
const TARGET_C = 0.5 // (e^x)''(0) / 2

/**
 * Lets the reader pick the wrong coefficient on purpose. The point is that only
 * one value hugs the curve, which is what "best" in "best line/parabola" means.
 */
export function BestFit({ order }: { order: 'linear' | 'quadratic' }) {
  let isLinear = order === 'linear'
  let [b, setB] = useState(0.4)
  let [c, setC] = useState(0)

  let exact = Math.exp
  let candidate = isLinear
    ? (x: number) => 1 + b * x
    : (x: number) => 1 + x + c * x * x

  let target = isLinear ? TARGET_SLOPE : TARGET_C
  let chosen = isLinear ? b : c
  let isBest = Math.abs(chosen - target) < 1e-9

  // Mean absolute gap over a small window — a stand-in for "how well it hugs".
  let gap = 0
  let steps = 200
  for (let i = 0; i <= steps; i++) {
    let x = -1 + (2 * i) / steps
    gap += Math.abs(exact(x) - candidate(x))
  }
  gap /= steps + 1

  return (
    <div className="not-prose mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {isLinear ? (
          <>
            Fixing the height at <span className="font-mono">f(0) = 1</span>,
            slide the slope <span className="font-mono">b</span> and watch the
            gap. Only one value hugs the curve.
          </>
        ) : (
          <>
            Fixing height and slope, slide the curvature coefficient{' '}
            <span className="font-mono">c</span>. Again, only one value fits.
          </>
        )}
      </p>

      <div className="mt-5 rounded-xl bg-white p-3 dark:bg-zinc-950/50">
        <Plot
          exact={exact}
          linear={isLinear ? candidate : undefined}
          quadratic={isLinear ? undefined : candidate}
          window={1.5}
          showLinear={isLinear}
          showQuadratic={!isLinear}
          label="e^x"
        />
      </div>

      <label className="mt-5 block">
        <span className="flex items-baseline justify-between text-sm text-zinc-600 dark:text-zinc-400">
          <span className="font-mono">
            {isLinear ? '1 + b·x' : '1 + x + c·x²'}
          </span>
          <span className="font-mono text-zinc-800 dark:text-zinc-200">
            {isLinear ? 'b' : 'c'} = {chosen.toFixed(2)}
          </span>
        </span>
        <input
          type="range"
          min={isLinear ? -0.5 : -1}
          max={isLinear ? 2.5 : 1.5}
          step={0.05}
          value={chosen}
          onChange={(event) =>
            isLinear
              ? setB(Number(event.target.value))
              : setC(Number(event.target.value))
          }
          className="mt-2 w-full accent-teal-500"
        />
      </label>

      <div className="mt-4 flex flex-wrap items-baseline justify-between gap-3 border-t border-zinc-200 pt-4 dark:border-zinc-800">
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          average gap over [−1, 1]
        </span>
        <span className="font-mono text-sm text-zinc-800 dark:text-zinc-200">
          {gap.toFixed(4)}
        </span>
      </div>

      <button
        type="button"
        onClick={() => (isLinear ? setB(TARGET_SLOPE) : setC(TARGET_C))}
        className="mt-4 rounded-full bg-teal-500 px-4 py-1.5 text-sm text-white transition hover:bg-teal-400"
      >
        {isBest
          ? `That's it — ${isLinear ? "f′(0) = 1" : 'f″(0)/2 = 0.5'}`
          : `Snap to ${isLinear ? "f′(0)" : 'f″(0)/2'}`}
      </button>
    </div>
  )
}
