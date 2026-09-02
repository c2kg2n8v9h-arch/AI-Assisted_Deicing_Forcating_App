# Adding a new project

This is the intended onboarding flow. Exact commands will be added after the
project template and workspace dependencies are implemented.

1. Create `projects/<project-name>/` from the approved project template.
2. Declare which runner and shared packages the project uses.
3. Add non-secret environment configuration and update `.env.example` if needed.
4. Organize tests by business capability rather than one global page folder.
5. Keep application selectors, URLs, and test data inside the project.
6. Reuse a domain module only when the behavior is genuinely common.
7. Add smoke tags and deterministic assertions before enabling optional AI.
8. Run type checking, linting, tests, and reporting locally.
9. Add the project to the CI matrix.
10. Document project ownership, environments, test-data requirements, and support
    procedures.
