---
name: agent-handoff-contract
description: >-
  Standard contract for passing work between agents in a multi-agent team (PM, BA,
  Dev, QC, Customer). Defines the handoff packet format, what each role must deliver
  to the next, when to escalate instead of guessing, and how to log assumptions.

  Trigger immediately when:
  - Finishing a task whose output another agent will consume.
  - Receiving work from another agent and deciding whether it is usable.
  - You are blocked, the input is ambiguous, or you are about to assume something.
  - Reporting worker_done or raising an escalation in an orchestration run.
---

# Agent Handoff Contract

Multi-agent teams fail at the seams, not inside the roles. This is the seam standard.

## Rule 0 — Never guess silently

If input is missing or ambiguous, you have exactly two legal moves:

1. **Escalate** — ask the coordinator, block, wait.
2. **Assume and declare** — proceed on a stated assumption, logged in the packet.

Guessing without declaring is a contract violation. So is inventing data, hardcoding
a value to make something pass, or switching approach without saying so.

**Escalate (do not assume) when:** the answer changes scope or cost; it touches money,
security, auth, or user data; it contradicts something another agent already delivered;
or being wrong wastes more than ~30 minutes of work.

## The handoff packet

Every completed task ends with this. Keep it under one screen.

```markdown
## Handoff: <task id / title>
**From:** <role>  **To:** <role>  **Status:** done | blocked | partial

**Delivered**
- <artifact + where it lives, e.g. file path, doc link, branch>

**Not delivered / out of scope**
- <what you deliberately left out, and why>

**Assumptions made**
- A1: <assumption> → invalidated if <condition>

**Open questions for the receiver**
- Q1: <question, and who should answer>

**How to verify**
- <exact command, test, or steps the receiver runs to check this>
```

`Not delivered` and `Assumptions` are mandatory sections. Write "none" if empty —
never delete the heading, because a missing heading reads as "nothing to worry about".

## Per-pair contracts

| From → To | Must contain | Receiver rejects if |
|---|---|---|
| **PM → BA** | Problem, target user, success metric, priority, scope boundary | No measurable success criterion, or a solution is prescribed instead of a problem |
| **BA → Dev** | User story, acceptance criteria (testable), edge cases, data/API contract, traceability to source requirement | Acceptance criteria not testable, or stated as UI wording only |
| **BA → QC** | Same as above + explicit out-of-scope list | QC cannot derive a pass/fail from it |
| **Dev → QC** | What changed, files touched, how to run it, self-test results, known gaps | No run instructions, or "should work" with no evidence |
| **QC → Dev** | Bug reports per `bug-reporting`, severity, minimal repro | No repro steps, or symptom and cause are conflated |
| **QC → BA** | Requirement defects: ambiguity, contradiction, missing case | Reports an opinion instead of a spec gap |
| **Dev/QC → PM** | Status, blockers, scope risk with cost estimate | Escalates without proposing at least one option |
| **Customer → PM/BA** | Accept / reject verdict against acceptance criteria, in business language | Prescribes a solution, or judges on taste with no criterion |

## Receiving work

Before starting, run this check. It takes a minute and saves hours.

1. Can I state the **done condition** in one sentence? If not → escalate.
2. Are all acceptance criteria **testable**? If not → send back to BA, do not invent them.
3. Do any assumptions in the packet conflict with what I know? If yes → escalate.
4. Is anything in `Not delivered` actually required for my task? If yes → escalate.

Sending work back is cheap. Building the wrong thing is not.

## Reporting to the coordinator

- **worker_done** — attach the handoff packet. A bare "done" is not a result.
- **escalation** — state: what you are blocked on, what you already tried, and
  2–3 options with the trade-off of each. Never escalate a question without options.
- **partial** — say exactly which part is complete and which is not. Never round up.

## Hard rules

- Never mark done what you did not verify.
- Never silently change the approach that was agreed (tool, method, architecture).
- Never fabricate data, estimates, or test results to fill a gap.
- Never edit another role's artifact; request the change through its owner.
- If tests fail, say so and show the output. A failing state reported honestly is
  a working handoff; a green claim that is false destroys the whole run.
