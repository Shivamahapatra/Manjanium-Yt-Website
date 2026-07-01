<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

## 🧠 LLMWiki Integration Workflows

### Wiki Location
`O:\AI projects\Manjanium Sports UI\Manjanium Yt Website\LLMWiki`

### Ingest Workflow
When asked to "ingest [filename]" or "ingest INBOX":
1. Read the source file from LLMWiki/raw/
2. Identify core concepts and entities
3. Create/update markdown pages in LLMWiki/wiki/concepts/ and LLMWiki/wiki/entities/
4. Use [[WikiLink]] syntax for ALL cross-references
5. Append new page entries to LLMWiki/index.md under correct section
6. Append timestamped entry to LLMWiki/log.md:
   `- [TIMESTAMP] Ingested: [filename] → Created: [list of wiki pages]`
7. NEVER modify files in LLMWiki/raw/ (read-only source)

### Query Workflow
When asked to "query wiki for [topic]":
1. Read LLMWiki/index.md to find relevant pages
2. Read specific wiki pages found
3. Answer using wiki content as primary source
4. If answer contains new insights, offer to file back to wiki

### Lint Workflow
When asked to "lint wiki":
1. Scan all files in LLMWiki/wiki/
2. Find orphan pages (no inbound [[links]])
3. Find broken [[links]] pointing to non-existent pages
4. Find concepts mentioned in text but not linked
5. Report findings without making changes (lint = report only)

### Session Capture Workflow
After every major coding session or feature completion:
1. Create LLMWiki/raw/session-[YYYY-MM-DD]-[feature].md with:
   - What was built/fixed
   - Key decisions made and why
   - Gotchas and lessons learned
   - Files changed
   - Next steps
2. Ask user: "Ingest this session into wiki? (y/n)"

### Boundaries
- ONLY read/write within LLMWiki/ directory
- NEVER modify LLMWiki/raw/ files (read-only)
- ALWAYS use [[WikiLink]] syntax for cross-references
- ALWAYS update index.md and log.md after any wiki changes
