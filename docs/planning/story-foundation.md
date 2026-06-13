# Story Foundation Architecture

> **Status:** Planning
> **Date:** 2026-06-13
> **Author:** AC Kodigero

---

## Problem

The current pipeline assumes a novel-centric workflow. The left sidebar menu and project phases are tailored for novel writing, which doesn't translate well to other media types (screenplays, comics, games, etc.). Building a separate pipeline per project type would significantly expand scope and delay launch.

## Decision

Adopt an **IP-first, media-agnostic architecture** with two distinct layers:

1. **Story Foundation** — the shared, media-agnostic core that every project is built upon.
2. **Delivery Layer** — media-specific adapters that translate the foundation into a concrete format.

At project creation, the user selects a delivery type. The pipeline adapts accordingly, but the underlying story data remains universal.

## Delivery Type Strategy

- **Launch with Novel** as the first fully supported delivery type.
- Target **3 delivery types before launch** (e.g., Novel, Screenplay, Comic/Manga).
- Additional types can be added post-launch as output adapters without rearchitecting the core.

---

## Story Foundation Components

These are the building blocks shared by all projects regardless of delivery type.

### 1. Premise & Concept

The seed of the story.

- Logline
- Theme statement
- Genre tags
- Tone
- Central conflict / dramatic question

### 2. Characters

Universal character profiles.

- Role (protagonist, antagonist, mentor, etc.)
- Motivations
- Character arc
- Relationships to other characters
- Backstory

### 3. World

The setting layer.

- Locations
- Rules of the world (magic systems, technology, social structures)
- History / timeline
- Factions or groups

### 4. Plot Structure

The narrative backbone — abstract, not tied to chapters or scenes.

- Acts
- Plot points / turning points
- Subplots and how they interweave
- Story beats

### 5. Themes & Motifs

- Recurring ideas and symbols
- Thematic argument the story is making

### 6. Reference & Research

Supporting material that informs the story.

- Notes
- Inspiration images / mood boards
- Source material

---

## Delivery Layer (Novel Adapter)

When the pipeline moves from foundation to delivery, the novel adapter translates the abstract story into novel-specific structure:

- Plot structure → Chapters and scenes
- Story beats → Scene breakdowns with prose
- Characters → POV assignments, voice notes
- World → Setting descriptions woven into narrative

Other delivery adapters (Screenplay, Comic, etc.) will follow the same pattern — translating the shared foundation into their format-specific outputs.

---

## Open Questions

- How deep should the Story Foundation be before the user can enter the delivery phase?
- Should delivery adapters be switchable mid-project (e.g., adapt a novel into a screenplay)?
- What is the minimum viable Story Foundation for launch?
