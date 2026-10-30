## Agent skills

### Issue tracker

GitHub Issues are the issue tracker, managed with the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default five triage state labels. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context domain docs at the repository root. See `docs/agents/domain.md`.

### Chinese content

For readable Chinese text in hand-maintained source, documentation, configuration, or test files, apply the workflow for the task:

- Creating: `$stc` selects the profile and drafts; `$shuorenhua:shuorenhua` edits the draft; `$stc` validates the result.
- Editing: `$stc` selects the profile; `$shuorenhua:shuorenhua` performs the only rewrite using both Skill rules and the original text; `$stc` validates the result; `$shuorenhua:shuorenhua` checks the result against the original.
- Reviewing: `$stc` reviews against its rules, then `$shuorenhua:shuorenhua` reviews expression and preservation; both report findings only and change no files.

This rule covers documentation, comments, userscript metadata such as `@description`, UI copy, and attributes such as `alt`, `title`, `aria-label`, and `placeholder`. For creating or editing, this rule authorizes `$shuorenhua:shuorenhua` to process Chinese comments in scope.

When the Skills conflict, follow the user's requested mode and scope first, then preserve facts and project terms, then apply STC style rules.
