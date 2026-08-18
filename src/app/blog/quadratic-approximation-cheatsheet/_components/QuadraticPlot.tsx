'use client'

import { useState } from 'react'

import {
  type Viewport,
  buildPath,
  sx,
  sy,
  verticalRangeAround,
} from './plot-geometry'

const WIDTH = 640
const HEIGHT = 360
const PADDING = 30

const X_MIN = -1.5
const X_MAX = 2
const X_LO = -1
const X_HI = 1
const DX_LO = -0.8
const DX_HI = 0.9

export interface Labels {
  x0: React.ReactNode
  dx: React.ReactNode
  fx0: React.ReactNode
  linear: React.ReactNode
  approx: React.ReactNode
  exact: React.ReactNode
  linearError: React.ReactNode
  error: React.ReactNode
}

export function QuadraticPlot({ labels }: { labels: Labels }) {
  // Δx is stored separately from x_0, so dragging x_0 carries the target
  // point along and keeps Δx fixed, while dragging Δx moves only the target.
  let [x0, setX0] = useState(0.3)
  let [dx, setDx] = useState(0.6)

  let x = x0 + dx
  let f = Math.exp
  let fx0 = f(x0)
  let slope = f(x0)
  let tangent = (t: number) => fx0 + slope * (t - x0)
  // f is exp, so f''(x_0) == f(x_0); the curvature coefficient is f(x_0)/2.
  let parabola = (t: number) =>
    fx0 + slope * (t - x0) + (fx0 / 2) * (t - x0) * (t - x0)

  let exactAtTarget = f(x)
  let linearAtTarget = tangent(x)
  let approxAtTarget = parabola(x)
  let linearError = Math.abs(exactAtTarget - linearAtTarget)
  let error = Math.abs(exactAtTarget - approxAtTarget)

  let { yMin, yMax } = verticalRangeAround(f, X_MIN, X_MAX, f((X_MIN + X_MAX) / 2), 0.8)
  let v: Viewport = {
    xMin: X_MIN,
    xMax: X_MAX,
    yMin,
    yMax,
    width: WIDTH,
    height: HEIGHT,
    padding: PADDING,
  }

  let baseY = HEIGHT - PADDING + 12

  return (
    <div className="not-prose mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 sm:p-5 dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className="rounded-xl bg-white dark:bg-zinc-950/50">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT + 24}`}
          className="h-auto w-full"
          role="img"
          aria-label="A curve with its tangent line and its best-fitting parabola, marking the true value and both approximations one step away"
        >
          <rect
            x={Math.min(sx(v, x0), sx(v, x))}
            y={PADDING}
            width={Math.abs(sx(v, x) - sx(v, x0))}
            height={HEIGHT - 2 * PADDING}
            className="fill-teal-500/8"
          />

          <line
            x1={sx(v, x0)}
            x2={sx(v, x0)}
            y1={PADDING}
            y2={HEIGHT - PADDING}
            className="stroke-zinc-300 dark:stroke-zinc-600"
            strokeWidth="1"
          />
          <line
            x1={sx(v, x)}
            x2={sx(v, x)}
            y1={PADDING}
            y2={HEIGHT - PADDING}
            className="stroke-teal-500/50"
            strokeWidth="1"
            strokeDasharray="4 4"
          />

          <path
            d={buildPath(tangent, v)}
            fill="none"
            strokeWidth="2"
            className="stroke-teal-500/70"
          />
          <path
            d={buildPath(parabola, v)}
            fill="none"
            strokeWidth="2"
            className="stroke-violet-500"
          />
          <path
            d={buildPath(f, v)}
            fill="none"
            strokeWidth="2"
            className="stroke-zinc-400 dark:stroke-zinc-300"
          />

          {/* the error: true value vs approximated value at x */}
          <line
            x1={sx(v, x)}
            x2={sx(v, x)}
            y1={sy(v, exactAtTarget)}
            y2={sy(v, approxAtTarget)}
            className="stroke-rose-500"
            strokeWidth="2.5"
          />

          {/* (x_0, f(x_0)) — sits on the curve and the line at once */}
          <circle
            cx={sx(v, x0)}
            cy={sy(v, fx0)}
            r="5"
            className="fill-zinc-700 dark:fill-zinc-100"
          />
          {/* (x, f̃₁(x)) on the tangent line */}
          <circle
            cx={sx(v, x)}
            cy={sy(v, linearAtTarget)}
            r="4"
            className="fill-teal-500/70"
          />
          {/* (x, f̃₂(x)) on the parabola */}
          <circle
            cx={sx(v, x)}
            cy={sy(v, approxAtTarget)}
            r="5"
            className="fill-violet-500"
          />
          {/* (x, f(x)) on the curve */}
          <circle
            cx={sx(v, x)}
            cy={sy(v, exactAtTarget)}
            r="5"
            className="fill-zinc-400 dark:fill-zinc-300"
          />

          {/* Δx measured along the bottom */}
          <line
            x1={sx(v, x0)}
            x2={sx(v, x)}
            y1={baseY}
            y2={baseY}
            className="stroke-teal-500"
            strokeWidth="1.5"
          />
          {[x0, x].map((t) => (
            <line
              key={t}
              x1={sx(v, t)}
              x2={sx(v, t)}
              y1={baseY - 4}
              y2={baseY + 4}
              className="stroke-teal-500"
              strokeWidth="1.5"
            />
          ))}
          <text
            x={(sx(v, x0) + sx(v, x)) / 2}
            y={baseY - 8}
            textAnchor="middle"
            className="fill-teal-600 text-[12px] dark:fill-teal-400"
          >
            Δx
          </text>

          <text
            x={sx(v, x0)}
            y={HEIGHT - PADDING + 18}
            textAnchor="middle"
            className="fill-zinc-500 text-[12px] dark:fill-zinc-400"
          >
            x₀
          </text>
          <text
            x={sx(v, x)}
            y={HEIGHT - PADDING + 18}
            textAnchor="middle"
            className="fill-zinc-500 text-[12px] dark:fill-zinc-400"
          >
            x
          </text>
        </svg>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="flex items-baseline justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>{labels.x0}</span>
            <span className="tabular-nums text-zinc-800 dark:text-zinc-200">
              {x0.toFixed(2)}
            </span>
          </span>
          <input
            type="range"
            min={X_LO}
            max={X_HI}
            step={0.05}
            value={x0}
            onChange={(event) => setX0(Number(event.target.value))}
            className="mt-2 w-full accent-teal-500"
          />
        </label>

        <label className="block">
          <span className="flex items-baseline justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>{labels.dx}</span>
            <span className="tabular-nums text-zinc-800 dark:text-zinc-200">
              {dx.toFixed(2)}
            </span>
          </span>
          <input
            type="range"
            min={DX_LO}
            max={DX_HI}
            step={0.05}
            value={dx}
            onChange={(event) => setDx(Number(event.target.value))}
            className="mt-2 w-full accent-teal-500"
          />
        </label>
      </div>

      <dl className="mt-4 space-y-2 border-t border-zinc-200 pt-4 text-sm dark:border-zinc-800">
        <div className="flex items-baseline justify-between gap-4">
          <dt className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-700 dark:bg-zinc-100" />
            {labels.fx0}
          </dt>
          <dd className="tabular-nums text-zinc-800 dark:text-zinc-200">
            {fx0.toFixed(6)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <dt className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-full bg-teal-500/70" />
            {labels.linear}
            <span className="text-zinc-400 dark:text-zinc-500">
              on the tangent line
            </span>
          </dt>
          <dd className="tabular-nums text-teal-600 dark:text-teal-400">
            {linearAtTarget.toFixed(6)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <dt className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-full bg-violet-500" />
            {labels.approx}
            <span className="text-zinc-400 dark:text-zinc-500">
              on the parabola
            </span>
          </dt>
          <dd className="tabular-nums text-violet-600 dark:text-violet-400">
            {approxAtTarget.toFixed(6)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <dt className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
            <span className="h-2.5 w-2.5 rounded-full bg-zinc-400 dark:bg-zinc-300" />
            {labels.exact}
            <span className="text-zinc-400 dark:text-zinc-500">on the curve</span>
          </dt>
          <dd className="tabular-nums text-zinc-800 dark:text-zinc-200">
            {exactAtTarget.toFixed(6)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4 border-t border-zinc-200 pt-2 dark:border-zinc-800">
          <dt className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
            {labels.linearError}
          </dt>
          <dd className="tabular-nums text-zinc-500 dark:text-zinc-400">
            {linearError.toFixed(6)}
          </dd>
        </div>

        <div className="flex items-baseline justify-between gap-4">
          <dt className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
            {labels.error}
          </dt>
          <dd className="tabular-nums text-rose-600 dark:text-rose-400">
            {error.toFixed(6)}
          </dd>
        </div>
      </dl>
    </div>
  )
}
