---
name: doc-writing-process
description: |
  Phase-gated working process the AI must follow to produce a high-quality document from a user request. Each phase ends with a user sign-off gate: the AI self-critiques its output (5 Whys, Inversion, thought experiments, fresh-context sub-agent testing), refines it, presents it with rationale, and only proceeds to the next phase after the user explicitly approves. Use together with `cognitive-scaffolding` (explanation & progressive bridging framework), `documentation-analysis` (document templates) and `pm-questioning` (mental models).

  Trigger immediately for:
  - Any request to write, draft, or produce a document (BRD, PRD, FRD, analysis report, proposal, guide, requirement analysis...).
  - Requests like "viết tài liệu", "soạn document", "phân tích yêu cầu ra file", "làm báo cáo".
  - Revising or upgrading an existing document to a higher quality standard.
---

# Document Writing Process (Phase-Gated)

## Core principle

The process has 3 phases. **Every phase ends with a user sign-off gate ("chốt")**:

1. Produce the phase output.
2. Self-critique it with the mandated mental model for that phase, then refine.
3. Present the refined output to the user **with the reasoning behind it**.
4. Iterate on user feedback (refinement loop) until the user explicitly approves.
5. Only then move to the next phase. Never start a later phase on an unapproved earlier phase.

---

## Phase 0 — Intake

Answer these 4 questions before writing anything:
1. **Purpose**: What is this document for — what decision or action should it enable?
2. **Audience & Cognitive Anchor**: Who reads it? What do they already know/use ($Mental\ Model_0$)? What is their primary pain point, operational frustration, or burning goal?
3. **Definition of Done**: What does "good" mean here — format, length, sections, conventions, location?
4. **Inputs**: What source materials exist? **Read ALL of them.** Never fabricate content to fill gaps in the inputs.

If any of the 4 cannot be answered from the request and the inputs, **ask the user** for that information — do not guess on high-impact unknowns.

**Self-critique (mandatory, before presenting):** run a **5 Whys** pass on the intake list — "Why am I intaking each of these items? Why does it matter for this document?" Review the answers and refine the intake list if the questioning reveals missing or unnecessary items.

**Gate:** Present to the user: the full list of intaken information AND the reason each item was intaken. The user must confirm it is correct before proceeding to Phase 1.

---

## Phase 1 — Overall structure (outline with descriptions)

Build the document's table of contents:
- Choose the **Bridging Strategy** (refer to `cognitive-scaffolding`: Causal Value Chain for Business/Client Proposals, Minto Pyramid for Execs/BOD, Feynman Analogy for Complex Technical Concepts, or Why $\to$ How $\to$ What for Strategy).
- Sections may be nested to multiple levels.
- **Every entry at every level gets a description** of its intended main content — like a TOC where each item explains what it will cover and how it bridges from the reader's anchor to the target takeaway.

**Self-critique (mandatory, before presenting):** run an **Inversion** pass — "How would this structure fail? What would make this document useless or misleading for the stated audience and purpose? Is there any cognitive gap or abrupt leap?" Review the answers and refine the structure accordingly.

**Gate:** Send the refined structure to the user **with an explanation of why this structure and bridging method were chosen**. Wait for feedback, iterate, and proceed to Phase 2 only after the user approves the structure.

---

## Phase 2 — Detailed content, verification, and finalization

### 2a. Write each section

Draft the detailed content section by section. **Apply Cognitive Scaffolding ($Anchor \to Bridge \to Target$) to every section**:
- Begin with a familiar operational context or pain point.
- Unfold the logic step-by-step (causal chain / clear derivation).
- Introduce solutions/technical specs only as the natural consequence.
- **After finishing EACH section**, check against the section's stated goal and cognitive anti-patterns:
  - Any **Cold-start Drop** (dumping features without bối cảnh/pain point)?
  - Any **Vocabulary Shock** (unexplained jargon)?
  - Any **Broken Step** or logic errors?
  - Any fabricated content (claims not traceable to inputs or approved assumptions)?
  - Still consistent with the approved overall structure?
  - Any duplication of ideas already covered in other sections?

Fix issues before moving to the next section.

### 2b. Whole-document internal review

Run a comprehensive whole-document review pass before sending to external review:
- **Traceability Check**: Ensure every functional requirement, user story, and task maps back to an intaken business goal or input requirement.
- **Thought Experiment / Pre-Mortem**: Simulate how target audiences (e.g., Developers, QC, Business Stakeholders) will read and execute the document. Identify any ambiguities, hidden assumptions, or unaddressed failure modes.
- **Guardrails & Compliance Check**: Verify compliance with domain-specific rules (e.g., 8 Guardrails of PCM/BOD INCONS) and data immutability/security constraints.

### 2c. Mandatory Two-Tier Sub-agent Testing (Red-Teaming First, Stakeholder Audit Second)

To eliminate the "Polite Assistant Bias" (sub-agents being too agreeable or easily issuing superficial conditional passes), sub-agent testing MUST follow a rigorous two-tier framework:

#### Tier 1: Hostile Red-Teaming (The "Project Killer" / Devil's Advocate)
Before presenting to friendly stakeholders, the document must undergo an adversarial stress-test:
1. **Mandatory Adversarial Persona**: Sub-agent must be explicitly assigned a hostile, hyper-critical persona (e.g., *Hostile Special Auditor, Skeptical Executive seeking reasons to cancel the project, or Ruthless Procurement Controller hunting for hidden vendor traps*).
2. **Strict Anti-Leading Prompt Rules**: 
   - **FORBIDDEN**: Never ask polite leading questions (e.g., *"Is this document clear?", "Is this feasible?", "Is this pricing transparent?"*).
   - **MANDATORY**: MUST ask hostile discovery prompts (e.g., *"Identify 3–5 fatal physical, operational, or legal scenarios where this proposal collapses in reality", "What hidden costs, unfeasible physics, or vendor traps are buried in this text?", "If you must convince the Board of Directors to REJECT or HALT disbursement for this project, what are your top 3 killer arguments?"*).
3. **Ban the "Conditional Approval" Cop-out**: The Red-Team sub-agent is strictly prohibited from granting a polite "Conditional Pass" if fatal flaws, physical impossibilities, or safety/cost traps exist. The verdict MUST be **BÁC BỎ (REJECT)** or **ĐÌNH CHỈ GIẢI NGÂN (SUSPEND)** with a strict **Ultimatum (Tối hậu thư)** of non-negotiable fixes.
4. **Hardening Loop**: The author AI must systematically resolve 100% of the fatal flaws identified by Tier 1. Update the document to a hardened version before moving to Tier 2.

#### Tier 2: Multi-Stakeholder Rigorous Audit
Invoke independent fresh-context sub-agents representing the true operational and executive stakeholders:
- **End-User / Operations Lead** (e.g., Site Commander, Field HSE Director, Operations Manager): Tests real-world usability, workflow friction, and physical feasibility.
- **Financial & Procurement Auditor**: Audits cost structure, Capex/Opex segregation, mathematical consistency between formulas and worked examples, and contract risk clauses (e.g., Escrow, Maintenance Freeze).
- **Technical / Architecture Lead**: Audits optical/hardware limits, data protocols, SLA metric definitions (e.g., enforcing Precision $\ge 90\%$ instead of misleading mathematical ratios like FPR).

#### Transparency Requirement: Mandatory Raw Logs Artifact
To prevent hallucinated reviews or cherry-picked summaries, the AI MUST save 100% of the prompts and unedited raw responses of all sub-agents into a dedicated Markdown log file in the project folder (e.g., `PHASE_2_SUBAGENT_TESTING_LOGS.md`).

**Gate:** Present the finalized document and the self-critique/review log to the user:
- Provide direct clickable links to the finalized document and the raw sub-agent testing logs.
- Highlight the major flaws caught by the Hostile Red-Team and how they were resolved.
- Obtain explicit user sign-off.

