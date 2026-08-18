'use client'

import { type ApproxFunction } from './functions'

const WIDTH = 640
const HEIGHT = 360
const PADDING = 8

interface Curve {
  d: string
  className: string
}

/**
 * Samples f across the window, splitting the path wherever the curve leaves the
 * visible band or crosses a pole, so asymptotes don't draw as vertical streaks.
 */
function buildPath(
  f: (x: number) => number,
  window: number,
  yMin: number,
  yMax: number,
  poles: number[],
) {
  let steps = 480
  let segments: string[] = []
  let current: string[] = []

  let toSvgX = (x: number) =>
    PADDING + ((x + window) / (2 * window)) * (WIDTH - 2 * PADDING)
  let toSvgY = (y: number) =>
    HEIGHT - PADDING - ((y - yMin) / (yMax - yMin)) * (HEIGHT - 2 * PADDING)

  let flush = () => {
    if (current.length > 1) {
      segments.push(current.join(' '))
    }
    current = []
  }

  let previousX: number | null = null

  for (let i = 0; i <= steps; i++) {
    let x = -window + (2 * window * i) / steps

    // Break the path when we step over a pole.
    if (
      previousX !== null &&
      poles.some((p) => (previousX! < p && x >= p) || (previousX! > p && x <= p))
    ) {
      flush()
    }
    previousX = x

    let y = f(x)

    if (!Number.isFinite(y) || y < yMin || y > yMax) {
      flush()
      continue
    }

    let command = current.length === 0 ? 'M' : 'L'
    current.push(`${command}${toSvgX(x).toFixed(2)} ${toSvgY(y).toFixed(2)}`)
  }

  flush()

  return segments.join(' ')
}

export function Plot({
  fn,
  window: windowSize,
  at,
  showLinear,
  showQuadratic,
}: {
  fn: ApproxFunction
  window: number
  at: number
  showLinear: boolean
  showQuadratic: boolean
}) {
  // Scale the vertical band to whatever the exact curve does nearby, with a
  // floor so flat functions (cos near 0) don't get an absurd zoom.
  let samples: number[] = []
  for (let i = 0; i <= 200; i++) {
    let x = -windowSize + (2 * windowSize * i) / 200
    let y = fn.exact(x)
    if (Number.isFinite(y) && Math.abs(y) < 50) {
      samples.push(y)
    }
  }

  let dataMin = samples.length ? Math.min(...samples) : -1
  let dataMax = samples.length ? Math.max(...samples) : 1
  let mid = (dataMin + dataMax) / 2
  let half = Math.max((dataMax - dataMin) / 2, windowSize * 0.6, 0.35)
  let yMin = mid - half * 1.25
  let yMax = mid + half * 1.25

  let toSvgX = (x: number) =>
    PADDING + ((x + windowSize) / (2 * windowSize)) * (WIDTH - 2 * PADDING)
  let toSvgY = (y: number) =>
    HEIGHT - PADDING - ((y - yMin) / (yMax - yMin)) * (HEIGHT - 2 * PADDING)

  let poles = fn.poles ?? []

  let curves: Curve[] = [
    {
      d: buildPath(fn.exact, windowSize, yMin, yMax, poles),
      className: 'stroke-zinc-800 dark:stroke-zinc-100',
    },
  ]

  if (showQuadratic) {
    curves.push({
      d: buildPath(fn.quadratic, windowSize, yMin, yMax, []),
      className: 'stroke-sky-500',
    })
  }

  if (showLinear) {
    curves.push({
      d: buildPath(fn.linear, windowSize, yMin, yMax, []),
      className: 'stroke-teal-500',
    })
  }

  let exactAt = fn.exact(at)
  let markers = [
    { y: exactAt, className: 'fill-zinc-800 dark:fill-zinc-100' },
    showQuadratic
      ? { y: fn.quadratic(at), className: 'fill-sky-500' }
      : null,
    showLinear ? { y: fn.linear(at), className: 'fill-teal-500' } : null,
  ].filter(Boolean) as { y: number; className: string }[]

  let axisY = yMin <= 0 && yMax >= 0 ? toSvgY(0) : null

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Graph of ${fn.label} with its linear and quadratic approximations near zero`}
    >
      {axisY !== null && (
        <line
          x1={PADDING}
          x2={WIDTH - PADDING}
          y1={axisY}
          y2={axisY}
          className="stroke-zinc-200 dark:stroke-zinc-700"
          strokeWidth="1"
        />
      )}
      <line
        x1={toSvgX(0)}
        x2={toSvgX(0)}
        y1={PADDING}
        y2={HEIGHT - PADDING}
        className="stroke-zinc-200 dark:stroke-zinc-700"
        strokeWidth="1"
      />

      {/* Where we're evaluating. */}
      <line
        x1={toSvgX(at)}
        x2={toSvgX(at)}
        y1={PADDING}
        y2={HEIGHT - PADDING}
        className="stroke-zinc-300 dark:stroke-zinc-600"
        strokeWidth="1"
        strokeDasharray="4 4"
      />

      {curves.map((curve, index) => (
        <path
          key={index}
          d={curve.d}
          fill="none"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={curve.className}
        />
      ))}

      {markers.map((marker, index) =>
        Number.isFinite(marker.y) &&
        marker.y >= yMin &&
        marker.y <= yMax ? (
          <circle
            key={index}
            cx={toSvgX(at)}
            cy={toSvgY(marker.y)}
            r="4"
            className={marker.className}
          />
        ) : null,
      )}
    </svg>
  )
}
