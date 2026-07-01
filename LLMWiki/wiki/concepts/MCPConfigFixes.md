# MCP Config Fixes

Tags: #mcp #antigravity #config #windows

## Overview
Important configuration adjustments required for running Model Context Protocol (MCP) servers locally, especially on Windows inside the Antigravity IDE.

## Known Gotchas
1. **WebFetch MCP (uvx vs npx):** Some community MCP servers default to using `uvx` in their config. On Windows without `uvx` installed, this will silently fail. Always change the `command` to `npx` in `mcp_config.json` if relying on Node.js packages.
2. **Global Installs Required:** Certain MCPs (like `mcp-remote` and Prisma/SQL servers) may fail if executed directly via `npx` dynamically. They should be globally installed (`npm i -g`) before registering them in the MCP config.
3. **Path Escaping:** Windows paths in `mcp_config.json` (e.g., `O:/AI projects/...`) must use forward slashes `/` or double backslashes `\\` to avoid JSON parsing errors.

## Related
- [[session-monorepo-migration]]
