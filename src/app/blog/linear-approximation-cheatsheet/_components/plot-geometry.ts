export interface Viewport {
  xMin: number
  xMax: number
  yMin: number
  yMax: number
  width: number
  height: number
  padding: number
}

/**
 * Rounded to 2dp because these land straight in SVG attributes: node and the
 * browser can disagree in the last float digit, which React reports as a
 * hydration mismatch.
 */
const round = (n: number) => Math.round(n * 100) / 100

export function sx(v: Viewport, x: number) {
  return round(
    v.padding + ((x - v.xMin) / (v.xMax - v.xMin)) * (v.width - 2 * v.padding),
  )
}

export function sy(v: Viewport, y: number) {
  return round(
    v.height -
      v.padding -
      ((y - v.yMin) / (v.yMax - v.yMin)) * (v.height - 2 * v.padding),
  )
}

/**
 * Samples f across the viewport, breaking the path wherever the curve leaves
 * the visible band or steps over a pole, so asymptotes don't draw as vertical
 * bars across the figure.
 */
export function buildPath(
  f: (x: number) => number,
  v: Viewport,
  poles: number[] = [],
  steps = 240,
) {
  let segments: string[] = []
  let current: string[] = []

  let flush = () => {
    if (current.length > 1) segments.push(current.join(' '))
    current = []
  }

  let previous: number | null = null

  for (let i = 0; i <= steps; i++) {
    let x = v.xMin + ((v.xMax - v.xMin) * i) / steps

    if (
      previous !== null &&
      poles.some((p) => (previous! < p && x >= p) || (previous! > p && x <= p))
    ) {
      flush()
    }
    previous = x

    let y = f(x)

    if (!Number.isFinite(y) || y < v.yMin || y > v.yMax) {
      flush()
      continue
    }

    current.push(
      `${current.length === 0 ? 'M' : 'L'}${sx(v, x).toFixed(2)} ${sy(v, y).toFixed(2)}`,
    )
  }

  flush()
  return segments.join(' ')
}

/**
 * Picks a y range around the reference value. Uses percentiles rather than
 * min/max so a pole inside the window doesn't blow the scale out, and centres
 * on the reference so that point is always visible.
 */
export function verticalRangeAround(
  f: (x: number) => number,
  xMin: number,
  xMax: number,
  centerY: number,
  minHalf: number,
) {
  let ys: number[] = []
  for (let i = 0; i <= 400; i++) {
    let y = f(xMin + ((xMax - xMin) * i) / 400)
    if (Number.isFinite(y)) ys.push(y)
  }

  if (ys.length === 0) {
    return { yMin: centerY - minHalf, yMax: centerY + minHalf }
  }

  ys.sort((a, b) => a - b)
  let at = (p: number) =>
    ys[Math.min(ys.length - 1, Math.max(0, Math.round(p * (ys.length - 1))))]

  let lo = at(0.08)
  let hi = at(0.92)
  let center = Number.isFinite(centerY) ? centerY : (lo + hi) / 2
  let half = Math.max(
    Math.abs(hi - center),
    Math.abs(center - lo),
    minHalf,
  )

  return { yMin: center - half * 1.25, yMax: center + half * 1.25 }
}
