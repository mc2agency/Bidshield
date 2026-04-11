# BidShield Style Guide

Design conventions and decisions for the BidShield UI.

---

## Layout

- **Page background:** `--bs-bg-page` (`#F8FAFC`) — never pure white
- **Cards:** white (`--bs-bg-card`) with `--bs-shadow-card`, radius `--bs-card-radius` (12px), padding `--bs-card-padding` (24px)
- **Sidebar:** dark (`--bs-bg-sidebar`: `#0f1117`)
- **Section gaps:** `--bs-section-gap` (24px) between major page sections

---

## Color Usage

- **Green accents** — positive states, savings, wins, success badges
- **Red accents** — alerts, risks, losses, errors
- **Amber accents** — warnings, pending states
- **Blue accents** — informational, links, neutral highlights
- Always pair an accent color with its `*-light` variant for badge/chip backgrounds

---

## Typography

- Use `--bs-text-primary` for headings and body copy
- Use `--bs-text-secondary` for supporting text
- Use `--bs-text-muted` for placeholder, empty states, timestamps
- Use `--bs-text-label` for table headers, form labels, and captions
- Font: Inter (sans), Geist Mono (code/numbers)

---

## Borders

- `--bs-border-subtle` — separators, dividers between sections
- `--bs-border-card` — card outlines (very light, nearly invisible)
- Avoid heavy borders; prefer shadow and background contrast for depth

---

## Shadows

- `--bs-shadow-card` — default card elevation
- `--bs-shadow-card-hover` — on hover/focus card states
- `--bs-shadow-stat` — KPI/stat tiles
- Never use drop shadows on inline elements or text

---

## Components

### Cards
White background, `border border-[--bs-border-card]`, `rounded-[12px]`, `shadow-[--bs-shadow-card]`, `p-6`.

### Stat/KPI Tiles
Same card treatment with `--bs-shadow-stat`. Large numeric value in `--bs-text-primary`, label in `--bs-text-label`.

### Badges / Status Chips
- Use accent + light variant pairing (e.g. green text on `--bs-accent-green-light` bg)
- Rounded-full, small padding (`px-2 py-0.5`), text-xs font-medium

### Tables
- Header: `--bs-text-label`, uppercase, text-xs, border-bottom `--bs-border-subtle`
- Rows: `--bs-text-primary` primary column, `--bs-text-secondary` secondary columns
- Row hover: very light bg tint

### Alerts / Banners
- Color-coded left border or full-width banner using accent + light pairing
- Icon + title + description pattern

---

## Accessibility

- Focus rings: 2px solid `--primary` (`#10b981`), offset 2px (via `.focus-ring` utility)
- Respect `prefers-reduced-motion` — all animations disabled at `0.01ms`
- Text selection highlight: `rgba(16, 185, 129, 0.2)` (emerald tint)
