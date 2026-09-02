# MCP servers

MCP servers expose small, explicitly permitted sets of tools or resources. Each
server must document authorization, input/output schemas, side effects, and data
boundaries. Read-only capabilities should be implemented before write actions.

MCP is an integration boundary, not permission to expose the framework. Implement
one server per bounded capability. Declare every tool's `read` or `write` effect,
require approval for writes, validate inputs/outputs, and emit sanitized audit
metadata. No MCP server is implemented in Step 10.
