# Agents

## Code quality checks

```sh
# Whole repo
npm run typecheck
npm run lint
npm run format

# Scoped to a workspace
npm run frontend:typecheck
npm run frontend:lint
npm run frontend:format

npm run api:typecheck
npm run api:lint
npm run api:format
```

## Design

- Prioritize composition. Styles should be concentrated in `components/`, `pages/` should compose these components, not define raw styles.
- Business rules belong in `pages/`.
- Use the already implemented layouts as reference when building new ones. Match their structure, spacing, and patterns.
- Use the `frontend-design` skill whenever necessary to think through design decisions.

## Development workflow

- Use TDD. Always write tests first, then develop the feature, and loop over this workflow until the feature is complete.
- Prioritize good test coverage. Think about edge cases, boundary values, empty states, error conditions, and invalid inputs.
