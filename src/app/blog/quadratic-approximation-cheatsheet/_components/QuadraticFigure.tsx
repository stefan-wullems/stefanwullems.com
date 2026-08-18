import { Math } from './Math'
import { QuadraticPlot } from './QuadraticPlot'

/**
 * The labels never change, only the numbers do — so they are rendered to LaTeX
 * here on the server and handed to the client plot as nodes. That keeps katex
 * out of the browser bundle.
 */
export function QuadraticFigure() {
  return (
    <QuadraticPlot
      labels={{
        x0: <Math>{'x_0'}</Math>,
        dx: <Math>{'\\Delta x'}</Math>,
        fx0: <Math>{'f(x_0)'}</Math>,
        linear: <Math>{'\\tilde f_1(x)'}</Math>,
        approx: <Math>{'\\tilde f_2(x)'}</Math>,
        exact: <Math>{'f(x)'}</Math>,
        linearError: (
          <>
            linear error{' '}
            <span className="text-zinc-400 dark:text-zinc-500">
              (<Math>{'\\left| f(x) - \\tilde f_1(x) \\right|'}</Math>)
            </span>
          </>
        ),
        error: (
          <>
            quadratic error{' '}
            <span className="text-zinc-400 dark:text-zinc-500">
              (<Math>{'\\left| f(x) - \\tilde f_2(x) \\right|'}</Math>)
            </span>
          </>
        ),
      }}
    />
  )
}
