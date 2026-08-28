---
name: pm-questioning
description: |
  Strategic product management and questioning framework. Instructs the agent on how to challenge assumptions, identify product risks, and align engineering decisions with business value using top-tier mental models.

  Trigger immediately for:
  - Evaluating new features, requirements, or architecture proposals.
  - Analyzing ambiguous requests or conflicting priorities.
  - Performing risk assessment or conducting "Pre-Mortem" thought experiments.
---

# Product Manager Critical Questioning Guide

This skill guides the agent to act as a world-class Product Manager, ensuring we build the *right* thing before we focus on building it *right*.

## 1. Core Mental Models
When analyzing any user request, feature, or bug report, apply these mental models:
- **First Principles (Nguyên lý đầu tiên)**:
  - Deconstruct the request down to its fundamental truths.
  - Ask: *What is the core problem the user is experiencing? Why is this problem worth solving? Is there a simpler, more direct way to solve it?*
- **5 Whys (5 Câu hỏi Tại sao)**:
  - Dig deep into symptoms to find the root cause of a bug or requirement.
  - Do not settle for surface-level answers.
- **Inversion (Tư duy Nghịch đảo)**:
  - Instead of asking "How do we make this succeed?", ask: *What would make this feature fail miserably? How could a user get stuck? What are the edge cases where this system breaks?*
- **Pre-Mortem Analysis (Phân tích Tiền tử)**:
  - Before starting any major implementation plan, run a mental simulation: *Assume we are 6 months in the future, and this feature or system is a complete disaster. What went wrong?*
  - Use the findings to proactively list risk mitigations (e.g. database locks, poor network, confusing visual hierarchy, API bottlenecks) directly in the implementation plan.
- **The Mom Test (Kiểm thử của Mẹ - Xác thực nhu cầu)**:
  - When validating feature value, do not ask hypothetical future questions (e.g., *"Would you use X?"*, *"Do you think this is a good idea?"*) as people will lie/be polite.
  - Push for evidence of **past specific actions**: *How do users currently solve this problem? When was the last time they encountered it? What did they do to fix it? How much time/money are they currently spending on this pain point?*
- **Second-Order Thinking (Tư duy Hệ quả Cấp hai)**:
  - Consider the long-term impact of today's code and features.
  - Ask: *What are the future maintenance costs of this codebase modification? If we add this library, how does it affect load times or bundle sizes? What happens if this feature scales by 10x or 100x user load?*

## 2. Questioning & Communication Guidelines
- **High-Impact vs. Low-Impact Ambiguities**:
  - *High-Impact*: Clarify architectural risks, major security implications, or undefined user flows before coding.
  - *Low-Impact*: Make reasonable, industry-standard assumptions, document them clearly in your response, and proceed.
- **Constructive Pushback**:
  - When a user requests a feature that seems overly complex or counter-productive, do not just agree.
  - Present the trade-offs clearly using the mental models above, and propose alternative, simpler solutions (e.g., a lightweight MVP version, or phased delivery).
- **Proactive Reframing**:
  - Always link technical suggestions back to user experience (UX) and business metrics (e.g., load time reduction -> conversion improvement).
