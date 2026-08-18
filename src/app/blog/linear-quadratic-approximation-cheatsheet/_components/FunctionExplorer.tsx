'use client'

import { useState } from 'react'
import clsx from 'clsx'

import { Plot } from './Plot'
import { SAMPLE_POINTS, formatValue, getFunction } from './functions'

function Toggle({
  checked,
  onChange,
  color,
  children,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  color: string
  children: React.ReactNode
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-zinc-600 select-none dark:text-zinc-400">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-zinc-300 accent-teal-500 dark:border-zinc-600"
      />
      <span className={clsx('h-0.5 w-4 rounded-full', color)} />
      {children}
    </label>
  )
}

export function FunctionExplorer({ fnKey }: { fnKey: string }) {
  let fn = getFunction(fnKey)

  let [showLinear, setShowLinear] = useState(true)
  let [showQuadratic, setShowQuadratic] = useState(true)
  let [param, setParam] = useState(fn.param?.initial ?? 0)
  let [zoom, setZoom] = useState(1.5)

  if (!fn.exact || !fn.linear || !fn.quadratic) {
    return null
  }

  let exact = (x: number) => fn.exact!(x, param)
  let linear = (x: number) => fn.linear!(x, param)
  let quadratic = (x: number) => fn.quadratic!(x, param)

  return (
    <div className="mt-5">
      {fn.param && (
        <div className="mb-5 flex flex-wrap items-center gap-2">
          <span className="mr-1 font-mono text-sm text-zinc-500 dark:text-zinc-400">
            {fn.param.symbol} =
          </span>
          {fn.param.options.map((option) => (
            <button
              key={option.label}
              type="button"
              onClick={() => setParam(option.value)}
              aria-pressed={option.value === param}
              className={clsx(
                'rounded-full px-3 py-1 font-mono text-sm transition',
                option.value === param
                  ? 'bg-teal-500 text-white'
                  : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[30rem] text-left text-sm">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="py-2 pr-4 font-medium">x</th>
              <th className="py-2 pr-4 text-right font-medium">direct</th>
              <th className="py-2 pr-4 text-right font-medium">linear</th>
              <th className="py-2 pr-4 text-right font-medium">quadratic</th>
              <th className="py-2 text-right font-medium">quad. error</th>
            </tr>
          </thead>
          <tbody>
            {SAMPLE_POINTS.map((x) => {
              let e = exact(x)
              return (
                <tr
                  key={x}
                  className="border-t border-zinc-200 dark:border-zinc-800"
                >
                  <td className="py-2 pr-4 font-mono text-zinc-700 dark:text-zinc-300">
                    {x}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-zinc-800 dark:text-zinc-200">
                    {formatValue(e)}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-teal-600 dark:text-teal-400">
                    {formatValue(linear(x))}
                  </td>
                  <td className="py-2 pr-4 text-right font-mono text-sky-600 dark:text-sky-400">
                    {formatValue(quadratic(x))}
                  </td>
                  <td className="py-2 text-right font-mono text-zinc-500 dark:text-zinc-400">
                    {formatValue(Math.abs(quadratic(x) - e))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-6 rounded-xl bg-white p-3 dark:bg-zinc-950/50">
        <Plot
          exact={exact}
          linear={linear}
          quadratic={quadratic}
          window={zoom}
          showLinear={showLinear}
          showQuadratic={showQuadratic}
          poles={fn.poles}
          label={fn.label}
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-3">
        <span className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <span className="h-0.5 w-4 rounded-full bg-zinc-400 dark:bg-zinc-300" />
          {fn.label}
        </span>
        <Toggle
          checked={showLinear}
          onChange={setShowLinear}
          color="bg-teal-500"
        >
          linear
        </Toggle>
        <Toggle
          checked={showQuadratic}
          onChange={setShowQuadratic}
          color="bg-sky-500"
        >
          quadratic
        </Toggle>
      </div>

      <label className="mt-4 block">
        <span className="flex items-baseline justify-between text-sm text-zinc-500 dark:text-zinc-400">
          <span>zoom (window ±)</span>
          <span className="font-mono">{zoom.toFixed(2)}</span>
        </span>
        <input
          type="range"
          min={0.1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(event) => setZoom(Number(event.target.value))}
          className="mt-2 w-full accent-teal-500"
        />
      </label>
    </div>
  )
}
