'use client'

import { useState } from 'react'
import clsx from 'clsx'

import { Plot } from './Plot'
import { FUNCTIONS, formatValue, getFunction } from './functions'

function Swatch({ className, children }: { className: string; children: React.ReactNode }) {
  return (
    <span className="flex items-center gap-2">
      <span className={clsx('h-0.5 w-4 rounded-full', className)} />
      {children}
    </span>
  )
}

export function Explorer() {
  let [key, setKey] = useState('exp')
  let [at, setAt] = useState(0.5)
  let [window, setWindow] = useState(2)

  let fn = getFunction(key)

  let exact = fn.exact(at)
  let linear = fn.linear(at)
  let quadratic = fn.quadratic(at)

  let rows = [
    {
      name: 'exact',
      value: exact,
      error: null as number | null,
      className: 'text-zinc-800 dark:text-zinc-100',
    },
    {
      name: `linear — ${fn.linearLabel}`,
      value: linear,
      error: Math.abs(linear - exact),
      className: 'text-teal-600 dark:text-teal-400',
    },
    {
      name: `quadratic — ${fn.quadraticLabel}`,
      value: quadratic,
      error: Math.abs(quadratic - exact),
      className: 'text-sky-600 dark:text-sky-400',
    },
  ]

  return (
    <div className="not-prose rounded-2xl border border-zinc-200 p-4 sm:p-6 dark:border-zinc-700/60">
      <div className="flex flex-wrap gap-2">
        {FUNCTIONS.map((option) => (
          <button
            key={option.key}
            type="button"
            onClick={() => setKey(option.key)}
            aria-pressed={option.key === key}
            className={clsx(
              'rounded-full px-3 py-1 text-sm transition',
              option.key === key
                ? 'bg-teal-500 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        <Plot
          fn={fn}
          window={window}
          at={at}
          showLinear
          showQuadratic
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        <Swatch className="bg-zinc-800 dark:bg-zinc-100">{fn.label}</Swatch>
        <Swatch className="bg-teal-500">linear</Swatch>
        <Swatch className="bg-sky-500">quadratic</Swatch>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="flex items-baseline justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>evaluate at x</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200">
              {at.toFixed(2)}
            </span>
          </span>
          <input
            type="range"
            min={-window}
            max={window}
            step={window / 100}
            value={at}
            onChange={(event) => setAt(Number(event.target.value))}
            className="mt-2 w-full accent-teal-500"
          />
        </label>

        <label className="block">
          <span className="flex items-baseline justify-between text-sm text-zinc-600 dark:text-zinc-400">
            <span>zoom (window ±)</span>
            <span className="font-mono text-zinc-800 dark:text-zinc-200">
              {window.toFixed(2)}
            </span>
          </span>
          <input
            type="range"
            min={0.1}
            max={3}
            step={0.05}
            value={window}
            onChange={(event) => {
              let next = Number(event.target.value)
              setWindow(next)
              setAt((previous) =>
                Math.max(-next, Math.min(next, previous)),
              )
            }}
            className="mt-2 w-full accent-teal-500"
          />
        </label>
      </div>

      <table className="mt-6 w-full text-left text-sm">
        <thead>
          <tr className="text-zinc-500 dark:text-zinc-400">
            <th className="py-2 font-medium">at x = {at.toFixed(2)}</th>
            <th className="py-2 text-right font-medium">value</th>
            <th className="py-2 text-right font-medium">error</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={row.name}
              className="border-t border-zinc-100 dark:border-zinc-800"
            >
              <td className={clsx('py-2', row.className)}>{row.name}</td>
              <td className="py-2 text-right font-mono text-zinc-800 dark:text-zinc-200">
                {formatValue(row.value)}
              </td>
              <td className="py-2 text-right font-mono text-zinc-500 dark:text-zinc-400">
                {row.error === null ? '—' : formatValue(row.error)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        Drag the zoom slider toward 0 — the three curves become
        indistinguishable. That is the whole idea.
      </p>
    </div>
  )
}
