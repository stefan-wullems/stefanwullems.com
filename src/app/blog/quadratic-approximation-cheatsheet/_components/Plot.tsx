import {
  type Viewport,
  buildPath,
  sx,
  sy,
  verticalRangeAround,
} from './plot-geometry'

const WIDTH = 640
const HEIGHT = 340
const PADDING = 10

export function Plot({
  exact,
  linear,
  quadratic,
  center = 0,
  window: windowSize,
  poles = [],
  markers = [],
  label,
}: {
  exact: (x: number) => number
  linear: (x: number) => number
  quadratic: (x: number) => number
  center?: number
  window: number
  poles?: number[]
  /** x positions to mark on both curves, with the gap drawn between them. */
  markers?: number[]
  label: string
}) {
  let xMin = center - windowSize
  let xMax = center + windowSize

  let { yMin, yMax } = verticalRangeAround(
    exact,
    xMin,
    xMax,
    exact(center),
    0.4,
  )

  let v: Viewport = {
    xMin,
    xMax,
    yMin,
    yMax,
    width: WIDTH,
    height: HEIGHT,
    padding: PADDING,
  }

  let curves: { d: string; className: string }[] = [
    {
      d: buildPath(exact, v, poles),
      className: 'stroke-zinc-400 dark:stroke-zinc-300',
    },
  ]

  curves.push({
    d: buildPath(linear, v),
    className: 'stroke-teal-500/70',
  })

  curves.push({
    d: buildPath(quadratic, v),
    className: 'stroke-violet-500',
  })

  let axisY = yMin <= 0 && yMax >= 0 ? sy(v, 0) : null

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className="h-auto w-full"
      role="img"
      aria-label={`Graph of ${label} with its linear and quadratic approximations at the reference point`}
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
      {/* the real y axis, which stays put when the reference moves */}
      {xMin <= 0 && xMax >= 0 && (
        <line
          x1={sx(v, 0)}
          x2={sx(v, 0)}
          y1={PADDING}
          y2={HEIGHT - PADDING}
          className="stroke-zinc-300 dark:stroke-zinc-700"
          strokeWidth="1"
        />
      )}

      {/* the reference point, marked distinctly so it reads as x_0, not an axis */}
      <line
        x1={sx(v, center)}
        x2={sx(v, center)}
        y1={PADDING}
        y2={HEIGHT - PADDING}
        className="stroke-teal-500/45"
        strokeWidth="1"
        strokeDasharray="5 4"
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

      {markers.map((mx, index) => {
        let ye = exact(mx)
        let yq = quadratic(mx)
        if (!Number.isFinite(ye) || !Number.isFinite(yq)) return null

        let inBand = (y: number) => y >= yMin && y <= yMax
        let clamp = (y: number) => Math.min(yMax, Math.max(yMin, y))
        let cx = sx(v, mx)

        return (
          <g key={index}>
            {/* the remaining gap is the quadratic error, which is the point */}
            <line
              x1={cx}
              x2={cx}
              y1={sy(v, clamp(ye))}
              y2={sy(v, clamp(yq))}
              className="stroke-rose-500"
              strokeWidth="2"
            />
            {inBand(yq) && (
              <circle
                cx={cx}
                cy={sy(v, yq)}
                r="3.5"
                className="fill-violet-500"
              />
            )}
            {inBand(ye) && (
              <circle
                cx={cx}
                cy={sy(v, ye)}
                r="3.5"
                className="fill-zinc-500 dark:fill-zinc-200"
              />
            )}
          </g>
        )
      })}
    </svg>
  )
}
