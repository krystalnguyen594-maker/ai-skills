---
name: technical-design
description: >-
  Design a system or a change before it is built: structuring a technical design
  document, non-functional requirements checklist, comparing options with an honest
  trade-off table, and recording decisions as ADRs. Covers when a decision is worth
  writing down and when it is not.

  Trigger immediately when:
  - Designing a feature, service, integration, or data model before implementation.
  - Choosing between technical options (library, framework, storage, protocol, pattern).
  - Writing or reviewing an architecture decision record (ADR) or design document.
  - A change crosses service boundaries, alters a schema, or is hard to reverse.
---

# Technical Design

Design work earns its cost only when the decision is **expensive to reverse**. For
anything cheap to change, skip this and let the code be the design.

## Is this worth designing?

Write a design when at least one is true:

- Reversing it later costs more than a week.
- It changes a contract other teams or services depend on.
- It touches auth, payments, or personal data.
- It changes a data schema or needs a migration.
- More than one person will build against it in parallel.

Otherwise: decide in a sentence, note it in the PR, move on. A design document for
a reversible decision is waste that also creates false authority.

## Design document structure

Keep it to what someone needs to build and to challenge. Two pages beats twenty.

```markdown
# Design: <name>

## Problem
<what breaks or is impossible today; who is affected; the constraint that makes
this non-trivial. Not "we need feature X".>

## Constraints
<budget, deadline, team skill, existing stack, compliance, things that cannot change>

## Non-functional requirements
<see checklist below — only the ones that actually bind, with numbers>

## Options considered
<trade-off table — see below>

## Decision
<the chosen option and why it wins given the constraints above>

## Design
<components, responsibilities, data flow, contracts. One diagram if it shows the
mechanism; no diagram if it only decorates.>

## What this forecloses
<what becomes hard or impossible after this; the exit path if we are wrong>

## Risks and open questions
<what we do not know yet, and what would resolve it>
```

`What this forecloses` is the section that separates a design from a proposal.
Every design closes doors; say which.

## Non-functional requirements checklist

Do not list all of these. Pick the ones that **bind**, and attach a number to each.
An NFR without a number is a wish.

- **Load** — expected and peak; what happens past peak
- **Latency** — target at p50 and p95, for which operations
- **Data volume** — today, and in 2 years; growth rate
- **Availability** — what downtime is acceptable, and who notices
- **Consistency** — where eventual consistency is acceptable, where it is not
- **Security** — authn/authz model, what data is sensitive, blast radius of a breach
- **Privacy / retention** — what is stored, for how long, who can read it
- **Failure modes** — what happens when each dependency is down or slow
- **Observability** — how you will know it broke, before a user tells you
- **Operability** — who runs it, how it is deployed, how it is rolled back
- **Cost** — infrastructure and licence cost at expected scale

"Fast", "scalable", and "secure" are not requirements. `p95 < 300ms at 200 rps` is.

## Trade-off table

Never present one option. A single option is a decision already made, dressed up
as analysis.

| Option | How it works | Wins | Costs | Forecloses | Reversible? |
|---|---|---|---|---|---|
| A | | | | | cheap / costly |
| B | | | | | |
| Do nothing | | | | | |

Rules:
- Include **do nothing** every time. Often it wins, and if it clearly loses, saying
  so is the strongest argument for acting.
- No straw men. If an option is only there to lose, delete it.
- State the constraint that decides it. If two options are close, say they are close
  and name the tiebreaker, rather than manufacturing a reason.

## ADR — recording the decision

One ADR per decision, short, immutable. Supersede rather than edit.

```markdown
# ADR-<n>: <decision in one line>
**Status:** proposed | accepted | superseded by ADR-<n>
**Date:** <YYYY-MM-DD>

## Context
<the forces at play: constraints, requirements, what we knew at the time>

## Decision
<what we chose, in active voice: "We will ...">

## Consequences
<what becomes easier, what becomes harder, what we accept as a cost>

## Alternatives rejected
<option + the specific reason it lost>
```

Write the ADR **when the decision is made**, not at the end of the project. The
context evaporates within a week, and context is the only part that helps the
person who later asks "why on earth is it like this".

Check whether the project already stores ADRs via `codebase-memory` (`manage_adr`)
before creating a parallel folder.

## Think before you design

Invoke `pm-questioning`. At minimum:

- **First principles** — what is actually required here, separated from how similar
  systems are usually built?
- **Inversion** — how would this design fail in production? Which dependency being
  slow, not down, breaks it worst?
- **Second-order** — in two years, with 10x data and different people, what does this
  design force them to do?

## Hard rules

- Never design past what the requirement asks for. Generality you were not asked for
  is a cost you pay now for an option you may never use.
- Never present one option as if it were an analysis.
- Never write an NFR without a number.
- Never record a decision without its rejected alternatives; without them the ADR
  cannot stop the same debate reopening.
- If you are uncertain, run a timeboxed spike and say what would settle it. A spike
  is throwaway code — never merge it.
