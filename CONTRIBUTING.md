# Contributing – Group 4 workflow

These rules implement the Configuration Management Plan (PMP Part 6). The lecturer grades them (Sprint criterion
S5: branches, reviewed pull requests, conventional commits, version tags), so please follow them exactly.

## Branches

| Branch | Purpose |
|---|---|
| `main` | Always deployable; production on Vercel. **No direct commits** – protected, PR only. |
| `feature/<pbi-id>-<short-name>` | New work for one Product Backlog Item, e.g. `feature/pbi-07-book-search` |
| `fix/<short-name>` | Bug fixes found in testing |
| `docs/<short-name>` | Documentation-only changes |

## Commits – Conventional Commits

```
<type>(<scope>): <summary in imperative mood>
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `style`, `chore`, `ci`.
Scopes: `f1`, `f2`, `f3`, `f4`, `f5`, `cr04`, `db`, `ui`, `deps`.

Examples: `feat(f5): filter books by price range`, `fix(cr04): reject renamed GIF files`, `test(f2): boundary cases for price`.

Every member must have their own commits – the lecturer checks the repository when calculating individual scores.

## Pull requests

1. Push your branch and open a PR into `main` using the template.
2. Link the PBI / Trello card and list which Acceptance Criteria were tested.
3. CI (lint, typecheck, tests, build) must pass.
4. **At least one other member reviews and approves** before merging. Use "Squash and merge".
5. Check the Vercel Preview URL on the PR before approving.

## Database changes

Never edit the schema only in the Supabase dashboard. Add a new file in `supabase/migrations/`
named `YYYYMMDDHHMMSS_description.sql`, run it in the SQL Editor, and commit it in the same PR.

## Tags and releases

- After the CCB approves CR-04: tag the updated baseline, e.g. `baseline-v1.1-cr04`.
- End of Sprint 3: tag `v1.0` on `main` and publish GitHub release notes (features, known issues, how to run).

## Recommended GitHub settings (repository owner)

- Settings → Branches → add a rule for `main`: require a pull request, 1 approval, and the `CI` status check.
- Settings → Collaborators: invite every member and the lecturer.
