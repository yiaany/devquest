# Contributing to DevQuest

First off, thank you for considering contributing to DevQuest! It's people like you that make the open-source community such an amazing place to learn, inspire, and create.

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct.

## How Can I Contribute?

### Reporting Bugs

- **Search first:** Check the issue tracker to see if the bug has already been reported.
- **Use the template:** Use the Bug Report issue template to describe the problem clearly, including steps to reproduce, expected behavior, and environment details.

### Suggesting Enhancements

- **Open an issue:** Use the Feature Request template to describe the enhancement, why it's useful, and any alternatives you've considered.

### Pull Requests

1. Fork the repository and create your branch from `main`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Make your changes.
4. Ensure code formatting is correct:
   ```bash
   npm run format
   ```
5. Ensure the project typechecks and builds without errors:
   ```bash
   npm run typecheck
   ```
   ```bash
   npm run build
   ```
6. Submit a pull request with a descriptive title and fill out the Pull Request template.

## Code Style & Conventions

- We use Prettier for code formatting and ESLint for linting.
- Keep card templates clean, utilizing shared primitives in `src/cards/styles/content.tsx` and `src/cards/styles/frame.tsx` when possible.
- Avoid using pixel-based string line heights (e.g. `lineHeight: "48px"`) in templates to prevent rendering issues in Satori; use unitless values (e.g. `lineHeight: 1.1`).
