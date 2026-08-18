export interface DerivativeRow {
  /** LaTeX for the derivative itself, e.g. "f'(x) = \\cos x" */
  expr: string
  /** LaTeX for its value at 0, e.g. "f'(0) = 1" */
  atZero: string
}

export interface ParamSpec {
  /** LaTeX symbol shown in the picker, e.g. "r" */
  symbol: string
  options: { label: string; value: number }[]
  initial: number
}

export interface FnSpec {
  key: string
  /** Plain-text label used in buttons and aria text. */
  label: string
  /** LaTeX for the function. */
  latex: string
  section: 'trig' | 'exp'
  /** Section number shown in the heading, e.g. "2.1.1.1". */
  number: string
  rows?: DerivativeRow[]
  linearLatex?: string
  quadraticLatex?: string
  /** Set when the function has no expansion at 0 at all. */
  undefinedAtZero?: string
  exact?: (x: number, p: number) => number
  linear?: (x: number, p: number) => number
  quadratic?: (x: number, p: number) => number
  poles?: number[]
  param?: ParamSpec
  /** Short remark shown under the card. */
  note?: string
}

export const SAMPLE_POINTS = [0, 0.01, 0.1, 0.5, 1]

export const FUNCTIONS: FnSpec[] = [
  {
    key: 'sin',
    label: 'sin x',
    latex: '\\sin x',
    section: 'trig',
    number: '2.1.1.1',
    rows: [
      { expr: 'f(x) = \\sin x', atZero: 'f(0) = 0' },
      { expr: "f'(x) = \\cos x", atZero: "f'(0) = 1" },
      { expr: "f''(x) = -\\sin x", atZero: "f''(0) = 0" },
    ],
    linearLatex: 'x',
    quadraticLatex: 'x',
    exact: Math.sin,
    linear: (x) => x,
    quadratic: (x) => x,
    note: 'Odd function, so f″(0) = 0 and the quadratic term vanishes — the quadratic approximation is the linear one.',
  },
  {
    key: 'cos',
    label: 'cos x',
    latex: '\\cos x',
    section: 'trig',
    number: '2.1.1.2',
    rows: [
      { expr: 'f(x) = \\cos x', atZero: 'f(0) = 1' },
      { expr: "f'(x) = -\\sin x", atZero: "f'(0) = 0" },
      { expr: "f''(x) = -\\cos x", atZero: "f''(0) = -1" },
    ],
    linearLatex: '1',
    quadraticLatex: '1 - \\frac{x^2}{2}',
    exact: Math.cos,
    linear: () => 1,
    quadratic: (x) => 1 - (x * x) / 2,
    note: 'Flat at 0, so the linear approximation is just the constant 1. All the information is in the quadratic term.',
  },
  {
    key: 'tan',
    label: 'tan x',
    latex: '\\tan x',
    section: 'trig',
    number: '2.1.1.3',
    rows: [
      { expr: 'f(x) = \\tan x', atZero: 'f(0) = 0' },
      { expr: "f'(x) = \\sec^2 x", atZero: "f'(0) = 1" },
      { expr: "f''(x) = 2\\sec^2 x \\tan x", atZero: "f''(0) = 0" },
    ],
    linearLatex: 'x',
    quadraticLatex: 'x',
    exact: Math.tan,
    linear: (x) => x,
    quadratic: (x) => x,
    poles: [-Math.PI / 2, Math.PI / 2],
    note: 'Also odd, so again the quadratic term vanishes.',
  },
  {
    key: 'sec',
    label: 'sec x',
    latex: '\\sec x',
    section: 'trig',
    number: '2.1.1.4',
    rows: [
      { expr: 'f(x) = \\sec x', atZero: 'f(0) = 1' },
      { expr: "f'(x) = \\sec x \\tan x", atZero: "f'(0) = 0" },
      {
        expr: "f''(x) = \\sec x \\tan^2 x + \\sec^3 x",
        atZero: "f''(0) = 1",
      },
    ],
    linearLatex: '1',
    quadraticLatex: '1 + \\frac{x^2}{2}',
    exact: (x) => 1 / Math.cos(x),
    linear: () => 1,
    quadratic: (x) => 1 + (x * x) / 2,
    poles: [-Math.PI / 2, Math.PI / 2],
    note: 'The mirror of cos x — same flat linear part, opposite sign on the quadratic term.',
  },
  {
    key: 'cot',
    label: 'cot x',
    latex: '\\cot x',
    section: 'trig',
    number: '2.1.1.5',
    undefinedAtZero:
      '\\cot x = \\dfrac{\\cos x}{\\sin x}, \\quad \\sin 0 = 0',
    note: 'No approximation at 0. cot x blows up there, so there is no finite value, slope, or curvature to match.',
  },
  {
    key: 'csc',
    label: 'csc x',
    latex: '\\csc x',
    section: 'trig',
    number: '2.1.1.6',
    undefinedAtZero: '\\csc x = \\dfrac{1}{\\sin x}, \\quad \\sin 0 = 0',
    note: 'Same problem as cot x — undefined at 0, so no expansion exists there.',
  },
  {
    key: 'exp',
    label: 'e^x',
    latex: 'e^x',
    section: 'exp',
    number: '2.1.2.1',
    rows: [
      { expr: 'f(x) = e^x', atZero: 'f(0) = 1' },
      { expr: "f'(x) = e^x", atZero: "f'(0) = 1" },
      { expr: "f''(x) = e^x", atZero: "f''(0) = 1" },
    ],
    linearLatex: '1 + x',
    quadraticLatex: '1 + x + \\frac{x^2}{2}',
    exact: Math.exp,
    linear: (x) => 1 + x,
    quadratic: (x) => 1 + x + (x * x) / 2,
    note: 'Every derivative is e^x, so every coefficient at 0 is 1. This is the cleanest one to remember.',
  },
  {
    key: 'ln',
    label: 'ln(1 + x)',
    latex: '\\ln(1+x)',
    section: 'exp',
    number: '2.1.2.2',
    rows: [
      { expr: 'f(x) = \\ln(1+x)', atZero: 'f(0) = 0' },
      { expr: "f'(x) = \\dfrac{1}{1+x}", atZero: "f'(0) = 1" },
      { expr: "f''(x) = -\\dfrac{1}{(1+x)^2}", atZero: "f''(0) = -1" },
    ],
    linearLatex: 'x',
    quadraticLatex: 'x - \\frac{x^2}{2}',
    exact: (x) => Math.log(1 + x),
    linear: (x) => x,
    quadratic: (x) => x - (x * x) / 2,
    poles: [-1],
    note: 'Written as ln(1 + x) rather than ln x precisely so that the expansion point sits at 0 — ln x has no expansion there.',
  },
  {
    key: 'pow',
    label: '(1 + x)^r',
    latex: '(1+x)^r',
    section: 'exp',
    number: '2.1.2.3',
    rows: [
      { expr: 'f(x) = (1+x)^r', atZero: 'f(0) = 1' },
      { expr: "f'(x) = r(1+x)^{r-1}", atZero: "f'(0) = r" },
      { expr: "f''(x) = r(r-1)(1+x)^{r-2}", atZero: "f''(0) = r(r-1)" },
    ],
    linearLatex: '1 + rx',
    quadraticLatex: '1 + rx + \\frac{r(r-1)}{2}x^2',
    exact: (x, r) => Math.pow(1 + x, r),
    linear: (x, r) => 1 + r * x,
    quadratic: (x, r) => 1 + r * x + ((r * (r - 1)) / 2) * x * x,
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
    note: 'The workhorse. r = 1/2 gives √(1+x), r = −1 gives 1/(1+x). At r = 2 the quadratic approximation is exact — (1+x)² already is a quadratic, so there is nothing to discard.',
  },
  {
    key: 'apow',
    label: 'a^x',
    latex: 'a^x',
    section: 'exp',
    number: '2.1.2.4',
    rows: [
      { expr: 'f(x) = a^x', atZero: 'f(0) = 1' },
      { expr: "f'(x) = a^x \\ln a", atZero: "f'(0) = \\ln a" },
      { expr: "f''(x) = a^x \\ln^2 a", atZero: "f''(0) = \\ln^2 a" },
    ],
    linearLatex: '1 + x\\ln a',
    quadraticLatex: '1 + x\\ln a + \\frac{\\ln^2 a}{2}x^2',
    exact: (x, a) => Math.pow(a, x),
    linear: (x, a) => 1 + x * Math.log(a),
    quadratic: (x, a) =>
      1 + x * Math.log(a) + ((Math.log(a) * Math.log(a)) / 2) * x * x,
    param: {
      symbol: 'a',
      initial: 2,
      options: [
        { label: '2', value: 2 },
        { label: '3', value: 3 },
        { label: '10', value: 10 },
      ],
    },
    note: 'Generalises e^x — set a = e and ln a = 1, recovering 1 + x + x²/2.',
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
