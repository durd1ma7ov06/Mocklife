---
name: Obsidian Flux
colors:
  surface: '#121318'
  surface-dim: '#121318'
  surface-bright: '#38393f'
  surface-container-lowest: '#0d0e13'
  surface-container-low: '#1a1b21'
  surface-container: '#1e1f25'
  surface-container-high: '#292a2f'
  surface-container-highest: '#34343a'
  on-surface: '#e3e1e9'
  on-surface-variant: '#c7c4d7'
  inverse-surface: '#e3e1e9'
  inverse-on-surface: '#2f3036'
  outline: '#908fa0'
  outline-variant: '#464554'
  surface-tint: '#c0c1ff'
  primary: '#c0c1ff'
  on-primary: '#1000a9'
  primary-container: '#8083ff'
  on-primary-container: '#0d0096'
  inverse-primary: '#494bd6'
  secondary: '#4edea3'
  on-secondary: '#003824'
  secondary-container: '#00a572'
  on-secondary-container: '#00311f'
  tertiary: '#7bd0ff'
  on-tertiary: '#00354a'
  tertiary-container: '#009bd1'
  on-tertiary-container: '#002d40'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e1e0ff'
  primary-fixed-dim: '#c0c1ff'
  on-primary-fixed: '#07006c'
  on-primary-fixed-variant: '#2f2ebe'
  secondary-fixed: '#6ffbbe'
  secondary-fixed-dim: '#4edea3'
  on-secondary-fixed: '#002113'
  on-secondary-fixed-variant: '#005236'
  tertiary-fixed: '#c4e7ff'
  tertiary-fixed-dim: '#7bd0ff'
  on-tertiary-fixed: '#001e2c'
  on-tertiary-fixed-variant: '#004c69'
  background: '#121318'
  on-background: '#e3e1e9'
  surface-variant: '#34343a'
typography:
  display:
    fontFamily: Plus Jakarta Sans
    fontSize: 56px
    fontWeight: '700'
    lineHeight: 64px
    letterSpacing: -0.03em
  display-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.025em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.025em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.015em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
    letterSpacing: -0.011em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
    letterSpacing: -0.006em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0em
  label-lg:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: -0.005em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
  code:
    fontFamily: Inter
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 0.75rem
  space-base: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  space-3xl: 4rem
  gutter-mobile: 1rem
  gutter-tablet: 1.5rem
  gutter-desktop: 2rem
  margin-mobile: 1rem
  margin-tablet: 2rem
  margin-desktop: 3rem
---

## Brand & Style

This design system delivers an ultra-clean, high-precision dark mode experience engineered for high-velocity software platforms, developer workflows, and premium SaaS products. Drawing direct inspiration from modern engineering-led tools, it rejects visual clutter in favor of crisp delineation, deliberate typography, and subtle atmospheric depth.

The aesthetic philosophy centers on **Refined Dark Glassmorphism and Layered Luminosity**:
- **Atmosphere:** Pitch-dark zinc foundations layered with micro-translucencies, calibrated 1px perimeter outlines, and laser-precise specular highlights.
- **Personality:** Decisive, frictionless, engineered, and quiet. It behaves like a luxury developer console—fast, high-contrast where data matters, and deeply muted where structure serves.
- **Emotional Resonance:** Technical mastery, extreme focus, and uncompromised craftsmanship. Every interactive touchpoint provides instantaneous feedback, sharp edges balanced with organic curvature, and effortless optical clarity.

## Colors

The color architecture is built for extreme dark-mode contrast ratios and disciplined visual hierarchy. Surfaces are built from deep zinc and slate undertones, avoiding muddy blacks while preventing optical vibration.

### Canvas & Surface Hierarchy
- **Base Canvas (`#090a0f`):** The absolute backdrop. Absorptive, near-black with subtle indigo-slate bias.
- **Surface Elevation 1 (`#0f131d` / `rgba(15, 23, 42, 0.65)`):** Base cards, navigations, and structural wrappers.
- **Surface Elevation 2 (`#151c2c` / `rgba(24, 24, 27, 0.75)`):** Hover states, elevated panels, modal backgrounds, and nested cards.
- **Surface Elevation 3 (`#1e293b`):** Popovers, tooltips, and floating control bars.

### Chromatic Accents
- **Primary Indigo (`#6366f1`):** Applied strictly to focal calls-to-action, active segment markers, primary link targets, and subtle glow gradients.
- **Secondary Emerald (`#10b981`):** Serves dual duty as positive system verification, production-ready telemetry status, and organic success moments.
- **Tertiary Cyan/Sky (`#38bdf8`):** Reserved for real-time streaming states, pipeline active indicators, and high-priority code tokens.

### Monochromatic Text Tiers
- **Text Primary (`#f8fafc`):** 98% pure white for titles, values, and essential metrics.
- **Text Secondary (`#94a3b8`):** Balanced slate for supportive labels, subheadings, and UI controls.
- **Text Muted (`#475569`):** Low-contrast structural cues, inactive tabs, and placeholders.
- **Border Subtle (`rgba(255, 255, 255, 0.08)`): The standard razor-sharp perimeter for cards and dividers.
- **Border Active (`rgba(99, 102, 241, 0.35)`):** Dynamic hover border that picks up ambient indigo illumination.

## Typography

The typographic hierarchy pairs **Plus Jakarta Sans** for structural display headings with **Inter** for dense utility, body, and data metrics.

- **Plus Jakarta Sans** introduces subtle geometric distinction with tightened tracking (`-0.02em` to `-0.03em`), generating modern poise without sacrificing engineering austerity.
- **Inter** ensures exceptional readability across micro-copy, data tables, and multi-state dashboards. Its tabular numerical figures (`tnum`) should be enabled for all metric views, system charts, and timestamps.
- **Code & Command Sequences:** Set in tabular styling with a distinct background pill to preserve layout predictability within command palettes and query bars.

## Layout & Spacing

This design system uses a strict **8-point base grid** with a nested **4-point micro-scale** for badges, button padding, and icon alignments.

### Grid Architecture
- **Desktop (≥ 1280px):** 12-column responsive fluid grid maxed at 1440px container width. Columns are separated by `2rem` (32px) gutters with `3rem` (48px) exterior safe margins.
- **Tablet (768px – 1279px):** 8-column layout with `1.5rem` (24px) gutters and `2rem` (32px) margin padding. Content panels stack or shift from 3-column rows to 2-column matrices.
- **Mobile (≤ 767px):** 4-column layout with `1rem` (16px) gutters and `1rem` (16px) outer margin padding. Complex split panels collapse into vertical stacks with sticky horizontal sub-navigation.

### Rhythmic Density
- Form inputs, list items, and button components adhere to explicit height increments: `32px` (compact/filter), `40px` (standard desktop action), and `48px` (primary touch/hero action).
- Container gaps are strictly decoupled: component internal rhythm stays compact (`0.5rem` to `1rem`), while visual section blocks separate cleanly via `3rem` or `4rem`.

## Elevation & Depth

Depth is conveyed through **luminescent glass layering and directional backdrops** rather than traditional opaque shadows.

### The Glass System
- **Translucent Tier 1 (Cards & App Shells):** `background: rgba(15, 23, 42, 0.65)` layered with `backdrop-filter: blur(16px)` and a continuous hairline border: `border: 1px solid rgba(255, 255, 255, 0.08)`.
- **Translucent Tier 2 (Flyouts & Dropdowns):** `background: rgba(24, 24, 27, 0.85)` with `backdrop-filter: blur(24px)` and `border: 1px solid rgba(255, 255, 255, 0.12)`.

### Border Lighting & Ambient Glows
- **Subtle Perimeter Glow:** High-priority elements use an inset micro-highlight: `box-shadow: inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`.
- **Vibrant Indigo Accent Aura:** On hover or focus-visible, interactive surfaces project a soft diffusion: `box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.4), 0 8px 24px -4px rgba(99, 102, 241, 0.25)`.
- **Emerald Pulse:** Used exclusively on active operational indicators: a radial diffuse glow `0 0 16px -2px rgba(16, 185, 129, 0.45)`.
- **Floating Modals & Dialogs:** Layered elevation using dual-tier dark shadows: `box-shadow: 0 16px 40px -8px rgba(0, 0, 0, 0.8), 0 0 0 1px rgba(255, 255, 255, 0.1)`.

## Shapes

The design system embraces an architectural balance of **`rounded-2xl` for macroscopic containers** paired with calibrated reductions down the component hierarchy.

- **Primary Container Cards:** Uniformly set to `rounded-2xl` (`1rem` / 16px). This creates the distinctive, modern frame associated with contemporary developer platforms.
- **Nested Surface Modules:** Inner cards and data modules drop to `rounded-xl` (`0.75rem` / 12px) to maintain proportional concentricity with outer borders.
- **Interactive Controls:** Buttons, inputs, chips, and dropdown toggles adopt `rounded-lg` (`0.5rem` / 8px) for crisp interaction affordance.
- **Tags, Pills, and Telemetry Badges:** Utilize fully rounded pill parameters (`9999px`) to emphasize non-interactive metadata and status states.

## Components

### Buttons
- **Primary:** Gradient fill `linear-gradient(180deg, #6366f1 0%, #4f46e5 100%)`, text pure white (`#ffffff`), top 1px internal highlight `inset 0 1px 0 rgba(255,255,255,0.25)`. On hover, an external glow spreads: `0 0 20px rgba(99, 102, 241, 0.4)`.
- **Secondary (Glass):** `background: rgba(255, 255, 255, 0.05)`, `border: 1px solid rgba(255, 255, 255, 0.1)`, text `#f8fafc`. Hover transitions to `rgba(255, 255, 255, 0.08)` with border color shifting to `#94a3b8`.
- **Ghost / Subtle:** Background transparent, text `#94a3b8`. Hover adds `background: rgba(255, 255, 255, 0.04)` and brightens text to `#ffffff`.

### Input Fields & Search Bars
- Solid dark foundation: `background: rgba(9, 10, 15, 0.75)` with `border: 1px solid rgba(255, 255, 255, 0.1)`.
- Typographic style: `14px` Inter, text `#f8fafc`, placeholder `#475569`.
- Height: `40px`, padding: `0 12px`.
- Focus State: Zero native browser outline; border becomes `#6366f1` coupled with `box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2)`.

### Cards & Container Panels
- Structural styling: `rounded-2xl` outer radius, `rgba(15, 23, 42, 0.65)` background, `backdrop-filter: blur(16px)`.
- Border treatment: Subtle 1px translucent perimeter `rgba(255, 255, 255, 0.08)`.
- Interactive Card Variant: Hover causes border transition to `rgba(99, 102, 241, 0.3)` accompanied by an ambient surface lift of `translateY(-2px)`.

### Chips & Telemetry Badges
- **Status Indicator (Operational):** Pill shape, `background: rgba(16, 185, 129, 0.12)`, `border: 1px solid rgba(16, 185, 129, 0.25)`, text `#10b981`. Features a 6px breathing emerald light dot.
- **Filter Chip:** `rounded-lg`, height `28px`, `background: rgba(255, 255, 255, 0.04)`, `border: 1px solid rgba(255, 255, 255, 0.08)`. Active state fills with `rgba(99, 102, 241, 0.15)` and border `#6366f1`.

### Checkboxes & Radio Buttons
- Checkbox: 16px square, `rounded-md`, border `1px solid rgba(255, 255, 255, 0.2)`. Checked state transitions to solid `#6366f1` with a pure white SVG tick.
- Radio: 16px circle, identical border logic. Selected state features an interior 6px concentric `#6366f1` dot.

### Lists & Data Tables
- Row dividers: `border-b: 1px solid rgba(255, 255, 255, 0.04)`.
- Interactive rows highlight seamlessly with `background: rgba(255, 255, 255, 0.02)` on hover.
- Metrics and labels align horizontally with fixed height baselines and mono-spaced numeric columns.

### Command Palette (K-Bar) & Keyboard Modals
- Central floating surface with elevation `0 24px 60px rgba(0, 0, 0, 0.85)`.
- Keyboard shortcuts rendered as tactile kbd keys: `background: rgba(255, 255, 255, 0.06)`, `border: 1px solid rgba(255, 255, 255, 0.12)`, `border-bottom: 2px solid rgba(255, 255, 255, 0.2)`, `rounded-md`, text `11px`.