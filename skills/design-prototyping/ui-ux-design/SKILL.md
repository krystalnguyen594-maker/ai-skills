---
name: ui-ux-design
description: |
  Guidelines for visual aesthetics, modern CSS design tokens, premium color palettes, typography, glassmorphism, micro-animations, layout responsiveness, and generating design mockups/assets using the image generation tool.

  Trigger immediately for:
  - Designing UI layouts, wireframes, or high-fidelity mockups.
  - Writing styles (CSS/SCSS) for applications or web prototypes.
  - Adding interactive animations, transitions, hover effects, and keyframes.
  - Generating visual assets or UI screenshots using generate_image.
---

# UI/UX Design & Aesthetics Guide

This skill ensures the agent builds and proposes user interfaces that feel premium, modern, responsive, and visually stunning.

## 1. Visual Tone & Direction Selection
Before writing any UI code, the agent MUST explicitly declare and commit to a specific design tone:
- **Clean SaaS (Modern Minimal)**: Clean grids, high white-space, subtle borders, slate/indigo accents, soft shadows.
- **Brutalist Minimalism**: Thick black borders (`2px solid black`), sharp shadows (`box-shadow: 4px 4px 0px 0px #000`), high contrast, bold primary accents, sans-serif monospace.
- **Retro-Futuristic (Cyberpunk/Glassmorphism)**: Dark mode background, neon glow borders, translucent glass panels (`backdrop-filter: blur(12px)`), monospace telemetry indicators.
- **Industrial Utility (Sleek Admin)**: Highly condensed grid layout, muted gray-scale palette, micro-pills, strict visual alignment, font size 12-14px for high information density.

## 2. Color Systems & Visual Depth
- **Colors**: Avoid using browser-default primary colors (pure red `#ff0000`, blue `#0000ff`). Instead, use custom HSL or curated color scales (e.g., zinc, slate, indigo, violet, emerald).
- **Dark Mode**: Provide rich, deep background layers (e.g., `#0b0f19` or HSL equivalents) instead of pure black `#000000`.
- **Glassmorphism**: Use translucent panels with subtle borders and backdrop blur for a layered, futuristic depth:
  ```css
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  ```
- **Shadows**: Use multi-layered soft box shadows to simulate elevation.

## 3. Typography & Iconography
- **Fonts**: Import modern fonts (e.g., Google Fonts: Inter, Outfit, Plus Jakarta Sans, DM Sans).
- **Type Scale**: Maintain strict visual hierarchy:
  - `Display / H1`: Large, bold, tracking-tight (`letter-spacing: -0.02em`).
  - `Body`: Clean, legible font weight (400/500) and proper line-height (`1.5` to `1.6`).
  - `Code / Meta`: Monospace (JetBrains Mono, Fira Code) with distinct background pads.
- **Iconography over Emojis**: Do NOT use emojis (🚀, 💡, 🔥) for UI icons in production-grade interfaces. Use clean SVG icons or standard icon libraries (Lucide, Heroicons, FontAwesome).

## 4. Micro-Animations & Motion
- **Hover Transitions**: Apply smooth transitions (`transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)`) on buttons, links, cards, and input fields.
- **Micro-interactions**: Use scale effects (`transform: scale(0.98)` on click, `scale(1.02)` on hover) and soft glows.
- **Scroll Motion**: Use intersection observers or scroll-driven CSS animations to reveal components as the user scrolls.

## 5. Visual Asset Generation & Prototyping
- **No Placeholders**: Never use generic grey boxes or `placehold.co` links for user interfaces.
- **Image Generation**: Proactively use `generate_image` to create high-quality icons, background assets, and dashboard mockups.
  - When prompting for UI designs, generate the interface only, without surrounding hardware frames (laptops, phones) unless requested.

