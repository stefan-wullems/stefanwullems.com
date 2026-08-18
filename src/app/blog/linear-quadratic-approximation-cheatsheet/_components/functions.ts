export interface ApproxFunction {
  key: string
  label: string
  exact: (x: number) => number
  linear: (x: number) => number
  quadratic: (x: number) => number
  linearLabel: string
  quadraticLabel: string
  /** x values where the function blows up, used to break the plotted curve. */
  poles?: number[]
}

const LN2 = Math.log(2)

export const FUNCTIONS: ApproxFunction[] = [
  {
    key: 'sin',
    label: 'sin x',
    exact: Math.sin,
    linear: (x) => x,
    quadratic: (x) => x,
    linearLabel: 'x',
    quadraticLabel: 'x',
  },
  {
    key: 'cos',
    label: 'cos x',
    exact: Math.cos,
    linear: () => 1,
    quadratic: (x) => 1 - (x * x) / 2,
    linearLabel: '1',
    quadraticLabel: '1 − x²/2',
  },
  {
    key: 'tan',
    label: 'tan x',
    exact: Math.tan,
    linear: (x) => x,
    quadratic: (x) => x,
    linearLabel: 'x',
    quadraticLabel: 'x',
    poles: [-Math.PI / 2, Math.PI / 2],
  },
  {
    key: 'sec',
    label: 'sec x',
    exact: (x) => 1 / Math.cos(x),
    linear: () => 1,
    quadratic: (x) => 1 + (x * x) / 2,
    linearLabel: '1',
    quadraticLabel: '1 + x²/2',
    poles: [-Math.PI / 2, Math.PI / 2],
  },
  {
    key: 'exp',
    label: 'eˣ',
    exact: Math.exp,
    linear: (x) => 1 + x,
    quadratic: (x) => 1 + x + (x * x) / 2,
    linearLabel: '1 + x',
    quadraticLabel: '1 + x + x²/2',
  },
  {
    key: 'ln',
    label: 'ln(1 + x)',
    exact: (x) => Math.log(1 + x),
    linear: (x) => x,
    quadratic: (x) => x - (x * x) / 2,
    linearLabel: 'x',
    quadraticLabel: 'x − x²/2',
    poles: [-1],
  },
  {
    key: 'sqrt',
    label: '√(1 + x)',
    exact: (x) => Math.sqrt(1 + x),
    linear: (x) => 1 + x / 2,
    quadratic: (x) => 1 + x / 2 - (x * x) / 8,
    linearLabel: '1 + x/2',
    quadraticLabel: '1 + x/2 − x²/8',
    poles: [-1],
  },
  {
    key: 'pow2',
    label: '2ˣ',
    exact: (x) => Math.pow(2, x),
    linear: (x) => 1 + x * LN2,
    quadratic: (x) => 1 + x * LN2 + (x * x * LN2 * LN2) / 2,
    linearLabel: '1 + x ln2',
    quadraticLabel: '1 + x ln2 + x²ln²2/2',
  },
]

export function getFunction(key: string) {
  return FUNCTIONS.find((fn) => fn.key === key) ?? FUNCTIONS[0]
}

/** Formats a number for side-by-side comparison, keeping small errors readable. */
export function formatValue(value: number, digits = 6) {
  if (!Number.isFinite(value)) {
    return '—'
  }
  if (value !== 0 && Math.abs(value) < 1e-4) {
    return value.toExponential(2)
  }
  return value.toFixed(digits)
}
