# Agents

## Code quality checks

Always run the typecheck, linter, and formatter from the **repository root**:

```sh
npm run typecheck
npm run lint
npm run format
```

Never `cd` into a workspace directory to run these, the scripts are defined in the root `package.json`.

## Design

- Maintain a clean, minimal layout across the entire application.
- Prioritize composition. Styles should be concentrated in `components/`, `pages/` should compose these components, not define raw styles.
- Business rules belong in `pages/`.

## Development workflow

- Use TDD. Always write tests first, then develop the feature, and loop over this workflow until the feature is complete.
- Prioritize good test coverage. Think about edge cases, boundary values, empty states, error conditions, and invalid inputs.
