# Contributing to Brief

Thank you for your interest in contributing to Brief! This document provides guidelines for contributing to the project.

## Getting Started

1. Fork the repository.
2. Clone your fork: `git clone https://github.com/openperf/brief.git`
3. Install dependencies: `pnpm install`
4. Create a branch: `git checkout -b feature/your-feature`

## Development

The project uses a pnpm workspace with the following structure:

- `packages/brief-sdk/` — The core TypeScript SDK
- `examples/` — Runnable example scripts
- `docs/` — Design documents

### Building

```bash
pnpm build
```

### Testing

```bash
cd packages/brief-sdk
pnpm test
```

### Running Examples

```bash
pnpm example:simple
pnpm example:cascade
pnpm example:fanout
```

## Pull Request Process

1. Ensure all tests pass (`pnpm test`).
2. Update documentation if you change the public API.
3. Add tests for new features.
4. Keep PRs focused — one feature or fix per PR.
5. Write clear commit messages.

## Code Style

- Use TypeScript strict mode.
- Prefer `const` over `let`.
- Use JSDoc comments for public APIs.
- Follow the existing code patterns in the project.

## Reporting Issues

When reporting issues, please include:

- A clear description of the problem.
- Steps to reproduce.
- Expected vs. actual behavior.
- Your environment (Node.js version, OS).

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
