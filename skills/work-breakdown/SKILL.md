---
name: work-breakdown
description: >-
  Break a feature into tasks that can actually be assigned and finished: slicing
  rules, dependency mapping and critical path, sequencing for parallel work,
  estimation with an uncertainty range, and spotting tasks that are too vague to start.

  Trigger immediately when:
  - Turning a feature or spec into tasks, tickets, or a sprint plan.
  - Sequencing work across several developers or agents.
  - Estimating effort, or being asked "how long will this take".
  - A task is stalling, being reopened, or nobody can say when it is done.
---

# Work Breakdown

A task is well formed when someone can start it today without asking a question,
and you can tell from outside whether it is finished.

## Slice vertically, not by layer

Cut so that each task delivers a thin end-to-end slice, not a horizontal layer.

- Bad: `build DB schema` → `build API` → `build UI`. Nothing works until all three
  land, nothing can be tested, and a slip anywhere slips everything.
- Good: `coupon applies to a single item, happy path only` → `stacked coupons` →
  `expired coupon error state`. Each slice is testable and shippable on its own.

Layer-first breakdown is the most common cause of a sprint where everything is
"90% done" on the last day.

## Task template

```markdown
### <verb + outcome>
**Done when:** <observable condition — a test, an output, a visible behaviour>
**Depends on:** <task ids, or none>
**Owner role:** dev / qc / ba / architect
**Estimate:** <range, e.g. 0.5–1 day>
**Unknowns:** <what could make this bigger>
```

`Done when` must be checkable by someone who did not do the work. "Refactor the
pricing module" has no done condition and will run forever.

## Reject a task if

| Symptom | Fix |
|---|---|
| No observable done condition | Rewrite, or send back to BA for acceptance criteria |
| Estimate above ~3 days | Split it — the estimate is hiding unknowns, not work |
| The word "and" in the title | Usually two tasks |
| "Investigate…" with no output | Turn into a timeboxed spike with a stated deliverable |
| Depends on something nobody owns | Create that task first, or escalate |
| Needs a decision that has not been made | Not a task yet — it is a decision gate |

## Dependencies and critical path

1. List tasks, then draw the arrows: A must finish before B can start.
2. The longest chain of dependent tasks is the **critical path** — it sets the
   earliest possible finish. Nothing else matters to the date.
3. Attack the critical path first. Optimising off-path work makes the board look
   busy and changes the date by zero.
4. Anything not on the critical path can run in parallel — that is where you place
   additional people or agents.

Watch for **false parallelism**: two tasks that edit the same files are not parallel,
they are a merge conflict scheduled for later. Assign by file ownership, not by
apparent independence.

## Estimating

- Give a **range**, never a point. `2–4 days` is information; `3 days` is a fiction.
- The width of the range is the message. If it is 1–10 days, the real problem is
  unknowns — buy them down with a spike before promising anything.
- Estimate the task as specified, not as you hope it goes. Then state separately what
  would make it bigger.
- Never inflate an estimate to create hidden buffer. Put the buffer at the plan level,
  visibly, where the person making commitments can see it.
- Re-estimate when scope changes. An estimate silently carried past a scope change is
  how plans quietly become wrong.

## Sequencing rules

1. Decisions before the work that depends on them — an unresolved decision blocks
   more than an unfinished task.
2. Risky and unknown work early, while there is still time to react.
3. Shared foundations before the things that build on them — but only the parts
   actually needed now.
4. Anything needing external input (another team, a vendor, a customer) starts first;
   you do not control its latency.
5. Leave integration time explicit. Work that is "done" but never run together is
   not done.

## Think before you plan

Invoke `pm-questioning`. At minimum:

- **First principles** — what must genuinely be built, versus what is habit?
- **Inversion** — what would make this plan slip by a week? Is that on the critical
  path, and can it be moved earlier?
- **Second-order** — if we cut this task to hit the date, what does that cost in the
  sprint after?

## Output

```markdown
## Breakdown: <feature>
**Tasks:** <table or list, in the template above>
**Critical path:** <chain of task ids>  |  **Earliest finish:** <range>
**Parallel tracks:** <which tasks to which owner, and why they do not collide>
**Decisions needed first:** <what blocks the start, and who decides>
**Biggest unknown:** <and how we plan to reduce it>
```

## Hard rules

- Never assign a task with no done condition.
- Never present a single-number estimate.
- Never plan two agents onto the same files in the same worktree.
- Never let "investigate" sit on a board without a timebox and a deliverable.
- If the plan does not fit the deadline, say so when you see it, with what would have
  to be cut. A plan that only fits if nothing goes wrong is not a plan.
