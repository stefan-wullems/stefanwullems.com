import { Math as Tex } from './Math'
import { Plot } from './Plot'
import { Tabs } from './Tabs'
import { STEPS, getFunction, quadraticLatex } from './functions'
import type { FnSpec, Reference } from './functions'

function formatValueLatex(value: number, digits = 6) {
  if (!Number.isFinite(value)) return '\\text{--}'
  if (value !== 0 && Math.abs(value) < 1e-4) {
    let [mantissa, exp] = value.toExponential(2).split('e')
    return `${mantissa} \\times 10^{${Number(exp)}}`
  }
  return value.toFixed(digits)
}

function ReferencePanel({
  fn,
  reference,
  param,
}: {
  fn: FnSpec
  reference: Reference
  param: number
}) {
  let x0 = reference.value
  let f0 = fn.exact(x0, param)
  let slope = fn.derivative(x0, param)
  let curvature = fn.secondDerivative(x0, param)

  let exact = (x: number) => fn.exact(x, param)
  let linear = (x: number) => f0 + slope * (x - x0)
  let quadratic = (x: number) =>
    f0 + slope * (x - x0) + (curvature / 2) * (x - x0) * (x - x0)

  let substituted = quadraticLatex(
    fn.g0(reference.latex),
    fn.g1(reference.latex),
    fn.g2(reference.latex),
    reference.latex,
  )
  let simplified = quadraticLatex(
    reference.c0,
    reference.c1,
    reference.c2,
    reference.latex,
  )

  return (
    <>
      <div className="mt-4 rounded-lg border border-violet-500/30 bg-white px-4 py-3 dark:bg-zinc-950/50">
        <div className="flex items-baseline gap-1 text-xs font-medium tracking-wide text-violet-600 uppercase dark:text-violet-400">
          at <Tex className="normal-case">{reference.latex}</Tex>
        </div>
        <div className="mt-1 grid grid-cols-[auto_auto_1fr] items-baseline gap-x-2 gap-y-1.5 text-zinc-900 dark:text-zinc-100">
          <div className="text-right">
            <Tex>{fn.latex}</Tex>
          </div>
          <div>
            <Tex>{'\\approx'}</Tex>
          </div>
          <div>
            <Tex>{substituted}</Tex>
          </div>
          <div />
          <div>
            <Tex>{'\\approx'}</Tex>
          </div>
          <div>
            <Tex>{simplified}</Tex>
          </div>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[38rem] text-right text-sm">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400">
              <th className="py-2 pr-4 text-right font-medium"></th>
              <th className="py-2 pr-4 text-right font-medium">
                <Tex>{'f(x)'}</Tex>
              </th>
              <th className="py-2 pr-4 text-right font-medium text-teal-600 dark:text-teal-400">
                <Tex>{'\\tilde f_1(x)'}</Tex>
              </th>
              <th className="py-2 pr-4 text-right font-medium text-violet-600 dark:text-violet-400">
                <Tex>{'\\tilde f_2(x)'}</Tex>
              </th>
              <th className="py-2 pr-4 text-right font-medium text-zinc-400 dark:text-zinc-500">
                linear error
              </th>
              <th className="py-2 text-right font-medium text-rose-600 dark:text-rose-400">
                quad. error
              </th>
            </tr>
          </thead>
          <tbody>
            {STEPS.map((step) => {
              let x = x0 + step.value
              let e = exact(x)
              let l = linear(x)
              let q = quadratic(x)
              return (
                <tr
                  key={step.latex}
                  className="border-t border-zinc-200 dark:border-zinc-800"
                >
                  <td className="py-2 pr-4 text-zinc-700 dark:text-zinc-300">
                    <Tex>{`${reference.latex} + ${step.latex}`}</Tex>
                  </td>
                  <td className="py-2 pr-4 text-zinc-800 dark:text-zinc-200">
                    <Tex>{formatValueLatex(e)}</Tex>
                  </td>
                  <td className="py-2 pr-4 text-teal-600 dark:text-teal-400">
                    <Tex>{formatValueLatex(l)}</Tex>
                  </td>
                  <td className="py-2 pr-4 text-violet-600 dark:text-violet-400">
                    <Tex>{formatValueLatex(q)}</Tex>
                  </td>
                  <td className="py-2 pr-4 text-zinc-400 dark:text-zinc-500">
                    <Tex>{formatValueLatex(Math.abs(l - e))}</Tex>
                  </td>
                  <td className="py-2 text-rose-600 dark:text-rose-400">
                    <Tex>{formatValueLatex(Math.abs(q - e))}</Tex>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-5 rounded-xl bg-white p-3 dark:bg-zinc-950/50">
        <Plot
          exact={exact}
          linear={linear}
          quadratic={quadratic}
          center={x0}
          window={fn.window}
          poles={fn.poles}
          markers={STEPS.map((step) => x0 + step.value)}
          label={fn.label}
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-zinc-600 dark:text-zinc-400">
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full bg-zinc-400 dark:bg-zinc-300" />
          <Tex>{fn.latex}</Tex>
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full bg-teal-500/70" />
          <Tex>{'\\tilde f_1'}</Tex>
        </span>
        <span className="flex items-center gap-2">
          <span className="h-0.5 w-4 rounded-full bg-violet-500" />
          <Tex>{'\\tilde f_2'}</Tex>
        </span>
      </div>
    </>
  )
}

function ForParam({ fn, param }: { fn: FnSpec; param: number }) {
  let variant = fn.paramVariants?.[param]

  return (
    <>
      <div className="mt-4 grid grid-cols-[auto_auto_1fr] items-baseline gap-x-2 text-zinc-900 dark:text-zinc-100">
        <div className="text-right">
          <Tex>{variant?.latex ?? fn.latex}</Tex>
        </div>
        <div>
          <Tex>{'\\approx'}</Tex>
        </div>
        <div>
          <Tex>
            {quadraticLatex(fn.g0('x_0'), fn.g1('x_0'), fn.g2('x_0'), 'x_0')}
          </Tex>
        </div>
      </div>
      <div className="mt-4">
        <Tabs
          name={`q-${fn.key}-${param}-ref`}
          legend="reference"
          items={fn.references.map((reference, index) => ({
            key: String(index),
            label: <Tex>{reference.latex}</Tex>,
            content: (
              <ReferencePanel fn={fn} reference={reference} param={param} />
            ),
          }))}
        />
      </div>
    </>
  )
}

export function FunctionCard({ fn: fnKey }: { fn: string }) {
  let fn = getFunction(fnKey)

  return (
    <section
      id={`fn-${fn.key}`}
      className="not-prose mt-8 scroll-mt-24 rounded-2xl border border-zinc-200 bg-zinc-50 p-5 sm:p-6 dark:border-zinc-800 dark:bg-zinc-900/60"
    >
      <h5 className="flex items-baseline gap-3">
        <span className="text-sm text-zinc-400 dark:text-zinc-500">
          {fn.number}
        </span>
        <Tex className="text-xl text-zinc-900 dark:text-zinc-100">
          {fn.latex}
        </Tex>
      </h5>

      {fn.param ? (
        <div className="mt-4">
          <Tabs
            name={`q-${fn.key}-param`}
            legend={`${fn.param.symbol} =`}
            items={fn.param.options.map((option, index) => ({
              key: String(index),
              label: option.label,
              content: <ForParam fn={fn} param={option.value} />,
            }))}
          />
        </div>
      ) : (
        <ForParam fn={fn} param={0} />
      )}

      {fn.note && (
        <p className="mt-5 border-t border-zinc-200 pt-4 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          {fn.note}
        </p>
      )}
    </section>
  )
}
