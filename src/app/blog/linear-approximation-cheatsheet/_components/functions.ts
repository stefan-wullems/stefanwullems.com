export interface Reference {
  /** Shown on the picker chip. */
  label: string
  /** The same label as LaTeX, used in chips and in table row labels. */
  latex: string
  value: number
  /** The general form with this reference value substituted, not yet worked out. */
  substitutedLatex: string
  /** That same line, simplified. */
  approxLatex: string
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
  /** LaTeX for the approximation at an unspecified reference point. */
  generalLatex: string
  references: Reference[]
  exact: (x: number, p: number) => number
  derivative: (x: number, p: number) => number
  poles?: number[]
  param?: ParamSpec
  /**
   * Simplified display forms for specific preset param values, e.g. r = 1/2
   * shown as \sqrt{1+x} rather than the generic (1+x)^r. Used only for the
   * "any x_0" general form. Keyed by the param value.
   */
  paramVariants?: Record<number, { latex: string; generalLatex: string }>
  /** Range the custom x_0 slider may roam over. */
  x0Range: [number, number]
  /** Half-width of the plotted window. Periodic functions want more room. */
  window: number
  note?: string
}

/**
 * Offsets from the reference point used in the value table, paired with how
 * to typeset them exactly (0.01 reads better as 1/100 than as a decimal).
 */
export const STEPS: { value: number; latex: string }[] = [
  { value: 0, latex: '0' },
  { value: 0.01, latex: '\\frac{1}{100}' },
  { value: 0.1, latex: '\\frac{1}{10}' },
  { value: 0.5, latex: '\\frac{1}{2}' },
  { value: 1, latex: '1' },
]

const PI = Math.PI

export const FUNCTIONS: FnSpec[] = [
  {
    key: 'sin',
    label: 'sin x',
    latex: '\\sin x',
    section: 'trig',
    number: '2.1.1',
    generalLatex: '\\sin x_0 + \\cos x_0\\,(x - x_0)',
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        substitutedLatex: '\\sin 0 + \\cos 0\\,(x - 0)',
        approxLatex: 'x',
      },
      {
        label: 'π/6',
        latex: '\\frac{\\pi}{6}',
        value: PI / 6,
        substitutedLatex:
          '\\sin\\frac{\\pi}{6} + \\cos\\frac{\\pi}{6}\\left(x - \\frac{\\pi}{6}\\right)',
        approxLatex:
          '\\frac{1}{2} + \\frac{\\sqrt{3}}{2}\\left(x - \\frac{\\pi}{6}\\right)',
      },
      {
        label: 'π/4',
        latex: '\\frac{\\pi}{4}',
        value: PI / 4,
        substitutedLatex:
          '\\sin\\frac{\\pi}{4} + \\cos\\frac{\\pi}{4}\\left(x - \\frac{\\pi}{4}\\right)',
        approxLatex:
          '\\frac{\\sqrt{2}}{2} + \\frac{\\sqrt{2}}{2}\\left(x - \\frac{\\pi}{4}\\right)',
      },
      {
        label: 'π/2',
        latex: '\\frac{\\pi}{2}',
        value: PI / 2,
        substitutedLatex:
          '\\sin\\frac{\\pi}{2} + \\cos\\frac{\\pi}{2}\\left(x - \\frac{\\pi}{2}\\right)',
        approxLatex: '1',
      },
    ],
    exact: Math.sin,
    derivative: Math.cos,
    x0Range: [-PI, PI],
    window: 3.8,
    note: 'At 0 this is the small-angle rule. At π/2 the curve is flat, so the approximation is just the constant 1.',
  },
  {
    key: 'cos',
    label: 'cos x',
    latex: '\\cos x',
    section: 'trig',
    number: '2.1.2',
    generalLatex: '\\cos x_0 - \\sin x_0\\,(x - x_0)',
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        substitutedLatex: '\\cos 0 - \\sin 0\\,(x - 0)',
        approxLatex: '1',
      },
      {
        label: 'π/6',
        latex: '\\frac{\\pi}{6}',
        value: PI / 6,
        substitutedLatex:
          '\\cos\\frac{\\pi}{6} - \\sin\\frac{\\pi}{6}\\left(x - \\frac{\\pi}{6}\\right)',
        approxLatex:
          '\\frac{\\sqrt{3}}{2} - \\frac{1}{2}\\left(x - \\frac{\\pi}{6}\\right)',
      },
      {
        label: 'π/3',
        latex: '\\frac{\\pi}{3}',
        value: PI / 3,
        substitutedLatex:
          '\\cos\\frac{\\pi}{3} - \\sin\\frac{\\pi}{3}\\left(x - \\frac{\\pi}{3}\\right)',
        approxLatex:
          '\\frac{1}{2} - \\frac{\\sqrt{3}}{2}\\left(x - \\frac{\\pi}{3}\\right)',
      },
      {
        label: 'π/2',
        latex: '\\frac{\\pi}{2}',
        value: PI / 2,
        substitutedLatex:
          '\\cos\\frac{\\pi}{2} - \\sin\\frac{\\pi}{2}\\left(x - \\frac{\\pi}{2}\\right)',
        approxLatex: '\\frac{\\pi}{2} - x',
      },
    ],
    exact: Math.cos,
    derivative: (x) => -Math.sin(x),
    x0Range: [-PI, PI],
    window: 3.8,
    note: 'Flat at 0, so the line there is the constant 1. At π/2 it is steepest and the approximation is a pure slope.',
  },
  {
    key: 'tan',
    label: 'tan x',
    latex: '\\tan x',
    section: 'trig',
    number: '2.1.3',
    generalLatex: '\\tan x_0 + \\sec^2 x_0\\,(x - x_0)',
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        substitutedLatex: '\\tan 0 + \\sec^2 0\\,(x - 0)',
        approxLatex: 'x',
      },
      {
        label: 'π/6',
        latex: '\\frac{\\pi}{6}',
        value: PI / 6,
        substitutedLatex:
          '\\tan\\frac{\\pi}{6} + \\sec^2\\frac{\\pi}{6}\\left(x - \\frac{\\pi}{6}\\right)',
        approxLatex:
          '\\frac{1}{\\sqrt{3}} + \\frac{4}{3}\\left(x - \\frac{\\pi}{6}\\right)',
      },
      {
        label: 'π/4',
        latex: '\\frac{\\pi}{4}',
        value: PI / 4,
        substitutedLatex:
          '\\tan\\frac{\\pi}{4} + \\sec^2\\frac{\\pi}{4}\\left(x - \\frac{\\pi}{4}\\right)',
        approxLatex: '1 + 2\\left(x - \\frac{\\pi}{4}\\right)',
      },
    ],
    exact: Math.tan,
    derivative: (x) => 1 / (Math.cos(x) * Math.cos(x)),
    poles: [-PI / 2, PI / 2],
    x0Range: [-1.4, 1.4],
    window: 2.6,
    note: 'Near 0, tan x flattens to x, the same as sin x. It steepens fast as you approach π/2.',
  },
  {
    key: 'sec',
    label: 'sec x',
    latex: '\\sec x',
    section: 'trig',
    number: '2.1.4',
    generalLatex: '\\sec x_0 + \\sec x_0 \\tan x_0\\,(x - x_0)',
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        substitutedLatex: '\\sec 0 + \\sec 0\\tan 0\\,(x - 0)',
        approxLatex: '1',
      },
      {
        label: 'π/6',
        latex: '\\frac{\\pi}{6}',
        value: PI / 6,
        substitutedLatex:
          '\\sec\\frac{\\pi}{6} + \\sec\\frac{\\pi}{6}\\tan\\frac{\\pi}{6}\\left(x - \\frac{\\pi}{6}\\right)',
        approxLatex:
          '\\frac{2}{\\sqrt{3}} + \\frac{2}{3}\\left(x - \\frac{\\pi}{6}\\right)',
      },
      {
        label: 'π/4',
        latex: '\\frac{\\pi}{4}',
        value: PI / 4,
        substitutedLatex:
          '\\sec\\frac{\\pi}{4} + \\sec\\frac{\\pi}{4}\\tan\\frac{\\pi}{4}\\left(x - \\frac{\\pi}{4}\\right)',
        approxLatex:
          '\\sqrt{2} + \\sqrt{2}\\left(x - \\frac{\\pi}{4}\\right)',
      },
    ],
    exact: (x) => 1 / Math.cos(x),
    derivative: (x) => Math.tan(x) / Math.cos(x),
    poles: [-PI / 2, PI / 2],
    x0Range: [-1.4, 1.4],
    window: 2.6,
    note: 'Flat at 0 like cos, so the line there is the constant 1.',
  },
  {
    key: 'cot',
    label: 'cot x',
    latex: '\\cot x',
    section: 'trig',
    number: '2.1.5',
    generalLatex: '\\cot x_0 - \\csc^2 x_0\\,(x - x_0)',
    references: [
      {
        label: 'π/4',
        latex: '\\frac{\\pi}{4}',
        value: PI / 4,
        substitutedLatex:
          '\\cot\\frac{\\pi}{4} - \\csc^2\\frac{\\pi}{4}\\left(x - \\frac{\\pi}{4}\\right)',
        approxLatex: '1 - 2\\left(x - \\frac{\\pi}{4}\\right)',
      },
      {
        label: 'π/2',
        latex: '\\frac{\\pi}{2}',
        value: PI / 2,
        substitutedLatex:
          '\\cot\\frac{\\pi}{2} - \\csc^2\\frac{\\pi}{2}\\left(x - \\frac{\\pi}{2}\\right)',
        approxLatex: '\\frac{\\pi}{2} - x',
      },
    ],
    exact: (x) => 1 / Math.tan(x),
    derivative: (x) => -1 / (Math.sin(x) * Math.sin(x)),
    poles: [0, PI],
    x0Range: [0.35, 2.8],
    window: 2.6,
    note: 'There is no reference point at 0 — cot blows up there. Away from 0 it behaves like anything else.',
  },
  {
    key: 'csc',
    label: 'csc x',
    latex: '\\csc x',
    section: 'trig',
    number: '2.1.6',
    generalLatex: '\\csc x_0 - \\csc x_0 \\cot x_0\\,(x - x_0)',
    references: [
      {
        label: 'π/4',
        latex: '\\frac{\\pi}{4}',
        value: PI / 4,
        substitutedLatex:
          '\\csc\\frac{\\pi}{4} - \\csc\\frac{\\pi}{4}\\cot\\frac{\\pi}{4}\\left(x - \\frac{\\pi}{4}\\right)',
        approxLatex:
          '\\sqrt{2} - \\sqrt{2}\\left(x - \\frac{\\pi}{4}\\right)',
      },
      {
        label: 'π/2',
        latex: '\\frac{\\pi}{2}',
        value: PI / 2,
        substitutedLatex:
          '\\csc\\frac{\\pi}{2} - \\csc\\frac{\\pi}{2}\\cot\\frac{\\pi}{2}\\left(x - \\frac{\\pi}{2}\\right)',
        approxLatex: '1',
      },
    ],
    exact: (x) => 1 / Math.sin(x),
    derivative: (x) => -Math.cos(x) / (Math.sin(x) * Math.sin(x)),
    poles: [0, PI],
    x0Range: [0.35, 2.8],
    window: 2.6,
    note: 'Same as cot — undefined at 0, fine everywhere else. At π/2 it bottoms out, so the line is flat.',
  },
  {
    key: 'exp',
    label: 'e^x',
    latex: 'e^x',
    section: 'exp',
    number: '2.2.1',
    generalLatex: 'e^{x_0} + e^{x_0}\\,(x - x_0)',
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        substitutedLatex: 'e^0 + e^0\\,(x - 0)',
        approxLatex: '1 + x',
      },
      {
        label: '1',
        latex: '1',
        value: 1,
        substitutedLatex: 'e^1 + e^1\\,(x - 1)',
        approxLatex: 'e\\,x',
      },
      {
        label: '2',
        latex: '2',
        value: 2,
        substitutedLatex: 'e^2 + e^2\\,(x - 2)',
        approxLatex: 'e^2\\left(x - 1\\right)',
      },
    ],
    exact: Math.exp,
    derivative: Math.exp,
    x0Range: [-2, 2.5],
    window: 2.0,
    note: 'At x₀ = 1 the two terms collapse: e + e(x − 1) = e·x.',
  },
  {
    key: 'ln',
    label: 'ln(1 + x)',
    latex: '\\ln(1+x)',
    section: 'exp',
    number: '2.2.2',
    generalLatex: '\\ln(1+x_0) + \\dfrac{x - x_0}{1 + x_0}',
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        substitutedLatex: '\\ln(1+0) + \\dfrac{x - 0}{1 + 0}',
        approxLatex: 'x',
      },
      {
        label: '1',
        latex: '1',
        value: 1,
        substitutedLatex: '\\ln(1+1) + \\dfrac{x - 1}{1 + 1}',
        approxLatex: '\\ln 2 + \\frac{x - 1}{2}',
      },
      {
        label: '2',
        latex: '2',
        value: 2,
        substitutedLatex: '\\ln(1+2) + \\dfrac{x - 2}{1 + 2}',
        approxLatex: '\\ln 3 + \\frac{x - 2}{3}',
      },
    ],
    exact: (x) => Math.log(1 + x),
    derivative: (x) => 1 / (1 + x),
    poles: [-1],
    x0Range: [-0.6, 3],
    window: 2.4,
    note: 'Written as ln(1 + x) so that 0 is a usable reference point. Plain ln x has none.',
  },
  {
    key: 'pow',
    label: '(1 + x)^r',
    latex: '(1+x)^r',
    section: 'exp',
    number: '2.2.3',
    generalLatex: '(1+x_0)^r + r(1+x_0)^{r-1}(x - x_0)',
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        substitutedLatex: '(1+0)^r + r(1+0)^{r-1}(x - 0)',
        approxLatex: '1 + rx',
      },
      {
        label: '1',
        latex: '1',
        value: 1,
        substitutedLatex: '(1+1)^r + r(1+1)^{r-1}(x - 1)',
        approxLatex: '2^r + r\\,2^{r-1}(x - 1)',
      },
    ],
    exact: (x, r) => Math.pow(1 + x, r),
    derivative: (x, r) => r * Math.pow(1 + x, r - 1),
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
      0.5: {
        latex: '\\sqrt{1+x}',
        generalLatex:
          '\\sqrt{1+x_0} + \\dfrac{1}{2\\sqrt{1+x_0}}(x - x_0)',
      },
      [-0.5]: {
        latex: '\\dfrac{1}{\\sqrt{1+x}}',
        generalLatex:
          '\\dfrac{1}{\\sqrt{1+x_0}} - \\dfrac{1}{2(1+x_0)^{3/2}}(x - x_0)',
      },
      [-1]: {
        latex: '\\dfrac{1}{1+x}',
        generalLatex:
          '\\dfrac{1}{1+x_0} - \\dfrac{1}{(1+x_0)^2}(x - x_0)',
      },
      2: {
        latex: '(1+x)^2',
        generalLatex: '(1+x_0)^2 + 2(1+x_0)(x - x_0)',
      },
      3: {
        latex: '(1+x)^3',
        generalLatex: '(1+x_0)^3 + 3(1+x_0)^2(x - x_0)',
      },
    },
    x0Range: [-0.6, 3],
    window: 2.4,
    note: 'The workhorse. r = 1/2 gives √(1+x), and r = −1 gives 1/(1+x).',
  },
  {
    key: 'apow',
    label: 'a^x',
    latex: 'a^x',
    section: 'exp',
    number: '2.2.4',
    generalLatex: 'a^{x_0} + a^{x_0}\\ln a\\,(x - x_0)',
    references: [
      {
        label: '0',
        latex: '0',
        value: 0,
        substitutedLatex: 'a^0 + a^0\\ln a\\,(x - 0)',
        approxLatex: '1 + x\\ln a',
      },
      {
        label: '1',
        latex: '1',
        value: 1,
        substitutedLatex: 'a^1 + a^1\\ln a\\,(x - 1)',
        approxLatex: 'a + a\\ln a\\,(x - 1)',
      },
    ],
    exact: (x, a) => Math.pow(a, x),
    derivative: (x, a) => Math.pow(a, x) * Math.log(a),
    param: {
      symbol: 'a',
      initial: 2,
      options: [
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '10', value: 10 },
      ],
    },
    x0Range: [-2, 2.5],
    window: 2.0,
    note: 'Covers e^x too. Set a = e, so ln a = 1.',
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
