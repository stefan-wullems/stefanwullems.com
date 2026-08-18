import { Math } from './Math'
import { TangentPlot } from './TangentPlot'

/**
 * The labels never change, only the numbers do — so they are rendered to LaTeX
 * here on the server and handed to the client plot as nodes. That keeps katex
 * out of the browser bundle.
 */
export function TangentFigure() {
  return (
    <TangentPlot
      labels={{
        x0: <Math>{'x_0'}</Math>,
        dx: <Math>{'\\Delta x'}</Math>,
        fx0: <Math>{'f(x_0)'}</Math>,
        approx: <Math>{'\\tilde f(x)'}</Math>,
        exact: <Math>{'f(x)'}</Math>,
        error: (
          <>
            error{' '}
            <span className="text-zinc-400 dark:text-zinc-500">
              (
              <Math>{'\\left| f(x) - \\tilde f(x) \\right|'}</Math>
              )
            </span>
          </>
        ),
      }}
    />
  )
}
