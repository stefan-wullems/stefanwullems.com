'use client'

const WIDTH = 640
const HEIGHT = 340
const PADDING = 10

/**
 * Samples f across the window, breaking the path wherever the curve leaves the
 * visible band or steps over a pole, so asymptotes don't draw as vertical bars.
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
    if (current.length > 1) segments.push(current.join(' '))
    current = []
  }

  let previous: number | null = null

  for (let i = 0; i <= steps; i++) {
    let x = -window + (2 * window * i) / steps

    if (
      previous !== null &&
      poles.some((p) => (previous! < p && x >= p) || (previous! > p && x <= p))
    ) {
      flush()
    }
    previous = x

    let y = f(x)

    if (!Number.isFinite(y) || y < yMin || y > yMax) {
      flush()
      continue
    }

    current.push(
      `${current.length === 0 ? 'M' : 'L'}${toSvgX(x).toFixed(2)} ${toSvgY(y).toFixed(2)}`,
    )
  }

  flush()
  return segments.join(' ')
}

export function Plot({
  exact,
  linear,
  quadratic,
  window: windowSize,
  showLinear,
  showQuadratic,
  poles = [],
  label,
  at,
}: {
  exact: (x: number) => number
  linear?: (x: number) => number
  quadratic?: (x: number) => number
  window: number
  showLinear: boolean
  showQuadratic: boolean
  poles?: number[]
  label: string
  at?: number
}) {
  // Scale the vertical band to what the exact curve does nearby, with a floor so
  // flat functions don't get an absurd zoom.
  let samples: number[] = []
  for (let i = 0; i <= 200; i++) {
    let x = -windowSize + (2 * windowSize * i) / 200
    let y = exact(x)
    if (Number.isFinite(y) && Math.abs(y) < 50) samples.push(y)
  }

  let dataMin = samples.length ? Math.min(...samples) : -1
  let dataMax = samples.length ? Math.max(...samples) : 1
  let mid = (dataMin + dataMax) / 2
  let half = Math.max((dataMax - dataMin) / 2, windowSize * 0.6, 0.35)
  let yMin = mid - half * 1.3
  let yMax = mid + half * 1.3

  let toSvgX = (x: number) =>
    PADDING + ((x + windowSize) / (2 * windowSize)) * (WIDTH - 2 * PADDING)
  let toSvgY = (y: number) =>
    HEIGHT - PADDING - ((y - yMin) / (yMax - yMin)) * (HEIGHT - 2 * PADDING)

  let curves: { d: string; className: string }[] = [
    {
      d: buildPath(exact, windowSize, yMin, yMax, poles),
      className: 'stroke-zinc-400 dark:stroke-zinc-300',
    },
  ]

  if (showQuadratic && quadratic) {
    curves.push({
      d: buildPath(quadratic, windowSize, yMin, yMax, []),
      className: 'stroke-sky-500',
    })
  }

  if (showLinear && linear) {
    curves.push({
      d: buildPath(linear, windowSize, yMin, yMax, []),
      className: 'stroke-teal-500',
    })
  }

  let axisY = yMin <= 0 && yMax >= 0 ? toSvgY(0) : null

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Graph of ${label} with its approximations near zero`}
    >
      {axisY !== null && (
        <line
          x1={PADDING}
          x2={WIDTH - PADDING}
          y1={axisY}
          y2={axisY}
          className="stroke-zinc-300 dark:stroke-zinc-700"
          strokeWidth="1"
        />
      )}
      <line
        x1={toSvgX(0)}
        x2={toSvgX(0)}
        y1={PADDING}
        y2={HEIGHT - PADDING}
        className="stroke-zinc-300 dark:stroke-zinc-700"
        strokeWidth="1"
      />

      {at !== undefined && (
        <line
          x1={toSvgX(at)}
          x2={toSvgX(at)}
          y1={PADDING}
          y2={HEIGHT - PADDING}
          className="stroke-zinc-300 dark:stroke-zinc-600"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
      )}

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
    </svg>
  )
}
