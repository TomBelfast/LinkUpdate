# Task Completion Workflow - LINK Project

## Before Making Changes
1. **Read the detailed implementation plan**: `SZCZEGOLOWY_PLAN_IMPLEMENTACJI.md`
2. **Check current task status** - Look for 🟡 PENDING tasks ready to start
3. **Review dependencies** - Ensure prerequisite tasks are completed
4. **Understand gradient preservation** - Critical to maintain existing UI gradients

## During Implementation
1. **Create tests first** (TDD approach):
   - Unit tests in `__tests__/`
   - Integration tests in `__tests__/integration/`
   - E2E tests in `e2e/`
2. **Preserve gradient CSS classes** - Never remove or modify:
   - `.gradient-button`, `.edit-gradient`, `.delete-gradient`
   - `.copy-gradient`, `.share-gradient`, `.user-logged-gradient`
3. **Follow TypeScript patterns** - Use existing interfaces and types
4. **Test continuously** - Run `npm test` during development

## After Implementation
1. **Run all tests**: `npm test && npx playwright test`
2. **Run linting**: `npm run lint`
3. **Test gradient preservation**: Visual verification in browser
4. **Update task status** in implementation plan (🟡 → 🟠 → 🟢)
5. **Test database operations**: `npm run db:push` if schema changes
6. **Verify build**: `npm run build` before completion
7. **Document changes** in plan with completion timestamp

## Testing Requirements (Per Plan)
- **Unit Tests**: Every function and component
- **Integration Tests**: API routes and database operations
- **E2E Tests**: Critical user workflows
- **Visual Regression**: Gradient button screenshots
- **Performance Tests**: Before/after benchmarks

## Critical Requirements
- **NO breaking changes** to existing gradient system
- **Backward compatibility** for authentication (legacy SHA256 support)
- **Performance improvements** must be measurable
- **Security enhancements** are highest priority
- **All tests must pass** before task completion

## Quality Gates
All 8 validation steps must pass:
1. Syntax validation
2. Type checking  
3. Linting
4. Security scan
5. Test coverage (≥80% unit, ≥70% integration)
6. Performance benchmarks
7. Documentation updates
8. Integration testing