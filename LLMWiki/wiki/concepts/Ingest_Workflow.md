---
tags: [concept, workflow]
source_count: 1
---

# Ingest Workflow

The [[Ingest_Workflow]] is the process by which an [[LLM_Wiki]] absorbs new information from a raw source. 

## Process
1. **Drop Source**: The user places a raw file in the `raw/` directory.
2. **LLM Processing**: The agent reads the source, extracts key takeaways, and updates or creates relevant concept and entity pages.
3. **Cross-Referencing**: The agent maintains graph integrity by adding bidirectional links to new and existing notes.
4. **Logging & Indexing**: The agent updates the [[Map_of_Content]] (`index.md`) and logs the action in `log.md`.

---
**Sources:**
- [[LLM_Wiki_Idea_File]]
