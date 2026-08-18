'use client'

import { useState } from 'react'
import clsx from 'clsx'

import { FUNCTIONS, formatValue } from './functions'

const PRESETS = [0.001, 0.01, 0.1, 0.5, 1]

export function ComparisonTable() {
  let [x, setX] = useState(0.1)

  return (
    <div className="not-prose rounded-2xl border border-zinc-200 p-4 sm:p-6 dark:border-zinc-700/60">
      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm text-zinc-500 dark:text-zinc-400">
          x =
        </span>
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => setX(preset)}
            aria-pressed={preset === x}
            className={clsx(
              'rounded-full px-3 py-1 font-mono text-sm transition',
              preset === x
                ? 'bg-teal-500 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
            )}
          >
            {preset}
          </button>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="py-2 pr-4 font-medium">f</th>
              <th className="py-2 pr-4 text-right font-medium">calculator</th>
              <th className="py-2 pr-4 text-right font-medium">linear</th>
              <th className="py-2 pr-4 text-right font-medium">error</th>
              <th className="py-2 pr-4 text-right font-medium">quadratic</th>
              <th className="py-2 text-right font-medium">error</th>
            </tr>
          </thead>
          <tbody>
            {FUNCTIONS.map((fn) => {
              let exact = fn.exact(x)
              let linear = fn.linear(x)
              let quadratic = fn.quadratic(x)

              return (
                <tr
                  key={fn.key}
                  className="border-t border-zinc-100 dark:border-zinc-800"
                >
                  <td className="py-2 pr-4 text-zinc-800 dark:text-zinc-200">
                    {fn.label}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-zinc-800 dark:text-zinc-200">
                    {formatValue(exact)}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-teal-600 dark:text-teal-400">
                    {formatValue(linear)}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-zinc-500 dark:text-zinc-400">
                    {formatValue(Math.abs(linear - exact))}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-sky-600 dark:text-sky-400">
                    {formatValue(quadratic)}
                  </td>
                  <td className="py-2 text-right font-mono text-zinc-500 dark:text-zinc-400">
                    {formatValue(Math.abs(quadratic - exact))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
        Step x down by 10× and the linear error drops ~100×, the quadratic error
        ~1000×. Errors scale like x² and x³.
      </p>
    </div>
  )
}
