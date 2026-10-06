---
name: Pim
description: Gevouwen Schaal. Graphite paper by night, cotton paper by day, one sweeping compass arc.
colors:
  graphite-paper: "#121211"
  graphite-raised: "#1a1917"
  graphite-sunk: "#0c0c0b"
  bone-ink: "#ece6da"
  bone-ink-soft: "#cfc8bb"
  bone-ink-mute: "#9a958c"
  bone-ink-faint: "#6e6a63"
  graphite-rule: "#34322e"
  graphite-rule-strong: "#4a4742"
  cotton-paper: "#f2efe6"
  cotton-raised: "#fbfaf6"
  cotton-sunk: "#e8e4d9"
  carbon-ink: "#1c1c1c"
  carbon-ink-soft: "#33322f"
  carbon-ink-mute: "#5e5b55"
  carbon-ink-faint: "#85817a"
  cotton-rule: "#d3cfc4"
  cotton-rule-strong: "#b9b4a8"
typography:
  display:
    fontFamily: "Bodoni Moda, Bodoni 72, Didot, Georgia, serif"
    fontSize: "clamp(5.5rem, 3rem + 15vw, 15rem)"
    fontWeight: 400
    lineHeight: 0.84
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Bodoni Moda, Bodoni 72, Didot, Georgia, serif"
    fontSize: "clamp(2.8rem, 1.8rem + 4.6vw, 6rem)"
    fontWeight: 400
    lineHeight: 1.02
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Bodoni Moda, Bodoni 72, Didot, Georgia, serif"
    fontSize: "clamp(1.6rem, 1.3rem + 1.4vw, 2.4rem)"
    fontWeight: 400
    lineHeight: 1.3
  lead:
    fontFamily: "Bodoni Moda, Bodoni 72, Didot, Georgia, serif"
    fontSize: "clamp(1.25rem, 1.12rem + 0.6vw, 1.55rem)"
    fontWeight: 400
    lineHeight: 1.45
  body:
    fontFamily: "Bodoni Moda, Bodoni 72, Didot, Georgia, serif"
    fontSize: "clamp(1.02rem, 0.96rem + 0.3vw, 1.18rem)"
    fontWeight: 400
    lineHeight: 1.6
    fontFeature: "\"onum\", \"pnum\""
  label:
    fontFamily: "Bodoni Moda, Bodoni 72, Didot, Georgia, serif"
    fontSize: "clamp(0.82rem, 0.78rem + 0.2vw, 0.9rem)"
    fontWeight: 400
    letterSpacing: "0.14em"
    fontFeature: "\"lnum\""
  data:
    fontFamily: "Fragment Mono, ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "0.86em"
    fontWeight: 400
    letterSpacing: "0"
    fontFeature: "\"tnum\""
rounded:
  hairline: "2px"
  round: "999px"
  arch-button: "999px 999px 0.4rem 0.4rem"
  arch-panel: "50% 50% 1.5rem 1.5rem / 2.25rem 2.25rem 1.5rem 1.5rem"
  arch-frame: "50% 50% 0.3rem 0.3rem / 9% 9% 0.3rem 0.3rem"
spacing:
  gutter: "clamp(1rem, 4vw, 3.5rem)"
  section-y: "clamp(6rem, 13vw, 12rem)"
  home-section-y: "clamp(4rem, 8vw, 7.5rem)"
  measure: "66ch"
  tap-min: "2.75rem"
components:
  button-arch-primary:
    backgroundColor: "{colors.bone-ink}"
    textColor: "{colors.graphite-paper}"
    typography: "{typography.lead}"
    rounded: "{rounded.arch-button}"
    padding: "0.95rem 2.1rem 0.7rem"
    height: "3.25rem"
  button-arch-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.bone-ink}"
    typography: "{typography.lead}"
    rounded: "{rounded.arch-button}"
    padding: "0.95rem 2.1rem 0.7rem"
    height: "3.25rem"
  button-circle:
    backgroundColor: "transparent"
    textColor: "{colors.bone-ink}"
    rounded: "{rounded.round}"
    size: "2.75rem"
  button-circle-pressed:
    backgroundColor: "{colors.bone-ink}"
    textColor: "{colors.graphite-paper}"
    rounded: "{rounded.round}"
    size: "2.75rem"
  input-arch:
    backgroundColor: "{colors.graphite-raised}"
    textColor: "{colors.bone-ink}"
    typography: "{typography.body}"
    padding: "1.15rem 1.1rem 0.8rem"
    height: "3.6rem"
  card-arc:
    backgroundColor: "{colors.graphite-raised}"
    textColor: "{colors.bone-ink-soft}"
  nav-link:
    textColor: "{colors.bone-ink-mute}"
    typography: "{typography.body}"
    height: "2.75rem"
  nav-link-current:
    textColor: "{colors.bone-ink}"
  thumb-bar:
    backgroundColor: "{colors.graphite-raised}"
    rounded: "50% 50% 1.85rem 1.85rem / 1rem 1rem 1.85rem 1.85rem"
    padding: "0.7rem 0.45rem 0.45rem 0.6rem"
---

# Design System: Pim

> Typography update (Pim, 2026-10-06): headings in Bodoni Moda upright at optical size 18, running text and UI in Hanken Grotesk, no italics anywhere. Where this file still mentions italic Bodoni, this note wins.

## Overview

**Creative North Star: "Gevouwen Schaal" (the curved crease shell)**

One line makes the form. The site is a sheet of paper scored by a single sweeping compass arc: graphite paper by night (the default), cotton paper by day. Everything that holds content takes the shape of that arc: buttons, cards, fields, sheets and the mobile thumb bar are arched on top and nearly square at the foot. A live WebGL shell, bending with the pointer, is the one sculptural object; every other surface stays flat paper with hairline rules.

The palette is monochrome by construction. There is no hue accent: the active element is marked by full-strength ink (the "crease ink") against muted ink, and by an arc that draws itself in. A static fibre grain sits over the whole page at 7% (graphite) or 9% (cotton) overlay. Type is one family, Bodoni Moda, italic for display, names, labels and actions, roman for reading; Fragment Mono appears only for code and data.

Density is calm and editorial: generous section padding, a 66ch reading measure, numbered plates with roman numerals. Motion is paper motion: unfolding from a crease, arcs drawing in, the theme change opening as a circle from the toggle. All of it collapses under reduced motion.

Visual rejections confirmed by the direction contract: no dark bento-grid portfolio, no glass, no gradients, no neon, no custom cursor ring.

**Key Characteristics:**
- Two papers, one ink family; no hue accent.
- Arched tops on every container; round circle-arrow buttons beside them.
- Hairline compass arcs (1px, non-scaling) cross the layout as the signature line.
- Bodoni Moda italic for voice, roman for reading, Fragment Mono only for data.
- Depth only from soft, long, low-opacity drop shadows on floating surfaces.

## Colors

A two-paper monochrome: warm graphite and warm cotton, each with a four-step ink ladder and two rule weights. Theme tokens live as CSS custom properties (`--paper`, `--ink`, `--rule` and siblings) on `[data-theme]`, so components always reference the role, never the hex.

### Primary
- **Bone Ink** (graphite theme) / **Carbon Ink** (cotton theme): the crease ink. Headings, the current nav link, the primary arch button fill, pressed circle buttons, focus outlines, selection background, and the arc that lifts above a hovered button or focused field.

### Neutral
- **Graphite Paper** / **Cotton Paper**: the page and the fixed header.
- **Graphite Raised** / **Cotton Raised**: anything that sits on the page: arc cards, fields, sheets, the thumb bar, the dialog panel.
- **Graphite Sunk** / **Cotton Sunk**: image wells behind project previews and screenshots.
- **Ink Soft**: running text (the default `html` color) and leads.
- **Ink Mute**: secondary text, inactive nav and language links, labels, placeholders, meta lines.
- **Ink Faint**: decorative separators only (the middle dot between meta items, the language dot). Not for text that must be read.
- **Rule**: section dividers, list rules, the header's bottom border once scrolled.
- **Rule Strong**: card, field and button outlines at rest, the circle-button ring, and every hairline compass arc.
- **Shade 1 to 3** (graphite `#2a2926`, `#5c5953`, `#8e8a82`; cotton `#d6d6d6`, `#a8a8a8`, `#6a6a6a`): graphite shading on curved surfaces and the scrollbar thumb only.

### Named Rules
**The Crease Ink Rule.** Emphasis is ink strength, not hue. Active, current, focused and pressed states move from Ink Mute or Rule Strong to full Ink; nothing on the site introduces a colored accent.

**The Shade On Curves Rule.** The shade ramp is reserved for curved surfaces (the WebGL shell, the scrollbar thumb). Flat panels use Raised and Sunk paper, never shade.

## Typography

**Display Font:** Bodoni Moda (with Bodoni 72, Didot, Georgia), optical size axis on, italic and roman
**Body Font:** Bodoni Moda roman
**Label/Mono Font:** Fragment Mono (with ui-monospace, SF Mono, Menlo), code and data only

**Character:** A high-contrast Didone set as a geometer's notebook: italic carries the voice (the name, headings, actions, labels), roman carries the reading. Old-style proportional numerals in prose; lining numerals in labels and plate numerals.

### Hierarchy
- **Display** (400 italic, `--step-name` clamp(5.5rem to 15rem), line-height 0.84, -0.02em): the name "Pim" in the home hero only.
- **Headline** (400 italic, `--step-4` clamp(2.8rem to 6rem), 1.02): plate and section headings, with the roman plate numeral set inside at 0.38em in Ink Mute.
- **Title** (400, `--step-2` / `--step-3`): the hero intro line (max 25ch), large arch buttons, project titles.
- **Lead** (400, `--step-1`, 1.45): one sentence under a heading, max 38ch on home; also the arch button label size.
- **Body** (400 roman, `--step-0`, 1.6): reading text at a 66ch measure, `text-wrap: pretty`.
- **Label** (400 italic, `--step--1`, 0.14em tracking, uppercase, lining numerals): form labels, definition terms, status and direction cues attached to a link or value.
- **Data** (Fragment Mono 400, 0.86em, tabular): code, commands and measured numbers.

### Named Rules
**The Label Is Not An Eyebrow Rule.** The tracked italic capital label names a field, term, status or link direction it sits beside. It never floats above a heading as a kicker; a plate heading carries its numeral inside, and its optional lead goes below.

**The Mono For Data Rule.** Fragment Mono appears only where the content is code or a measured value.

## Layout

One spacing scale for the whole site. Plates pad by `--section-y` vertically and `--gutter` horizontally; home sections use a tighter clamp(4rem, 8vw, 7.5rem). Reading text sits at 66ch. The fixed header is 4rem plus safe area and hides on scroll down. From 64rem the header carries the page links; below 64rem an arched thumb bar sits fixed at the bottom (max 26rem wide) and carries them instead. The home hero is a two-column grid from 60rem (copy 1fr, shell 1.08fr); on phones the shell sits below the actions. Decorative arcs may bleed past plate edges and are clipped sideways (`overflow-x: clip`) so nothing scrolls horizontally. Every tap target is at least 2.75rem.

Layers: header 40, thumb bar 42, sheets 50, paper grain 60, skip link 100.

## Elevation & Depth

Flat paper by default, with tonal layering (Sunk under Paper under Raised) doing most of the work. Drop shadows appear only on surfaces that float above the page: the thumb bar, the dialog panel, the project sheet and the floating project preview. They are long, soft and negatively spread so they read as paper lifting, never as a box. The shadow color is a theme token (`--shadow-color`: black in graphite, warm brown-grey in cotton).

### Shadow Vocabulary
- **Thumb lift** (`box-shadow: 0 1.25rem 2.5rem -1.5rem hsl(var(--shadow-color) / 0.55)`): the mobile thumb bar.
- **Preview lift** (`box-shadow: 0 28px 56px -30px hsl(var(--shadow-color) / 0.55)`): the hover preview of a project.
- **Panel lift** (`box-shadow: 0 2rem 4rem -2.5rem hsl(var(--shadow-color) / 0.6)`): centered dialog panels.
- **Sheet rise** (`box-shadow: 0 -24px 80px -40px hsl(var(--shadow-color) / 0.6)`): the project sheet rising from below on wide screens.
- **Inset hairline** (`box-shadow: inset 0 0 0 1px var(--rule-strong)`): a drawn outline inside terminal and lab controls.

### Named Rules
**The Floating Only Rule.** A shadow means the surface floats over the page. Cards and buttons at rest have none; they are outlined in Rule Strong instead.

## Shapes

The arch is the form. Containers have a curved top and small, near-square bottom corners, built either with elliptical border radii or with an SVG outline whose top edge is a shallow quadratic arc (`M0.5 299.5 V22 Q200 -10 399.5 22 V299.5 Z`, non-scaling 1px stroke). Buttons that hold text are arched; buttons that hold one icon are perfect circles. The compass arc itself is a 1px hairline in Rule Strong with `pathLength=1` so it can draw in. Plain rectangles appear only where the content is rectangular data (form controls inside their arched shell, code blocks with small 0.25 to 0.45rem corners). The authored icon set is 24px, 1.25 stroke, round caps.

## Components

### Buttons
Arched and inked; a second arc lifts above on hover.
- **Shape:** SVG arch body behind the label (top a full curve, foot nearly square); 3.25rem min height, 3.9rem in the large size.
- **Primary:** Ink fill and stroke, label in On Ink, italic at `--step-1` (large: `--step-2`), padding 0.95rem 2.1rem 0.7rem.
- **Secondary:** transparent fill, Rule Strong stroke, Ink label; hover tints the fill to 6% ink and the stroke to Ink.
- **Hover / Focus:** an Ink arc fades in and rises 6px above the button (`--dur-2`/`--dur-3`, `--ease-out-expo`); the trailing icon nudges up and right 2px; active scales to 0.975; focus outline offset 6px; disabled at 0.45 opacity.
- **Trailing circle:** an optional 2.1rem Rule Strong ring around the arrow, turning Ink on hover.

### Circle Buttons
- **Style:** 2.75rem round (sm 2.25rem, lg 3.75rem), 1px Rule Strong ring, Ink icon, transparent.
- **State:** hover ring to Ink with a 7% ink tint and the icon rotates -8deg; pressed (`aria-pressed`) fills Ink with On Ink icon; active scales to 0.94.

### Cards / Containers
- **Corner Style:** shallow arc top drawn in SVG, square foot.
- **Background:** Raised paper.
- **Shadow Strategy:** none at rest (see Floating Only Rule).
- **Border:** 1px Rule Strong, turning Ink on hover or when active.
- **Project frames:** screenshots sit in Sunk paper wells with an arched top (`50% 50% 0.3rem 0.3rem / 9% 9% 0.3rem 0.3rem`) and a Rule Strong border.

### Inputs / Fields
- **Style:** an SVG arched sheet in Raised paper with a 1px Rule Strong stroke; label above in the Label style; control text in Ink; italic Ink Mute placeholder; a 1px vertical divider and a small arrow at the right.
- **Focus:** stroke goes to Ink at 1.75, a second arc lifts above the field, the divider and arrow turn Ink and the arrow nudges up and right.
- **Error / Disabled:** invalid fields keep the Ink stroke but dash it (5 4); disabled controls drop to 0.7 opacity with a progress cursor.

### Navigation
- **Header:** crease-disc mark plus "Pim" in italic at `--step-1` (the mark rotates -16deg on hover), page links in Ink Mute, current link in Ink with a short hairline arc drawn beneath it; hover on other links draws part of that arc. Language switch in the Label style with a 4px dot under the current language; theme toggle is a circle button. The header gains a Rule bottom border once scrolled and hides on scroll down.
- **Mobile:** an arched thumb bar on Raised paper with a Rule Strong border and the Thumb lift shadow, carrying the same links.

### Plate Heading (signature)
Headline-size italic heading with its roman plate numeral inside, at 0.38em in Ink Mute, aligned to the baseline; an optional lead sentence follows below at `--step-1`.

### Compass Arc (signature)
A 1px hairline arc in Rule Strong that crosses the hero headline and section layouts, decorative and hidden from assistive tech; it draws in on entry where scroll-driven animation is supported.

## Do's and Don'ts

### Do:
- **Do** mark the active, current or focused element by moving it to full Ink; keep everything else in Ink Soft, Ink Mute or Rule Strong.
- **Do** give every new container an arched top and a near-square foot, and every icon-only control a 2.75rem circle.
- **Do** draw outlines and arcs as 1px non-scaling hairlines in Rule Strong.
- **Do** set voice in Bodoni Moda italic and reading text in roman at the 66ch measure.
- **Do** use the motion tokens (`--dur-1` to `--dur-5`, `--ease-paper`, `--ease-out-expo`, `--ease-crease`) and let reduced motion collapse them.
- **Do** keep tap targets at 2.75rem or larger.

### Don't:
- **Don't** introduce a hue accent, a gradient, glass or a neon glow.
- **Don't** place a tracked uppercase label above a heading as a kicker or eyebrow.
- **Don't** use Fragment Mono for prose, headings or labels.
- **Don't** add a drop shadow to a surface that rests on the page.
- **Don't** use Ink Faint for text that must be read; it is for separators.
- **Don't** lay content out as a dark bento grid of tiles.
