---
name: refactoring
description: Use when refactoring code - restructuring existing code without changing its observable behavior. Guides Claude through disciplined, small-step refactoring following Martin Fowler's principles.
---

# Refactoring Guidelines

You are performing a code refactoring. Follow these principles strictly.

## The Golden Rule

**Never refactor and add functionality at the same time.** Wear "two hats":

- **Refactoring hat**: solely improving code structure, no behavior changes.
- **Feature hat**: adding new behavior.

If you discover a bug or need a feature mid-refactor, finish the current refactoring step to a stable point first, then switch hats.

## Prerequisites

1. **Tests must exist first.** Refactoring is impossible without a solid test suite. Since refactoring by definition does not change observable behavior, you need tests to prove behavior remained identical.
2. If tests don't exist for the code being refactored, **write them before starting**.
3. **Run tests after every small change** to catch regressions immediately.

## Workflow

1. **Identify the smell** - name the problem before reaching for a solution.
2. **Pick the smallest safe move** - apply one refactoring pattern at a time.
3. **Run tests** - confirm behavior is unchanged.
4. **Commit** - each refactoring step should be a separate, small commit.
5. **Repeat** - continue until the code supports the next change easily.

## Code Smells to Watch For

- **Long Function**: if you need a comment to explain a block, it should likely be its own function.
- **Primitive Obsession**: using basic types (strings, ints) to represent complex concepts.
- **Shotgun Surgery**: a single change requires touching many files - logic is fragmented.
- **Feature Envy**: a function that uses more data from another module than its own.
- **Duplicated Code**: apply the "Rule of Three": when you see the same pattern three times, refactor.

## Preparatory Refactoring

Before adding a feature, ask: "Is the code structured to make this change easy?" If not, refactor first so the new feature slots in naturally.
As Kent Beck puts it: **"Make the change easy, then make the easy change."** This is not gold-plating, it is the most common and economically justified reason to refactor.

## Core Refactoring Moves

Apply these patterns as your primary toolkit:

### Extract Function

The most common refactoring. Take a fragment of code, turn it into a function, and name it after its **purpose** (not how it works).

### Extract Class

When a function or module accumulates too many responsibilities, split it into focused units. This is the natural next step after Extract Function when a single module grows too large.

### Move / Rename

Shift functions or variables to a more logical home. Give them clear, intention-revealing names.

### Replace Loop with Pipeline

Prefer `map`, `filter`, `reduce` (or list comprehensions in Python) over imperative `for` loops to make data transformations declarative and scannable.

### Replace Conditional with Polymorphism

Turn large `switch`/`if-else` ladders that check object "type" into classes or interfaces with specialized behavior.

### Split Phase

Separate code into distinct phases: one that parses/prepares data, another that performs the primary logic (e.g., validation vs. persistence).

### Introduce / Inline Variable

Use temporaries to clarify logic, or inline them when they add noise without clarity.

## Scoping and Prioritization

- **Not everything must be perfect.** Refactor to the point where the code supports the next change easily, not to some theoretical ideal.
- **Focus on hotspots**: modules that change frequently, are hard to test, or are widely coupled benefit most.
- **Camp-site rule**: leave the code a bit cleaner than you found it.
- **Patterns should be emergent**: don't design Strategy/Decorator/etc. Upfront, refactor toward them as the system grows.

## Performance Concerns

Cleaner code is easier to optimize. It is better to have a readable system you can profile and optimize at the hot spots than a "fast" system so tangled no one dares touch it. Refactor for clarity first, then optimize only where profiling shows it matters.

## Checklist Before Finishing

- [ ] All tests pass (no regressions).
- [ ] Each refactoring step is a separate, small commit with a clear message.
- [ ] No behavior was changed, only internal structure.
- [ ] Code is easier to understand and cheaper to modify than before.
- [ ] No new features or bug fixes were mixed into refactoring commits.