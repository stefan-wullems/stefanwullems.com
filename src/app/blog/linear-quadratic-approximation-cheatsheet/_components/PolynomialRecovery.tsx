'use client'

import { useState } from 'react'

function term(coefficient: number, suffix: string) {
  let rounded = Number(coefficient.toFixed(2))
  let sign = rounded < 0 ? '−' : '+'
  return `${sign} ${Math.abs(rounded)}${suffix}`
}

function polynomial(a: number, b: number, c?: number) {
  let head = `${Number(a.toFixed(2))}`
  let parts = [head, term(b, 'x')]
  if (c !== undefined) {
    parts.push(term(c, 'x²'))
  }
  return parts.join(' ')
}

function Slider({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (value: number) => void
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between text-sm text-zinc-600 dark:text-zinc-400">
        <span>{label}</span>
        <span className="font-mono text-zinc-800 dark:text-zinc-200">
          {value.toFixed(2)}
        </span>
      </span>
      <input
        type="range"
        min={-3}
        max={3}
        step={0.25}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="mt-2 w-full accent-teal-500"
      />
    </label>
  )
}

function Row({
  label,
  value,
  mono = true,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-zinc-100 py-2 dark:border-zinc-800">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span
        className={
          mono
            ? 'font-mono text-sm text-zinc-800 dark:text-zinc-200'
            : 'text-sm text-zinc-800 dark:text-zinc-200'
        }
      >
        {value}
      </span>
    </div>
  )
}

export function PolynomialRecovery() {
  let [a, setA] = useState(2)
  let [b, setB] = useState(-1)
  let [c, setC] = useState(0.5)

  return (
    <div className="not-prose rounded-2xl border border-zinc-200 p-4 sm:p-6 dark:border-zinc-700/60">
      <div className="grid gap-4 sm:grid-cols-3">
        <Slider label="a" value={a} onChange={setA} />
        <Slider label="b" value={b} onChange={setB} />
        <Slider label="c" value={c} onChange={setC} />
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <div>
          <h4 className="text-sm font-semibold text-teal-600 dark:text-teal-400">
            Linear approximation of a + bx
          </h4>
          <Row label="f(x)" value={polynomial(a, b)} />
          <Row label="f(0)" value={`${Number(a.toFixed(2))}`} />
          <Row label="f′(0)" value={`${Number(b.toFixed(2))}`} />
          <Row
            label="f(0) + f′(0)x"
            value={polynomial(a, b)}
          />
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Identical to f. The line was already the answer.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-sky-600 dark:text-sky-400">
            Quadratic approximation of a + bx + cx²
          </h4>
          <Row label="g(x)" value={polynomial(a, b, c)} />
          <Row label="g(0)" value={`${Number(a.toFixed(2))}`} />
          <Row label="g′(0)" value={`${Number(b.toFixed(2))}`} />
          <Row label="g″(0)" value={`${Number((2 * c).toFixed(2))}`} />
          <Row
            label="g(0) + g′(0)x + g″(0)x²/2"
            value={polynomial(a, b, c)}
          />
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Identical to g. Note g″(0) = 2c, so the ÷2 is what recovers c.
          </p>
        </div>
      </div>
    </div>
  )
}
