---
name: test-strategy
description: >-
  Decide WHAT to test and how much, before writing any test. Risk-based scoping,
  test layer selection, entry/exit criteria, quality gates, and regression scope.
  Complements testing-quality, which covers HOW to write the tests.

  Trigger immediately when:
  - Planning testing for a feature, release, sprint, or regression cycle.
  - Deciding test coverage, scope, or what to skip under time pressure.
  - Defining a quality gate, release readiness, or exit criteria.
  - Asked "is this enough testing?" or "what should we test first?".
---

# Test Strategy

Testing everything is not a strategy — it is an absence of one. The job is to spend
limited test effort where failure is most likely and most expensive.

## Step 1 — Risk table

Score every area touched by the change. Do this before choosing any tool.

| Area / flow | Impact if it breaks (1–5) | Likelihood of breaking (1–5) | Risk | Test depth |
|---|---|---|---|---|
| <flow> | | | I × L | deep / normal / smoke / none |

**Impact 5:** money, auth, data loss, legal, or a flow every user hits.
**Likelihood 5:** changed in this release, complex logic, weak existing coverage,
many integration points, or it has broken before.

Depth mapping: risk 16–25 → deep; 9–15 → normal; 4–8 → smoke; 1–3 → none.

**Write down what you chose not to test, and why.** An untested area that nobody
decided to skip is a hole; one that was decided is an accepted risk. Put it in the
handoff packet.

## Step 2 — Pick the layer

Test at the **cheapest layer that can actually catch the failure**.

| Failure type | Test at |
|---|---|
| Business rule, calculation, validation | Unit |
| Contract between services, payload shape, status codes | API / integration |
| Data written or migrated correctly | Integration + direct data check |
| Multi-step user flow, auth, navigation | E2E (few, high-value only) |
| Layout, spacing, visual regression | Visual snapshot, not E2E assertions |
| Behaviour under load or concurrency | Dedicated perf test, not functional |
| Exploratory / unknown unknowns | Manual charter session |

E2E is the most expensive and flakiest layer. If a rule can be checked in a unit
test, checking it through the UI is waste.

## Step 3 — Exploratory charters

Automated tests only find what someone already thought of. Reserve time for
charters, written like this:

```
Explore <area> with <persona / data / condition>
to discover <what kind of problem>.
Timebox: <30–60 min>
```

Example: *Explore checkout with an expired card and a slow network to discover
error-handling and double-charge problems. Timebox 45 min.*

Run charters on the highest-risk rows of the table. Log findings as bugs per
`bug-reporting`.

## Step 4 — Entry and exit criteria

**Entry** (refuse to start testing without these):
- Build deployed and identified by commit/version
- Acceptance criteria exist and are testable
- Test data and accounts available
- Dev self-test results attached

**Exit** (define before testing, not after):
- All deep-risk areas executed, no open SEV-1 or SEV-2
- Known SEV-3/4 listed and accepted by PM
- Regression suite green, or every failure triaged with a reason
- Skipped scope documented

Exit criteria negotiated after the fact are not criteria. If PM wants to ship
against them, that is a legitimate decision — record it as an accepted risk with
their name on it, and move on.

## Step 5 — Regression scope

Do not rerun everything. Rerun:
1. Everything the change touches directly.
2. Everything that shares data or state with it.
3. The permanent smoke set: login, core transaction, payment, permissions.

If you cannot explain why a regression test is in the set, delete it. A suite
nobody trusts gets ignored, which is worse than a small suite that is believed.

## Think before you scope

Call `pm-questioning` and run at minimum:

- **Inversion** — what would let a critical bug reach production? Is that path covered?
- **Second-order** — if this suite becomes flaky, what does the team start doing?
- **First principles** — what is the actual risk we are buying down, and is this
  test the cheapest way to buy it down?

## Output

```markdown
## Test strategy: <release / feature>
**Scope:** <in>  |  **Out of scope:** <out, with reason>
**Risk table:** <table above>
**Layers:** <what is tested where>
**Charters:** <list with timeboxes>
**Entry / Exit criteria:** <list>
**Accepted risks:** <what we chose not to test, and who accepted it>
```

## Hard rules

- Never report coverage percentage as a quality claim; it measures execution, not risk.
- Never let "we ran out of time" become an undocumented skip.
- Never sign off a gate you know is not met — say it is not met and let PM decide.
