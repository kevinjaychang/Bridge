# Contributing to Bridge Protocol

Thank you for your interest in contributing to Bridge Protocol! This document provides guidelines and instructions for contributing.

## Code of Conduct

Be respectful, inclusive, and professional in all interactions with other contributors and maintainers.

## How to Contribute

### Reporting Bugs

1. Check if the bug has already been reported in [Issues](https://github.com/yourusername/bridge-protocol/issues)
2. If not, create a new issue using the **Bug Report** template
3. Provide as much detail as possible, including:
   - Steps to reproduce
   - Expected behavior
   - Actual behavior
   - Browser and OS information
   - Screenshots or logs if applicable

### Suggesting Features

1. Check [Issues](https://github.com/yourusername/bridge-protocol/issues) for existing feature requests
2. Create a new issue using the **Feature Request** template
3. Include:
   - Clear description of the feature
   - Use cases and benefits
   - Any alternative approaches considered

### Submitting Pull Requests

#### Setup

1. Fork the repository
2. Clone your fork locally
```bash
git clone https://github.com/your-username/bridge-protocol.git
cd bridge-protocol
```

3. Create a new branch from `develop`
```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

4. Install dependencies
```bash
npm install
```

#### Development

1. Make your changes in the appropriate directory under `src/`
2. Write clean, well-documented code
3. Follow the existing code style and conventions
4. Update tests if applicable

#### Before Submitting

1. Run linting
```bash
npm run lint
```

2. Build the project
```bash
npm run build
```

3. Test your changes locally
```bash
npm run dev
```

4. Commit your changes with clear messages
```bash
git commit -m "feat: add new feature" 
# or
git commit -m "fix: resolve issue with component"
```

5. Push to your fork
```bash
git push origin feature/your-feature-name
```

6. Create a Pull Request using the **Pull Request Template**

### Commit Message Convention

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring without feature changes
- `test`: Adding or updating tests
- `chore`: Dependency updates, build changes, etc.

**Examples:**
```
feat(feed): add sorting options to issue cards
fix(navigation): resolve mobile nav z-index issue
docs: update README with API documentation
```

## Project Structure

Familiarize yourself with the project structure:

```
src/
├── app/              # Next.js routes and layout
├── components/       # Reusable React components
├── hooks/           # Custom React hooks
├── lib/             # Utility functions
├── styles/          # Global styles
└── types/           # TypeScript definitions
```

## Development Guidelines

### Code Style

- Use TypeScript for type safety
- Use Tailwind CSS for styling
- Keep components small and reusable
- Add meaningful comments for complex logic
- Use descriptive variable and function names

### Component Guidelines

1. Place reusable components in `src/components/`
2. Use TypeScript interfaces for props
3. Include JSDoc comments for components
4. Keep components focused on a single responsibility

### Testing

- Write tests for new features
- Ensure existing tests pass
- Run tests before submitting PR

## Branching Strategy

- `main`: Production-ready code
- `develop`: Development branch for integration
- `feature/`: New features
- `fix/`: Bug fixes
- `docs/`: Documentation updates

## Review Process

1. A maintainer will review your PR
2. Address any feedback or requested changes
3. Maintainers will merge once approved

## Questions?

- Open a discussion in [Issues](https://github.com/yourusername/bridge-protocol/issues)
- Check existing documentation in [README.md](../README.md)
- Review the project structure and existing code

## License

By contributing, you agree that your contributions will be licensed under the project's license.

---

Thank you for contributing to Bridge Protocol! 🙏
