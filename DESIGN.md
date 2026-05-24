# Design System

## Theme

Dark-mode first. Primary user is a developer, typically in a low-ambient-light environment at a desk. The interface should feel like Linear or Warp: familiar, low-friction, expert-respecting. Light mode is fully supported but dark is the reference.

**Physical scene:** Developer, evening, external monitor, scanning job listings during a focused session. Not stressed, but purposeful.

## Color Strategy

Restrained. One emerald accent at ≤15% of surface area. Neutrals are neutral (no chroma bleed). Emerald carries trust signal — live status, active indicators, primary CTAs. Never decorative-only.

No `#000` / `#fff`. Background neutrals are near-black (`oklch(0.145 0 0)`) and near-white (`oklch(1 0 0)`), not pure.

### Palette

| Role | CSS Token | OKLCH |
|---|---|---|
| Background (dark) | `--background` | `oklch(0.145 0 0)` |
| Background (light) | `--background` | `oklch(1 0 0)` |
| Card (dark) | `--card` | `oklch(0.178 0 0)` |
| Border (dark) | `--border` | `oklch(1 0 0 / 10%)` |
| Muted foreground | `--muted-foreground` | `oklch(0.63 0 0)` |
| Accent — live / CTA | `emerald-400` | `oklch(0.765 0.177 163.223)` |
| Accent dim | `emerald-500` | `oklch(0.696 0.17 162.48)` |

### Anti-patterns

- No gradient text (`background-clip: text` with gradient). Use solid `text-emerald-400` for accent emphasis.
- No glassmorphism as default.
- No hero-metric template (big number, small label, stat row).

## Typography

**Fonts:** Geist Sans (body, UI) + Geist Mono (labels, badges, indices, live indicators)

**Scale:**
- Display / hero: `text-4xl` → `text-7xl`, `font-bold`, `tracking-tight`, `leading-[1.04]`
- Section heading: `text-3xl` → `text-5xl`, `font-bold`, `tracking-tight`
- Card heading: `text-base` → `text-lg`, `font-semibold`
- Body: `text-sm` → `text-base`, `leading-relaxed`
- Mono label: `text-xs`, `tracking-[0.2em]`, `uppercase`, `font-mono`

**Rules:**
- Emphasis via weight, size, or solid color — not gradient.
- Body line length: max 65–75ch.
- Mono for data-adjacent content only (indices, timestamps, badges, live status).

## Spacing

Base radius: `0.625rem` (`--radius`). Cards: `rounded-xl` / `rounded-2xl`. CTA buttons: `rounded-full`. Form controls: `rounded-md`.

Section vertical rhythm: `py-20 md:py-28`. Generous section separation. Vary padding within sections for rhythm — don't apply the same gap everywhere.

## Components

### Buttons

- Primary: `bg-foreground text-background rounded-full` — achromatic, high-contrast, CTA
- Ghost accent: `border-emerald-500/30 text-emerald-400` — secondary
- All: `active:scale-[0.97]`, `transition-[transform,background-color,opacity,border-color,color] duration-150`
- No `transition-all`

### Cards

- Base: `rounded-xl border border-border/40 bg-card/50`
- Hover: `hover:border-border hover:bg-card/80 hover:shadow-lg`
- No side-stripe border accents (`border-left/right > 1px` colored)
- No identical grids of 3+ same-structure cards. Use numbered lists or asymmetric layouts.

### Feature Lists

Prefer numbered editorial lists over icon-heading-text card grids. Leading mono index number (`01`, `02`) + content in a grid, separated by thin dividers. Cleaner and avoids identical-card-grid anti-pattern.

### Badges / Eyebrow Labels

Mono font, `tracking-[0.2em]`, `uppercase`, `text-xs`, `text-emerald-400/70` or `text-muted-foreground/50`.

### Navigation

Sticky, `backdrop-blur-xl`, `border-b border-border/40 bg-background/80`. Links `text-muted-foreground` → `text-foreground` on hover.

## Motion

Custom easing vars (defined in `:root`):
- `--ease-out: cubic-bezier(0.23, 1, 0.32, 1)` — entering elements
- `--ease-in-out: cubic-bezier(0.77, 0, 0.175, 1)` — on-screen movement
- `--ease-drawer: cubic-bezier(0.32, 0.72, 0, 1)` — sheets and drawers

Durations: buttons 100–150ms, tooltips 125–200ms, dropdowns 150–200ms, modals/drawers 200–350ms.

No bounce. No elastic. No `ease-in` on any UI animation. No `transition-all`.

`prefers-reduced-motion`: all view transitions and entrance animations disabled.
