/**
 * A reference point, with the three exact coefficients of the quadratic
 * approximation there: f(x_0), f'(x_0) and f''(x_0)/2. Storing coefficients
 * rather than whole formula strings means the displayed formula is generated,
 * so it cannot drift out of step with the numbers in the table.
 */
export interface Reference {
  label: string
  /** The same label as LaTeX. */
  latex: string
  value: number
  /** f(x_0) */
  c0: string
  /** f'(x_0) */
  c1: string
  /** f''(x_0) / 2 */
  c2: string
}

export interface ParamSpec {
  symbol: string
  options: { label: string; value: number }[]
  initial: number
}

export interface FnSpec {
  key: string
  label: string
  latex: string
  section: 'trig' | 'exp'
  number: string
  /** Symbolic f(x_0), f'(x_0) and f''(x_0)/2, as functions of the x_0 LaTeX. */
  g0: (x0: string) => string
  g1: (x0: string) => string
  g2: (x0: string) => string
  references: Reference[]
  exact: (x: number, p: number) => number
  derivative: (x: number, p: number) => number
  secondDerivative: (x: number, p: number) => number
  poles?: number[]
  param?: ParamSpec
  /** Simplified display form for a preset param value, e.g. r = 1/2. */
  paramVariants?: Record<number, { latex: string }>
  window: number
  note?: string
}

/**
 * Offsets from the reference point used in the value table, paired with how to
 * typeset them exactly.
 */
export const STEPS: { value: number; latex: string }[] = [
  { value: 0, latex: '0' },
  { value: 0.01, latex: '\\frac{1}{100}' },
  { value: 0.1, latex: '\\frac{1}{10}' },
  { value: 0.5, latex: '\\frac{1}{2}' },
  { value: 1, latex: '1' },
]

const PI = Math.PI

/** Builds `c0 + c1(x - x0) + c2(x - x0)^2`, dropping zero and unit factors. */
export function quadraticLatex(
  c0: string,
  c1: string,
  c2: string,
  x0: string,
) {
  let shift = x0 === '0' ? 'x' : `\\left(x - ${x0}\\right)`
  let parts: string[] = []

  if (c0 !== '0') parts.push(c0)

  for (let [coefficient, factor] of [
    [c1, shift],
    [c2, `${shift}^2`],
  ] as const) {
    if (coefficient === '0') continue
    let negative = coefficient.startsWith('-')
    let magnitude = negative ? coefficient.slice(1) : coefficient
    let body = magnitude === '1' ? factor : `${magnitude}${factor}`
    if (parts.length === 0) {
      parts.push(negative ? `-${body}` : body)
    } else {
      parts.push(negative ? `- ${body}` : `+ ${body}`)
    }
  }

  return parts.length ? parts.join(' ') : '0'
}

export const FUNCTIONS: FnSpec[] = [
  {
    key: 'sin',
    label: 'sin x',
    latex: '\\sin x',
    section: 'trig',
    number: '2.1.1',
    g0: (x0) => `\\sin ${x0}`,
    g1: (x0) => `\\cos ${x0}`,
    g2: (x0) => `-\\frac{\\sin ${x0}}{2}`,
    references: [
      { label: '0', latex: '0', value: 0, c0: '0', c1: '1', c2: '0' },
      {
        label: 'π/6',
        latex: '\\frac{\\pi}{6}',
        value: PI / 6,
        c0: '\\frac{1}{2}',
        c1: '\\frac{\\sqrt{3}}{2}',
        c2: '-\\frac{1}{4}',
      },
      {
        label: 'π/4',
        latex: '\\frac{\\pi}{4}',
        value: PI / 4,
        c0: '\\frac{\\sqrt{2}}{2}',
        c1: '\\frac{\\sqrt{2}}{2}',
        c2: '-\\frac{\\sqrt{2}}{4}',
      },
      {
        label: 'π/2',
        latex: '\\frac{\\pi}{2}',
        value: PI / 2,
        c0: '1',
        c1: '0',
        c2: '-\\frac{1}{2}',
      },
    ],
    exact: Math.sin,
    derivative: Math.cos,
    secondDerivative: (x) => -Math.sin(x),
    window: 3.8,
    note: 'At 0 the quadratic term vanishes, so it matches the linear one. At π/2 it is the other way round: the linear term dies and the curvature carries everything.',
  },
  {
    key: 'cos',
    label: 'cos x',
    latex: '\\cos x',
    section: 'trig',
    number: '2.1.2',
    g0: (x0) => `\\cos ${x0}`,
    g1: (x0) => `-\\sin ${x0}`,
    g2: (x0) => `-\\frac{\\cos ${x0}}{2}`,
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        c0: '1',
        c1: '0',
        c2: '-\\frac{1}{2}',
      },
      {
        label: 'π/6',
        latex: '\\frac{\\pi}{6}',
        value: PI / 6,
        c0: '\\frac{\\sqrt{3}}{2}',
        c1: '-\\frac{1}{2}',
        c2: '-\\frac{\\sqrt{3}}{4}',
      },
      {
        label: 'π/3',
        latex: '\\frac{\\pi}{3}',
        value: PI / 3,
        c0: '\\frac{1}{2}',
        c1: '-\\frac{\\sqrt{3}}{2}',
        c2: '-\\frac{1}{4}',
      },
      {
        label: 'π/2',
        latex: '\\frac{\\pi}{2}',
        value: PI / 2,
        c0: '0',
        c1: '-1',
        c2: '0',
      },
    ],
    exact: Math.cos,
    derivative: (x) => -Math.sin(x),
    secondDerivative: (x) => -Math.cos(x),
    window: 3.8,
    note: 'The famous one: near 0, cos x ≈ 1 − x²/2. At π/2 the curvature vanishes instead, so there the quadratic adds nothing.',
  },
  {
    key: 'tan',
    label: 'tan x',
    latex: '\\tan x',
    section: 'trig',
    number: '2.1.3',
    g0: (x0) => `\\tan ${x0}`,
    g1: (x0) => `\\sec^2 ${x0}`,
    g2: (x0) => `\\sec^2 ${x0} \\tan ${x0}`,
    references: [
      { label: '0', latex: '0', value: 0, c0: '0', c1: '1', c2: '0' },
      {
        label: 'π/6',
        latex: '\\frac{\\pi}{6}',
        value: PI / 6,
        c0: '\\frac{1}{\\sqrt{3}}',
        c1: '\\frac{4}{3}',
        c2: '\\frac{4\\sqrt{3}}{9}',
      },
      {
        label: 'π/4',
        latex: '\\frac{\\pi}{4}',
        value: PI / 4,
        c0: '1',
        c1: '2',
        c2: '2',
      },
    ],
    exact: Math.tan,
    derivative: (x) => 1 / (Math.cos(x) * Math.cos(x)),
    secondDerivative: (x) => (2 * Math.tan(x)) / (Math.cos(x) * Math.cos(x)),
    poles: [-PI / 2, PI / 2],
    window: 2.6,
    note: 'tan is odd, so at 0 the curvature is zero and the quadratic collapses back to x.',
  },
  {
    key: 'sec',
    label: 'sec x',
    latex: '\\sec x',
    section: 'trig',
    number: '2.1.4',
    g0: (x0) => `\\sec ${x0}`,
    g1: (x0) => `\\sec ${x0} \\tan ${x0}`,
    g2: (x0) => `\\frac{\\sec ${x0}\\tan^2 ${x0} + \\sec^3 ${x0}}{2}`,
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        c0: '1',
        c1: '0',
        c2: '\\frac{1}{2}',
      },
      {
        label: 'π/6',
        latex: '\\frac{\\pi}{6}',
        value: PI / 6,
        c0: '\\frac{2}{\\sqrt{3}}',
        c1: '\\frac{2}{3}',
        c2: '\\frac{5\\sqrt{3}}{9}',
      },
      {
        label: 'π/4',
        latex: '\\frac{\\pi}{4}',
        value: PI / 4,
        c0: '\\sqrt{2}',
        c1: '\\sqrt{2}',
        c2: '\\frac{3\\sqrt{2}}{2}',
      },
    ],
    exact: (x) => 1 / Math.cos(x),
    derivative: (x) => Math.tan(x) / Math.cos(x),
    secondDerivative: (x) =>
      Math.tan(x) * Math.tan(x) / Math.cos(x) + 1 / Math.pow(Math.cos(x), 3),
    poles: [-PI / 2, PI / 2],
    window: 2.6,
    note: 'Mirror of cos: flat at 0, but curving upward instead of down, so the x² term flips sign.',
  },
  {
    key: 'cot',
    label: 'cot x',
    latex: '\\cot x',
    section: 'trig',
    number: '2.1.5',
    g0: (x0) => `\\cot ${x0}`,
    g1: (x0) => `-\\csc^2 ${x0}`,
    g2: (x0) => `\\csc^2 ${x0} \\cot ${x0}`,
    references: [
      {
        label: 'π/4',
        latex: '\\frac{\\pi}{4}',
        value: PI / 4,
        c0: '1',
        c1: '-2',
        c2: '2',
      },
      {
        label: 'π/2',
        latex: '\\frac{\\pi}{2}',
        value: PI / 2,
        c0: '0',
        c1: '-1',
        c2: '0',
      },
    ],
    exact: (x) => 1 / Math.tan(x),
    derivative: (x) => -1 / (Math.sin(x) * Math.sin(x)),
    secondDerivative: (x) =>
      (2 * Math.cos(x)) / Math.pow(Math.sin(x), 3),
    poles: [0, PI],
    window: 2.6,
    note: 'Still nothing at 0 — cot blows up there. At π/2 it has an inflection, so the quadratic term is zero.',
  },
  {
    key: 'csc',
    label: 'csc x',
    latex: '\\csc x',
    section: 'trig',
    number: '2.1.6',
    g0: (x0) => `\\csc ${x0}`,
    g1: (x0) => `-\\csc ${x0} \\cot ${x0}`,
    g2: (x0) => `\\frac{\\csc ${x0}\\cot^2 ${x0} + \\csc^3 ${x0}}{2}`,
    references: [
      {
        label: 'π/4',
        latex: '\\frac{\\pi}{4}',
        value: PI / 4,
        c0: '\\sqrt{2}',
        c1: '-\\sqrt{2}',
        c2: '\\frac{3\\sqrt{2}}{2}',
      },
      {
        label: 'π/2',
        latex: '\\frac{\\pi}{2}',
        value: PI / 2,
        c0: '1',
        c1: '0',
        c2: '\\frac{1}{2}',
      },
    ],
    exact: (x) => 1 / Math.sin(x),
    derivative: (x) => -Math.cos(x) / (Math.sin(x) * Math.sin(x)),
    secondDerivative: (x) =>
      (Math.cos(x) * Math.cos(x)) / Math.pow(Math.sin(x), 3) +
      1 / Math.pow(Math.sin(x), 3),
    poles: [0, PI],
    window: 2.6,
    note: 'At π/2 csc bottoms out, so the linear part is flat and the whole shape comes from the x² term.',
  },
  {
    key: 'exp',
    label: 'e^x',
    latex: 'e^x',
    section: 'exp',
    number: '2.2.1',
    g0: (x0) => `e^{${x0}}`,
    g1: (x0) => `e^{${x0}}`,
    g2: (x0) => `\\frac{e^{${x0}}}{2}`,
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        c0: '1',
        c1: '1',
        c2: '\\frac{1}{2}',
      },
      {
        label: '1',
        latex: '1',
        value: 1,
        c0: 'e',
        c1: 'e',
        c2: '\\frac{e}{2}',
      },
      {
        label: '2',
        latex: '2',
        value: 2,
        c0: 'e^2',
        c1: 'e^2',
        c2: '\\frac{e^2}{2}',
      },
    ],
    exact: Math.exp,
    derivative: Math.exp,
    secondDerivative: Math.exp,
    window: 2.0,
    note: 'Every derivative is the same, so all three coefficients share a factor of e^{x₀}.',
  },
  {
    key: 'ln',
    label: 'ln(1 + x)',
    latex: '\\ln(1+x)',
    section: 'exp',
    number: '2.2.2',
    g0: (x0) => `\\ln(1+${x0})`,
    g1: (x0) => `\\dfrac{1}{1+${x0}}`,
    g2: (x0) => `-\\dfrac{1}{2(1+${x0})^2}`,
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        c0: '0',
        c1: '1',
        c2: '-\\frac{1}{2}',
      },
      {
        label: '1',
        latex: '1',
        value: 1,
        c0: '\\ln 2',
        c1: '\\frac{1}{2}',
        c2: '-\\frac{1}{8}',
      },
      {
        label: '2',
        latex: '2',
        value: 2,
        c0: '\\ln 3',
        c1: '\\frac{1}{3}',
        c2: '-\\frac{1}{18}',
      },
    ],
    exact: (x) => Math.log(1 + x),
    derivative: (x) => 1 / (1 + x),
    secondDerivative: (x) => -1 / ((1 + x) * (1 + x)),
    poles: [-1],
    window: 2.4,
    note: 'Near 0 this is x − x²/2, the start of the alternating log series.',
  },
  {
    key: 'pow',
    label: '(1 + x)^r',
    latex: '(1+x)^r',
    section: 'exp',
    number: '2.2.3',
    g0: (x0) => `(1+${x0})^r`,
    g1: (x0) => `r(1+${x0})^{r-1}`,
    g2: (x0) => `\\frac{r(r-1)}{2}(1+${x0})^{r-2}`,
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        c0: '1',
        c1: 'r',
        c2: '\\frac{r(r-1)}{2}',
      },
      {
        label: '1',
        latex: '1',
        value: 1,
        c0: '2^r',
        c1: 'r\\,2^{r-1}',
        c2: 'r(r-1)2^{r-3}',
      },
    ],
    exact: (x, r) => Math.pow(1 + x, r),
    derivative: (x, r) => r * Math.pow(1 + x, r - 1),
    secondDerivative: (x, r) => r * (r - 1) * Math.pow(1 + x, r - 2),
    poles: [-1],
    param: {
      symbol: 'r',
      initial: 0.5,
      options: [
        { label: '1/2', value: 0.5 },
        { label: '−1/2', value: -0.5 },
        { label: '−1', value: -1 },
        { label: '2', value: 2 },
        { label: '3', value: 3 },
      ],
    },
    paramVariants: {
      0.5: { latex: '\\sqrt{1+x}' },
      [-0.5]: { latex: '\\dfrac{1}{\\sqrt{1+x}}' },
      [-1]: { latex: '\\dfrac{1}{1+x}' },
      2: { latex: '(1+x)^2' },
      3: { latex: '(1+x)^3' },
    },
    window: 2.4,
    note: 'At r = 2 the quadratic approximation is exact — (1+x)² already is a quadratic, so there is no error at all.',
  },
  {
    key: 'apow',
    label: 'a^x',
    latex: 'a^x',
    section: 'exp',
    number: '2.2.4',
    g0: (x0) => `a^{${x0}}`,
    g1: (x0) => `a^{${x0}}\\ln a`,
    g2: (x0) => `\\frac{a^{${x0}}\\ln^2 a}{2}`,
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        c0: '1',
        c1: '\\ln a',
        c2: '\\frac{\\ln^2 a}{2}',
      },
      {
        label: '1',
        latex: '1',
        value: 1,
        c0: 'a',
        c1: 'a\\ln a',
        c2: '\\frac{a\\ln^2 a}{2}',
      },
    ],
    exact: (x, a) => Math.pow(a, x),
    derivative: (x, a) => Math.pow(a, x) * Math.log(a),
    secondDerivative: (x, a) =>
      Math.pow(a, x) * Math.log(a) * Math.log(a),
    param: {
      symbol: 'a',
      initial: 2,
      options: [
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '10', value: 10 },
      ],
    },
    window: 2.0,
    note: 'Covers e^x too: set a = e, so ln a = 1 and the coefficients collapse to 1, 1, 1/2.',
  },
]

export function getFunction(key: string) {
  return FUNCTIONS.find((fn) => fn.key === key) ?? FUNCTIONS[0]
}

export function formatValue(value: number, digits = 6) {
  if (!Number.isFinite(value)) {
    return '—'
  }
  if (value !== 0 && Math.abs(value) < 1e-4) {
    return value.toExponential(2)
  }
  return value.toFixed(digits)
}
