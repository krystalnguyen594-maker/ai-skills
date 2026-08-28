---
name: web-prototyping
description: |
  Best practices for creating web prototypes using HTML/CSS, React, or Angular. Guides tech stack selection, project initialization, components architecture, routing, and local deployment.

  Trigger immediately for:
  - Starting a new frontend application, template, or interactive prototype.
  - Running package managers (npm, npx) to scaffold frameworks.
  - Structuring components, pages, state management, and routing.
---

# Web Prototyping Guide

This skill instructs the agent on rapid, clean, and robust development of web prototypes.

## 1. Tech Stack Selection Matrix
- **Vanilla HTML/CSS/JS**: Choose this for simple, single-page UI mockups, static dashboards, and documents. Keeps dependencies at zero and loads instantly.
- **Vite + React (TypeScript)**: Choose this for rich interactive prototypes, mock-dashboard systems, multi-step forms, and state-heavy applications.
- **Angular**: Choose this if specifically requested by the user or when integrating with an existing corporate Angular codebase.

## 2. Project Scaffolding Guidelines
When starting a new project in the workspace:
- Always run the CLI tool command with `--help` first to discover flags.
- Use `npx -y` to auto-install dependencies without prompting the user.
- Initialize the application in the current directory (`./`) instead of creating a subdirectory, unless requested.
- Force non-interactive modes (e.g., using flags like `--template react-ts` or `--yes`).
  
**Example (Vite + React template)**:
```sh
npx -y create-vite@latest ./ --template react-ts
```

## 3. Project Hygiene & Directory Structure
Structure applications clean and modularly:
- **`src/components/`**: Modular, reusable UI components (Buttons, Inputs, Modals, Cards).
- **`src/pages/`** or **`src/views/`**: View layouts mapped to routes.
- **`src/hooks/`** or **`src/context/`**: For shared states (Auth, Settings, Data).
- **`src/index.css`** or **`src/App.css`**: Store global CSS variables and styling tokens here first.

## 4. Development and Local Execution
- Standard execution command: Use `npm run dev` or equivalent tool.
- Proactively check `package.json` to verify available scripts and exact version bounds.
- Set up fallback data sources (JSON mockups) locally instead of relying on external live APIs to avoid rate limits and connectivity issues.
