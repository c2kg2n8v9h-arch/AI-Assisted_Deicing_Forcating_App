# Dependency rules

These rules prevent the workspace from becoming a collection of circularly
dependent folders.

1. Projects may depend on domains, runners, adapters, and shared packages.
2. Domains may depend on technology-independent contracts, not projects.
3. Runners may depend on shared contracts and technology adapters, not projects.
4. Shared contracts depend on no runner, project, provider, or domain.
5. Provider adapters implement shared interfaces; shared packages do not import
   provider implementations directly.
6. AI packages may consume sanitized evidence contracts but cannot change the
   deterministic test result.
7. MCP servers expose narrowly scoped capabilities and cannot read unrelated
   project or conversation context.
8. Infrastructure invokes documented workspace commands and contains no hidden
   business assertions.

Package-level linting and TypeScript project references will enforce these rules
as implementations are introduced.
