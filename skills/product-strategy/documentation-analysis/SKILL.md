---
name: documentation-analysis
description: |
  Guidelines, templates, and frameworks for writing and analyzing BRD, PRD, and FRD documents. Also covers Notion page creation standards, cognitive scaffolding, and requirements traceability. Use together with `cognitive-scaffolding` and `doc-writing-process`.

  Trigger immediately for:
  - Drafting, editing, or auditing BRD, PRD, or FRD specifications.
  - Translating business problems into technical user stories or API contracts.
  - Uploading documentation or summaries to Notion databases/pages.
---

# Documentation & Requirements Analysis Guide

This skill guides the agent in writing industry-standard product and business documentation, analyzing requirements for clarity, and syncing documentation to collaborative tools like Notion. Every document must anchor on the reader's cognitive baseline (see `cognitive-scaffolding`).

## 1. Document Structure & Standards

### Business Requirements Document (BRD)
*Focus: The "Why" and "What" of the business. Written for executive sponsors and business leads (Bridge: Minto Pyramid / Causal Chain).*
- **Core Sections**:
  - Executive Summary & Project Objectives
  - Cognitive Anchor: Stakeholders, Current Operational Bottlenecks & Business Goals (with KPIs)
  - Project Scope (In-Scope vs. Out-of-Scope)
  - High-level Business Rules & Compliance constraints
  - Financial & Operational Risks

### Product Requirements Document (PRD)
*Focus: The user-centric solution. Written for product teams, designers, and engineering leads.*
- **Core Sections**:
  - User Personas & Pain Points
  - User Stories & Acceptance Criteria (Gherkin format: Given-When-Then)
  - User Journeys & Wireframe Maps
  - Non-Functional Requirements (Performance, Security, Compatibility)
  - Release Criteria & Milestone Schedule

### Functional Requirements Document (FRD)
*Focus: The "How" of system execution. Written for developers and QA engineers.*
- **Core Sections**:
  - System Architecture & Data Model Diagrams
  - API Contracts (Endpoints, Request payloads, Response bodies, HTTP status mappings)
  - Detailed Logical Workflows & State Machines
  - Error Handling matrices
  - Third-party Integration specs

## 2. Requirements Traceability
When reviewing or writing documents:
- Maintain a **Traceability Matrix**: ensure every functional requirement in the FRD is mapped directly to a user story in the PRD, which in turn maps to a business goal in the BRD.
- Flag gaps: Highlight any feature requested in engineering that has no clear business value, or business goals that lack functional support.

## 3. Notion Integration Rules
- When asked to push, upload, or create a Notion page containing documentation (especially with tables, bold text, or lists):
  - **DO NOT** call raw Notion MCP server tools directly due to OpenAPI schemas limitations on nested blocks.
  - **ALWAYS** use the custom script at `/Users/duyho/.gemini/antigravity/scratch/create_notion_page.js` or reuse its markdown-to-block parsing logic to call the Notion API directly.
