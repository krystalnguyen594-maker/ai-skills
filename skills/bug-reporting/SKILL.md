---
name: bug-reporting
description: >-
  Standard for writing bug reports a developer can act on without asking questions:
  minimal reproduction, separating symptom from cause, severity vs priority, and the
  evidence checklist. Also covers triaging and rejecting bad reports.

  Trigger immediately when:
  - Writing up a defect found during testing, review, or UAT.
  - Filing an issue, or preparing a defect list for a handoff.
  - Triaging incoming bugs, or judging whether a report is actionable.
  - Someone reports something "broken" without steps.
---

# Bug Reporting

A bug report is a **work order**, not a complaint. It is done when a developer who
has never seen the feature can reproduce the failure without asking you anything.

## Report template

```markdown
### [SEV-<n>] <what fails, in one line — not "does not work">

**Environment:** <build / branch / commit, OS, browser or device, account/role, data state>

**Steps to reproduce** (minimal — every step is necessary)
1.
2.
3.

**Expected:** <what should happen, and which requirement says so>
**Actual:** <what happened, exact wording of any error>

**Evidence:** <screenshot / video / log excerpt / request-response / stack trace>

**Frequency:** always | intermittent (N of M attempts) | once
**Scope:** <who is affected, which environments, any workaround>

**Notes:** <narrowing you already did — what you ruled out>
```

## Minimal reproduction

Cut steps until removing one more makes the bug disappear. Then stop.

Ask each step: *if I delete this, does it still fail?* Yes → delete it.

A 12-step repro that could have been 3 wastes the developer's time and usually
hides which of the 12 actually matters. If you cannot reduce it, say so explicitly
and list what you already tried to remove.

**Intermittent bugs:** do not hide the flakiness. Report the ratio ("fails 3 of 10")
and any pattern you noticed (time of day, after a specific action, only on cold start).
An honest "intermittent, 3/10" is far more useful than a confident but wrong repro.

## Symptom vs cause — keep them apart

You report **what you observed**. You may add a hypothesis, clearly labelled.

- Symptom: "Order total shows 0 after applying a coupon."
- Hypothesis (label it): "Possibly the discount is applied twice — the network
  response shows `total: 0` while `subtotal` is correct."

Never write the cause in the title. A title asserting the wrong cause sends the
developer to the wrong file, and the report gets closed as "cannot reproduce".

## Severity vs priority — they are different people's decisions

**Severity** = technical impact. QC sets it.
**Priority** = when to fix it. PM sets it.

| Severity | Definition |
|---|---|
| SEV-1 | Data loss, security hole, or core flow completely blocked, no workaround |
| SEV-2 | Major function broken, workaround exists but is painful |
| SEV-3 | Function works incorrectly in a limited case, or minor data issue |
| SEV-4 | Cosmetic, wording, alignment; no functional impact |

Do not inflate severity to get attention. Once severity is known to be negotiable,
every number you write stops being information.

## Evidence checklist

- [ ] Exact error text (copied, not paraphrased, not screenshotted if it is text)
- [ ] For API bugs: request, response, status code
- [ ] For UI bugs: screenshot or short video, with the relevant area visible
- [ ] For crashes: stack trace or log excerpt around the failure timestamp
- [ ] Build/commit identifier — without it the report expires immediately

## Triage: reject these

Send back, do not guess:

| Problem | Ask for |
|---|---|
| No steps, or steps that do not reproduce | A minimal repro, or mark `cannot-reproduce` with attempts logged |
| "It's slow" / "it's weird" | A number and a threshold: slow compared to what |
| Multiple defects in one report | One report per defect — they get fixed and closed separately |
| Expected behaviour not stated | The requirement reference; if none exists, it is a question for BA, not a bug |
| Disagreement with the spec | That is a requirement issue → route to BA, not Dev |

## Hard rules

- One bug per report.
- Never file a bug you have not reproduced at least once yourself.
- Never edit the severity of someone else's report without saying why.
- If it turns out not to be a bug, close it with the explanation attached — a
  silently deleted report will be re-filed next sprint.
