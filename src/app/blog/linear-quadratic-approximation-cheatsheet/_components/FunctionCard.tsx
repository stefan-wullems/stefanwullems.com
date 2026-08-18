import { FunctionExplorer } from './FunctionExplorer'
import { Math } from './Math'
import { getFunction } from './functions'

export function FunctionCard({ fn: fnKey }: { fn: string }) {
  let fn = getFunction(fnKey)

  return (
    <section
      id={`fn-${fn.key}`}
      className="not-prose mt-8 scroll-mt-24 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/60"
    >
      <h5 className="flex items-baseline gap-3">
        <span className="font-mono text-sm text-zinc-400 dark:text-zinc-500">
          {fn.number}
        </span>
        <Math className="text-xl text-zinc-900 dark:text-zinc-100">
          {fn.latex}
        </Math>
      </h5>

      {fn.undefinedAtZero ? (
        <div className="mt-4">
          <div className="rounded-lg bg-white px-4 py-3 dark:bg-zinc-950/50">
            <Math display>{fn.undefinedAtZero}</Math>
          </div>
          <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-400">
            {fn.note}
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[24rem] text-left text-sm">
              <tbody>
                {fn.rows?.map((row) => (
                  <tr
                    key={row.expr}
                    className="border-t border-zinc-200 first:border-t-0 dark:border-zinc-800"
                  >
                    <td className="py-2 pr-6">
                      <Math className="text-zinc-800 dark:text-zinc-200">
                        {row.expr}
                      </Math>
                    </td>
                    <td className="py-2 text-right">
                      <Math className="text-zinc-800 dark:text-zinc-200">
                        {row.atZero}
                      </Math>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <dl className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-teal-500/30 bg-white px-4 py-3 dark:bg-zinc-950/50">
              <dt className="text-xs font-medium tracking-wide text-teal-600 uppercase dark:text-teal-400">
                linear
              </dt>
              <dd className="mt-1">
                <Math className="text-zinc-900 dark:text-zinc-100">
                  {`${fn.latex} \\approx ${fn.linearLatex}`}
                </Math>
              </dd>
            </div>
            <div className="rounded-lg border border-sky-500/30 bg-white px-4 py-3 dark:bg-zinc-950/50">
              <dt className="text-xs font-medium tracking-wide text-sky-600 uppercase dark:text-sky-400">
                quadratic
              </dt>
              <dd className="mt-1">
                <Math className="text-zinc-900 dark:text-zinc-100">
                  {`${fn.latex} \\approx ${fn.quadraticLatex}`}
                </Math>
              </dd>
            </div>
          </dl>

          <FunctionExplorer fnKey={fn.key} />

          {fn.note && (
            <p className="mt-5 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              {fn.note}
            </p>
          )}
        </>
      )}
    </section>
  )
}
