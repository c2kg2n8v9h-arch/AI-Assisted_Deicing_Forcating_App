# Infrastructure

Technology-specific delivery implementations live under their native platform
folders, while this directory holds platform-neutral infrastructure guidance.

The first CI implementation is GitHub Actions:

- `.github/actions/setup-workspace/action.yml` provides reusable, locked workspace
  setup.
- `.github/workflows/automation-quality-gate.yml` implements the quality gate and
  Chrome/Edge smoke matrix.

Future Azure DevOps, GitLab, Jenkins, container, or grid adapters should call the
same `pnpm` commands. They should not duplicate the validation or test behavior in
platform-specific scripts.

CI pipelines, containers, browser-grid definitions, and monitoring configuration
belong here. Infrastructure must call public workspace commands rather than
reimplementing framework behavior in pipeline scripts.
