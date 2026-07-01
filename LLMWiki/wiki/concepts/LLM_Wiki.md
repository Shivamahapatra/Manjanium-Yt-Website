---
tags: [concept, knowledge-management]
source_count: 1
---

# LLM Wiki

An [[LLM_Wiki]] is a persistent, compounding knowledge base maintained entirely by an LLM agent. Unlike standard RAG systems which re-derive knowledge from raw documents on every query, an LLM Wiki sits between the user and the raw sources, providing a structured, interlinked collection of markdown files.

## Core Principles
- **Compounding Knowledge**: The wiki gets richer with every source added. Cross-references, contradictions, and synthesis are done at [[Ingest_Workflow]] time, not query time.
- **Agent Maintenance**: The human curates sources and asks questions; the LLM does all the bookkeeping, cross-referencing, and summarization.
- **Immutable Sources**: Raw documents are never modified.

## Use Cases
- Personal self-improvement and journaling.
- Deep research on a topic over months.
- Book companion wikis.
- Internal team wikis fed by Slack and meetings.

---
**Sources:**
- [[LLM_Wiki_Idea_File]]
