# AI Skills Repository Governance & Operational Rules

## 1. Mandatory Evaluation & Quality Gate Workflow
Whenever you use any skill from `skills/*` to generate documentation, plans, code, or technical artifacts, you MUST strictly execute the 3-Tier Operational Pipeline:
1. **Tier 1: Expert Drafting** — Follow the skill's instructions in `skills/<skill_id>/SKILL.md`.
2. **Tier 2: AI Quality Scorecard** — Read `skills/<skill_id>/evaluation.yaml`, evaluate the output against `required_sections`, `prohibited_patterns`, and calculate weighted rubric dimension scores (`completeness`, `soundness`, `actionability`, `clarity`). Output the standardized Scorecard block with PASS/FAIL status.
3. **Tier 3: Interactive Feedback Modal via `ask_question` Tool** — The Agent MUST immediately call the `ask_question` tool to open a native interactive modal popup for the user to submit their feedback via 1-click buttons (instead of asking them to type text numbers). Recorded feedback is synced to `server/data/eval.db`.

Detailed specification is located in [`.agents/rules/evaluation-workflow.md`](.agents/rules/evaluation-workflow.md).
