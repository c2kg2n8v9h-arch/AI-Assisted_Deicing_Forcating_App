# Step 3: Workspace initialization

## Objective

Create the reusable repository foundation without installing runtime dependencies
or prematurely implementing WebdriverIO and AI components.

## Activities

1. Pin pnpm 11.19.0 in `package.json`.
2. Define workspace discovery patterns in `pnpm-workspace.yaml`.
3. Add strict shared TypeScript compiler defaults.
4. Add a solution-style root `tsconfig.json` for future project references.
5. Establish architectural folders with boundary documentation.
6. Add environment and Git-ignore safety defaults.
7. Record the architecture, dependency rules, decision, and onboarding path.

## Why pnpm workspaces

The repository will contain multiple runners, projects, and shared packages.
Workspaces allow each unit to declare real dependencies while sharing one
installation and lockfile. pnpm 11.19.0 was already available in the development
environment, whereas npm and npx were not functional.

## Why strict TypeScript defaults

Strict typing catches contract mismatches earlier. Options such as
`noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` reduce ambiguous data
handling, which is especially valuable for configuration and AI response schemas.

## Verification

- Parse JSON and YAML configuration files.
- Confirm expected folder-boundary documents exist.
- Confirm generated artifacts and secrets are excluded from Git.
- Review workspace discovery output without installing dependencies.

## Dependency installation

Intentionally deferred to the next approved build step.

## Human reproduction procedure

**Prerequisites:** Steps 1–2 are approved; Node 24 and pnpm 11.19.0 are available.

```powershell
$frameworkFolders = @(
  'apps/runners', 'apps/ai-worker', 'apps/mcp-servers', 'projects', 'domains',
  'packages/adapters', 'knowledge', 'evals', 'infrastructure', 'artifacts',
  'docs/architecture', 'docs/decisions', 'docs/onboarding', 'docs/build-guide',
  'docs/security', 'scripts', 'types'
)
$frameworkFolders | ForEach-Object {
  New-Item -ItemType Directory -Force -Path $_ | Out-Null
}
```

Create `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json`,
`tsconfig.json`, `.gitignore`, `.env.example`, and `README.md` from the current
reviewed templates. Preserve `private: true`, pinned tool versions, strict compiler
options, workspace patterns, and secret/artifact exclusions.

```powershell
Get-Content package.json | ConvertFrom-Json | Out-Null
Get-Content tsconfig.json | ConvertFrom-Json | Out-Null
git status --short
```

**Expected result:** manifests parse, approved folders exist, Git shows only
intended files, and dependencies have not yet been installed.

**Troubleshooting:** fix JSON comments/trailing commas; correct unmatched workspace
patterns; fix `.gitignore` immediately if secrets or artifacts appear.

### Completion checklist

- [ ] Root manifests parse and tools are pinned.
- [ ] Strict TypeScript and architecture folders exist.
- [ ] Secrets, builds, dependencies, and artifacts are ignored.
- [ ] Installation remains deferred.
