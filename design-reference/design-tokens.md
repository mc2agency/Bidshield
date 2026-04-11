# BidShield Design Tokens

All tokens are defined as CSS custom properties in [app/globals.css](../app/globals.css).

---

## Colors

### Base

| Token | Value | Description |
|---|---|---|
| `--background` | `#ffffff` | App background |
| `--foreground` | `#0f172a` | App foreground text |
| `--primary` | `#10b981` | Primary brand (emerald-500) |
| `--primary-dark` | `#059669` | Primary hover (emerald-600) |
| `--secondary` | `#fbbf24` | Secondary brand (amber-400) |
| `--accent` | `#a855f7` | Accent (purple-500) |

### BidShield System Colors (`--bs-*`)

#### Backgrounds

| Token | Value |
|---|---|
| `--bs-bg-page` | `#F8FAFC` |
| `--bs-bg-card` | `#FFFFFF` |
| `--bs-bg-sidebar` | `#0f1117` |

#### Borders

| Token | Value |
|---|---|
| `--bs-border-subtle` | `#E2E8F0` |
| `--bs-border-card` | `#F1F5F9` |

#### Text

| Token | Value | Usage |
|---|---|---|
| `--bs-text-primary` | `#0F172A` | Main body text |
| `--bs-text-secondary` | `#475569` | Secondary text |
| `--bs-text-muted` | `#94A3B8` | Muted/placeholder |
| `--bs-text-label` | `#64748B` | Labels, captions |

#### Accents

| Token | Value | Light variant |
|---|---|---|
| `--bs-accent-green` | `#059669` | `--bs-accent-green-light: #ECFDF5` |
| `--bs-accent-red` | `#DC2626` | `--bs-accent-red-light: #FEF2F2` |
| `--bs-accent-amber` | `#D97706` | `--bs-accent-amber-light: #FFFBEB` |
| `--bs-accent-blue` | `#2563EB` | `--bs-accent-blue-light: #EFF6FF` |

---

## Shadows

| Token | Value |
|---|---|
| `--bs-shadow-card` | `0 1px 3px 0 rgba(0,0,0,0.04), 0 1px 2px -1px rgba(0,0,0,0.04)` |
| `--bs-shadow-card-hover` | `0 10px 15px -3px rgba(0,0,0,0.06), 0 4px 6px -4px rgba(0,0,0,0.06)` |
| `--bs-shadow-stat` | `0 1px 2px 0 rgba(0,0,0,0.03)` |

---

## Spacing & Shape

| Token | Value | Usage |
|---|---|---|
| `--bs-card-padding` | `24px` | Inner padding for cards |
| `--bs-card-radius` | `12px` | Card border radius |
| `--bs-section-gap` | `24px` | Gap between page sections |

---

## Typography

Font stack defined via `@theme inline`:

- **Sans:** `var(--font-inter)`, `ui-sans-serif`, `system-ui`, `sans-serif`
- **Mono:** `var(--font-geist-mono)`
