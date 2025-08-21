# Contributing to EventFlow Analytics Dashboard

## Development Guidelines

This project follows the design philosophy principles outlined in the course materials, emphasizing KISS (Keep It Simple, Stupid), YAGNI (You Aren't Gonna Need It), and appropriate use of TDD (Test-Driven Development).

## Code Style

### JavaScript Standards
- Use ES6+ features for cleaner, more expressive code
- Prefer `const` and `let` over `var`
- Use destructuring for props and state access
- Employ async/await over promise chains
- Leverage optional chaining (`?.`) and nullish coalescing (`??`)

### React Patterns
- Functional components with hooks as default
- Custom hooks for reusable stateful logic
- Component composition over inheritance
- Controlled components for form inputs
- Error boundaries for graceful error handling

### Naming Conventions
- `camelCase` for variables and functions
- `PascalCase` for components and classes
- `SCREAMING_SNAKE_CASE` for constants
- Descriptive names over abbreviations
- Boolean variables prefixed with `is`, `has`, `should`

## File Organization

```
src/
├── components/       # Reusable UI components
├── hooks/           # Custom React hooks
├── services/        # API and external services
├── utils/           # Helper functions
└── __tests__/       # Test files
```

## Git Workflow

1. Create a feature branch from `main`
2. Make your changes following the coding standards
3. Write/update tests for your changes
4. Ensure all tests pass: `npm test`
5. Format your code: `npm run format`
6. Lint your code: `npm run lint`
7. Create a pull request with a clear description

## Testing Requirements

- Write tests for new functionality
- Maintain minimum 70% code coverage
- Use React Testing Library for component tests
- Focus on testing behavior, not implementation

## Performance Considerations

- Profile before optimizing
- Use React DevTools to identify performance issues
- Implement React.memo only when necessary
- Avoid premature optimization

## Accessibility Standards

- Ensure all interactive elements are keyboard accessible
- Add proper ARIA labels and roles
- Test with screen readers
- Maintain WCAG AA compliance

## Documentation

- Add JSDoc comments for complex functions
- Update README for new features
- Document breaking changes
- Include examples for new components

## Module 3 Specific Guidelines

When working on optimization examples:
1. Create unoptimized version first in `/components-unoptimized/`
2. Document performance issues with comments
3. Create optimized version in `/components/`
4. Add comments explaining optimizations
5. Include performance measurements

## Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests pass and coverage maintained
- [ ] No console.log statements (except for debugging)
- [ ] Accessibility requirements met
- [ ] Performance impact considered
- [ ] Documentation updated

## Questions?

Refer to the course materials or reach out to the course instructors for clarification on any guidelines.
