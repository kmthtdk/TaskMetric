# Project Progress Report

A **single, self-contained HTML file** for presenting and editing a project progress report — no server, no build step, no internet required. Open `index.html` in any modern browser and it just works, including on an **air-gapped machine**.

Built as a lightweight alternative to PowerPoint for recurring executive status reports: author the data in a clean dashboard, then switch to a full-screen slide deck to present.

## Highlights

- **Self-contained & offline** — one `index.html`, all CSS/JS inline, fonts embedded as base64, icons as inline SVG. No CDN, no dependencies.
- **Editable in place** — click **Edit**, then edit KPIs, timeline phases, workstreams, risks, lessons, media and project meta through slide-in forms. Drag to reorder, undo deletes.
- **Data model**
  - KPI strip with an auto-calculated overall-progress ring
  - Vertical **timeline** of phases with status + typed side callouts
  - **Workstream** progress bars
  - Hand-rolled **SVG charts** (bar / horizontal bar / line / donut) driven by live data
  - **Risk matrix** (impact × likelihood) with numbered risk cards
  - Lessons & knowledge
  - **Media** — embed screenshots / mockups / demo videos (stored inside the file)
- **Presentation mode** — full-screen 16:9 slide deck built from the data, with keyboard / presentation-remote navigation (arrows, space, PageUp/PageDown), blank screen (`B`), progress dots, an auto **agenda** slide and custom text slides. Pick and reorder slides from the **Slides** popup.
- **Multi-project** — keep several reports in one file and switch between them.
- **Open import/export** — JSON (full report, re-importable), CSV per section (Excel / Sheets, with downloadable samples), Markdown document, and **Save as file (.html)** which bakes the current data + media into a fresh standalone copy.
- **Emerald Intelligence** design system — light UI, deep-emerald + lime accents, Hanken Grotesk / Inter / JetBrains Mono typography, dark presentation slides.

## Usage

1. Open `index.html` in a browser (double-click, or `File →` it).
2. Click **Edit** to change any content; changes autosave to the browser (`localStorage`).
3. Click **Present** (or `F` for full screen) to run the slide deck. `Esc` exits.
4. Use **Save as file (.html)** to export a portable copy that carries your data + media — the safe way to keep changes across machines or app updates.

> **Data safety:** `localStorage` is a per-browser scratch cache. The canonical backup is **Export data → JSON** or **Save as file (.html)**.

## Consolidating several people's reports

When multiple people each author their own report, combine them into **one file, split by person**:

1. Each person exports their report — **Save as file (.html)** or **Export → JSON** (setting *Presented by* names them).
2. Merge, either way:
   - **In the app:** **Import data → Merge report files** and pick everyone's `.html`/`.json` at once, or
   - **With the dedicated tool:** open `consolidator.html`, drag-drop the files, rename/reorder people, **Export merged report (.html)**.
3. The merged file opens on a **Team overview** — one card per person (overall %, status, open/high risks, KPIs); click a card to open that person's full report. Each person is a project, switchable from the sidebar.

Combine reads each file's embedded JSON (`<script id="savedData">`, any `application/json` block, or a raw `.json`). If a file uses a **different structure** — foreign field names / nesting such as `report / sprints / epics / raid / kpis / retro` — it is **auto-mapped** into the report schema (aliases like sprints/milestones → timeline, epics/modules → workstreams, risks+issues → risks, metrics → kpis, retro → lessons). Files with no recognisable report data are skipped with a message. Sample inputs to try live in `samples/`.

`consolidator.html` is generated from `index.html` so it always matches the current design — rebuild it with `node scripts/build-consolidator.js` after changing the app.

Full reference for this feature — data contract, the `extractReports` pipeline, the complete `adaptForeign` alias mapping, and how to extend it — is in [`docs/CONSOLIDATION.md`](docs/CONSOLIDATION.md).

## Tech

Plain HTML + CSS + vanilla JavaScript. No frameworks, no bundler, no network calls at runtime.

## Credits & licenses

- Application code: MIT (see `LICENSE`).
- Visual direction adapted from a Google **Stitch** export ("Emerald Intelligence").
- Embedded fonts are open-source and redistributed under their own licenses:
  - **Hanken Grotesk**, **Inter**, **JetBrains Mono** — SIL Open Font License 1.1.

Sample content is fictional and for demonstration only.
