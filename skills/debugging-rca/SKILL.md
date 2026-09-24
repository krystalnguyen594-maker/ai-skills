---
name: debugging-rca
description: >-
  Systematic debugging and root-cause analysis for runtime failures: reproduce,
  narrow, hypothesise, verify, fix, prevent. Covers binary search, git bisect,
  differential diagnosis, and the rules that stop speculative fixes.

  Trigger immediately when:
  - A bug, crash, test failure, regression, or production incident needs diagnosis.
  - Something "works on my machine" or fails intermittently.
  - A fix did not work, or you are about to try a second guess.
  - Investigating why behaviour changed between two versions.
---

# Debugging & Root Cause Analysis

Most time lost in debugging is spent fixing guesses. This is the loop that prevents it.

## The loop

```
1. Reproduce   → a command or steps that fail reliably
2. Narrow      → shrink the failing surface until it is small
3. Hypothesise → one testable claim about the cause
4. Verify      → a check that could prove the hypothesis WRONG
5. Fix         → address the cause, not the symptom
6. Prevent     → a test that fails before the fix and passes after
```

Never skip forward. If you are at step 5 without having done step 4, you are guessing.

## Step 1 — Reproduce

**Rule: no reliable reproduction, no fix.** If you cannot reproduce it, your only
legitimate next step is to improve observability (logging, tracing, capturing state)
and wait for it to happen again.

Capture: exact command, input data, environment, version/commit, and the full error.

Intermittent? Find the variable: timing, concurrency, cached state, leftover data,
ordering, network, clock, locale. Run it in a loop and record the failure ratio.

## Step 2 — Narrow

Halve the search space each time. Stop when the failing surface is small enough to read.

| Technique | Use when |
|---|---|
| **Bisect the input** | Large input; cut it in half until the minimal failing case remains |
| **`git bisect`** | It used to work; find the exact commit that broke it |
| **Bisect the stack** | Add checks at the midpoint of the flow — is the data correct here yet? |
| **Disable half the config/features** | Environment-dependent failure |
| **Differential diagnosis** | Compare a working case and a failing case; list every difference, then eliminate |

Narrowing beats reading code. Ten minutes of bisecting usually beats an hour of
staring at a file you believe is guilty.

## Step 3 — Hypothesise

Write it down as one falsifiable sentence:

> "The total is 0 because the discount is applied to an already-discounted subtotal
> when the coupon is stacked."

Vague hypotheses ("something wrong with state") cannot be tested and produce
speculative fixes. If you cannot state it in one sentence, narrow further.

## Step 4 — Verify before fixing

Design a check whose result would **disprove** you. Confirming evidence is cheap
and misleading; disconfirming evidence is decisive.

- Log or inspect the exact value at the exact point.
- Force the condition you suspect and see the bug appear on demand.
- Remove the suspected cause and see the bug disappear.

**One variable at a time.** Changing three things and seeing it pass teaches nothing,
and you will not know which change to keep.

## Step 5 — Fix the cause

Ask "why" until you leave the symptom layer. Usually 3–5 levels:

> Total is 0 → discount applied twice → the handler runs on both submit and change
> → the listener is registered on every re-render → no cleanup in the effect.

Fixing at level 1 (clamp the total to a minimum) hides the bug and creates two.
Fix at the deepest level you can do safely within scope; if the deepest fix is out
of scope, fix shallower **and say so explicitly**, with the real cause recorded.

**Forbidden fixes:** hardcoding a value to make a test pass, catching and swallowing
the error, adding a retry to hide a race, special-casing the failing input, or
silently switching to a different library/approach to sidestep the problem. If the
correct fix is blocked, escalate — do not paper over it.

## Step 6 — Prevent

Write a test that **fails on the old code and passes on the new**. If it passes
before your fix, it does not test the bug.

Then ask: where else does this pattern exist? One bug of a kind usually means several.

## RCA note (for incidents or anything non-trivial)

```markdown
## RCA: <title>
**Symptom:** <what was observed, and by whom>
**Impact:** <who/what was affected, for how long>
**Reproduction:** <exact steps or command>
**Root cause:** <the deepest verified cause>
**Evidence:** <what proved it — log, bisect result, experiment>
**Fix:** <what changed, where>
**Regression test:** <the test that now guards this>
**Ruled out:** <hypotheses tested and rejected — saves the next person's time>
**Prevention:** <what stops this class of bug, if anything cheap exists>
```

`Ruled out` is the section everyone skips and everyone later wishes existed.

## Think while you debug

Call `pm-questioning` when the cause is not converging:

- **First principles** — what do I actually *know* is true, versus what am I assuming?
- **Inversion** — if I wanted to cause this exact symptom on purpose, how would I?
- **Second-order** — if I apply this fix, what else depends on the behaviour I am changing?

## Hard rules

- Never fix what you cannot reproduce.
- Never apply two fixes at once.
- Never report "fixed" without the failing-then-passing test as evidence.
- Never delete or weaken a test to make a build green.
- Report the real state: if it is still broken, say it is still broken.
