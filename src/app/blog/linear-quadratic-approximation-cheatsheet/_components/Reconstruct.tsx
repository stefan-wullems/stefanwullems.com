'use client'

import { useState } from 'react'

function num(value: number) {
  return `${Number(value.toFixed(2))}`
}

function term(coefficient: number, suffix: string) {
  let rounded = Number(coefficient.toFixed(2))
  return `${rounded < 0 ? '−' : '+'} ${Math.abs(rounded)}${suffix}`
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
        <span className="font-mono">{label}</span>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-zinc-200 py-2 dark:border-zinc-800">
      <span className="text-sm text-zinc-500 dark:text-zinc-400">{label}</span>
      <span className="font-mono text-sm text-zinc-800 dark:text-zinc-200">
        {value}
      </span>
    </div>
  )
}

export function Reconstruct({ order }: { order: 'linear' | 'quadratic' }) {
  let isLinear = order === 'linear'
  let [a, setA] = useState(2)
  let [b, setB] = useState(-1)
  let [c, setC] = useState(0.5)

  let original = isLinear
    ? `${num(a)} ${term(b, 'x')}`
    : `${num(a)} ${term(b, 'x')} ${term(c, 'x²')}`

  return (
    <div className="not-prose mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/60">
      <div className={isLinear ? 'grid gap-4 sm:grid-cols-2' : 'grid gap-4 sm:grid-cols-3'}>
        <Slider label="a" value={a} onChange={setA} />
        <Slider label="b" value={b} onChange={setB} />
        {!isLinear && <Slider label="c" value={c} onChange={setC} />}
      </div>

      <div className="mt-6">
        <Row label={isLinear ? 'f(x)' : 'g(x)'} value={original} />
        <Row label={isLinear ? 'f(0)' : 'g(0)'} value={num(a)} />
        <Row label={isLinear ? 'f′(0)' : 'g′(0)'} value={num(b)} />
        {!isLinear && <Row label="g″(0)" value={num(2 * c)} />}
        <Row
          label={
            isLinear ? 'f(0) + f′(0)·x' : 'g(0) + g′(0)·x + g″(0)·x²/2'
          }
          value={original}
        />
      </div>

      <p className="mt-5 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
        {isLinear ? (
          <>
            The last row always matches the first. Approximating something that
            is already a line hands the line straight back.
          </>
        ) : (
          <>
            The last row always matches the first. Note{' '}
            <span className="font-mono">g″(0) = 2c</span> — the ÷2 in the formula
            is exactly what undoes that and recovers{' '}
            <span className="font-mono">c</span>.
          </>
        )}
      </p>
    </div>
  )
}
