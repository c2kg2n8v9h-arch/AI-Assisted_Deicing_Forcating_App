# Step 4: TypeScript quality foundation

## Objective

Establish one type-safety, linting, and formatting standard before adding runner,
project, adapter, or AI implementation code.

## Dependencies

| Dependency          | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `typescript`        | Static type checking and workspace builds        |
| `@types/node`       | Type definitions matching the Node.js 24 runtime |
| `eslint`            | General static code analysis                     |
| `@eslint/js`        | ESLint's recommended JavaScript rules            |
| `typescript-eslint` | TypeScript parser and type-aware lint rules      |
| `prettier`          | Consistent formatting for code and documentation |

All dependencies are development-only because they build or validate the
framework; they are not application runtime dependencies.

## Commands used

```bash
pnpm add --save-dev --workspace-root \
  typescript @types/node eslint @eslint/js typescript-eslint prettier
```

The registry initially selected TypeScript 7.0.2. The installed
`typescript-eslint` version declared support for TypeScript versions below 6.1,
so `pnpm peers check` correctly reported an incompatibility. A stable TypeScript
6 release was not available; therefore TypeScript was aligned to the supported
stable 5.9 line. Node type definitions were aligned from version 26 to the actual
Node 24 runtime.

```bash
pnpm add --save-dev --workspace-root typescript@^5.9.3 @types/node@^24.0.0
pnpm peers check
```

## Configuration

- `eslint.config.mjs` uses ESLint's flat configuration and type-aware TypeScript
  rules.
- `.prettierrc.json` defines repository-wide formatting.
- `.prettierignore` excludes dependencies, generated builds, test evidence, and
  the generated lockfile.
- `pnpm-lock.yaml` records the complete resolved dependency graph.
- `types/environment.d.ts` gives the approved environment keys compile-time
  types and provides the initial root type-checking input before child packages
  are implemented.

Type-aware linting includes explicit protection against unhandled promises. This
is especially important in browser automation, where a missed `await` can make a
test continue before the browser action finishes.

## Public quality commands

```bash
pnpm format        # Rewrite supported files to the approved format
pnpm format:check  # Check formatting without changing files
pnpm lint          # Run ESLint and reject warnings
pnpm typecheck     # Run the TypeScript solution build
pnpm validate      # Run formatting, linting, and type checking
```

## Verification criteria

1. `pnpm peers check` reports no dependency compatibility issues.
2. `pnpm format:check` passes.
3. `pnpm lint` passes with zero warnings.
4. `pnpm typecheck` passes.
5. `pnpm validate` passes as the combined quality gate.

## Human reproduction procedure

**Prerequisites:** Step 3 is complete and dependency-registry access is approved.

```bash
pnpm add --save-dev --workspace-root \
  typescript@^5.9.3 @types/node@^24.0.0 eslint @eslint/js \
  typescript-eslint prettier
pnpm install --strict-peer-dependencies
pnpm peers check
pnpm format
pnpm validate
```

Create/review `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, root
TypeScript files, and `types/environment.d.ts`. Preserve `pnpm-lock.yaml`.

**Expected result:** peer check, Prettier, ESLint, and TypeScript all exit `0` with
no warnings.

**Troubleshooting:** align unsupported TypeScript to 5.9; run `pnpm format` before
rechecking; include typed files in a tsconfig; allow lifecycle scripts only after
reviewing the minimum required package.

### Completion checklist

- [ ] Lockfile and peer graph are valid.
- [ ] Strict typing, formatting, and zero-warning linting are active.
- [ ] Unhandled promises are rejected.
- [ ] `pnpm validate` passes.
