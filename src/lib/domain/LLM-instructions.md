0) Scope

This rule applies only to "/domain" (business logic). The domain exposes pure functions over plain data and is independent of frameworks, IO, databases, HTTP, UI, and runtime side-effects.

1) First Principles

Purity: Every domain function is pure (no side effects, no mutation, no IO, no randomness, no clock).

Plain Data: Operate on plain data structures (records/maps, arrays/vectors, sets). No classes, no ORM entities, no framework objects.

Declarative: Prefer descriptions over procedures; tell what to compute, not how to iterate. Use higher-order combinators (map/filter/reduce/group) and function composition.

Composition > Inheritance: Build behavior by composing small, data-agnostic functions (think Lodash/ramda-style utilities).

Happy Path Only: Assume inputs are valid and complete. Do not implement validation or error branches inside the domain; that belongs to the boundary.

Boundary Contracts: Validation, parsing, coercion, and side-effects happen outside the domain. The domain consumes already-validated plain data.

Determinism: Same inputs → same outputs. No hidden global state; no reliance on call order.

Test-Driven Confidence: High-coverage unit and property tests; the tests document the business rules.

No types, just javscript: Internally, no types to reduce boilerplate and ceremony that isn't business logic.
