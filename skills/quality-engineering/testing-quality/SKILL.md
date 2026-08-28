---
name: testing-quality
description: |
  Guides for designing and running automated tests. Covers API testing (status codes, payloads, error flows) and UI testing (Playwright/Cypress selectors, user interactions, assertion structures).

  Trigger immediately for:
  - Writing automated test suites (API, Integration, E2E).
  - Configuring testing tools (Playwright, Cypress, Vitest, Jest).
  - Troubleshooting broken tests or setting up quality gates.
---

# Testing & Quality Assurance Guide

This skill directs the agent on implementing comprehensive test coverages for backend APIs and frontend user flows.

## 1. API Testing Strategy
Ensure API endpoints are secure, performant, and conform to the data contracts:
- **Test Scenarios**:
  - *Happy Path*: Verify correct status codes (`200 OK`, `201 Created`), headers, and body structures.
  - *Edge Cases & Validation*: Send malformed payloads, empty values, or invalid types. Confirm the API returns appropriate `400 Bad Request` or validation errors.
  - *Authentication & Authorization*: Test endpoints with missing, expired, or unauthorized tokens. Verify `401 Unauthorized` or `403 Forbidden` responses.
- **Payload Assertions**: Use strict schema validation (e.g., Zod, JSON Schema) to verify response bodies.
- **Mocking**: Mock external third-party dependencies to keep tests fast, isolated, and deterministic.

## 2. UI & E2E Testing Strategy
Verify user flows exactly as an end-user would experience them:
- **Framework Choice**: Prefer **Playwright** for robust multi-browser testing, auto-waiting, and trace recording. Use Cypress if it's already configured in the codebase.
- **Page Object Model (POM)**: For complex applications, organize selectors and interactions in Page Object classes (e.g. `pages/LoginPage.ts`). Keep test specs clean, readable, and focused on assertions.
- **Selector Best Practices**:
  - NEVER use fragile, absolute CSS selectors (e.g., `div > span > ul > li:nth-child(3)`).
  - Use semantic accessibility roles first: `page.getByRole('button', { name: 'Submit' })`.
  - Use data-attributes if semantic roles are insufficient: `page.locator('[data-testid="submit-btn"]')`.
- **Waiting & Timing**: Avoid hardcoded sleep timers (`page.waitForTimeout(3000)`). Use action-based waiting, e.g., wait for a loader to disappear, wait for an element to be visible, or wait for a network response.
- **Diagnostics & Debugging**: Ensure tests are configured to capture screenshots, video, and trace zip files on test failure (`video: 'on-first-retry'`, `trace: 'retain-on-failure'`).
- **Responsive Testing**: Test across multiple viewport resolutions (Desktop, Tablet, Mobile) to ensure layout responsiveness and that mobile menus function correctly.

