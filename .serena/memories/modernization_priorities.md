# Modernization Priorities - 2025 Implementation Plan

## Current Status: All Tasks PENDING
Based on `SZCZEGOLOWY_PLAN_IMPLEMENTACJI.md`, all tasks are currently 🟡 PENDING.

## Phase 0: Testing Infrastructure (CRITICAL - Start Here)
- **Task 0.1**: Testing Setup (4h) - Install Playwright, configure Vitest
- **Task 0.2**: Visual Regression Suite (6h) - Baseline gradient screenshots

## Phase 1: Security (CRITICAL - Highest Priority)
- **Task 1.1**: Password Migration SHA256→bcrypt (8h) - SECURITY CRITICAL
- **Task 1.2**: Remove Debug Logging (2h) - SECURITY CRITICAL  
- **Task 1.3**: Database Connection Pooling (4h) - Performance improvement

## Phase 2: State Management (High Priority)
- **Task 2.1**: Zustand + TanStack Query Setup (6h)
- **Task 2.2**: Component Migration from useState (12h) - 97 useState instances

## Phase 3: AI Enhancement (Medium Priority)
- **Task 3.1**: Multi-provider AI Orchestration (8h) - OpenAI, Anthropic, Google

## Phase 4: UI Modernization (Medium Priority)  
- **Task 4.1**: shadcn/ui Integration with Gradient Preservation (6h)

## Dependencies
- Task 0.1 → Task 0.2 (testing setup first)
- Task 1.1 → All other tasks (security foundation)
- Task 2.1 → Task 2.2 (Zustand before migration)
- Task 0.2 → Task 4.1 (baseline before UI changes)

## Success Criteria
- All gradient styling preserved (CRITICAL)
- Security vulnerabilities eliminated
- Performance measurably improved
- Test coverage ≥80% unit, ≥70% integration
- All 8 quality gates passing

## Ready to Start
1. **Task 0.1** - Testing Infrastructure Setup
2. **Task 1.1** - Password Security Migration (after 0.1)

## Estimated Total Time: 56 hours
Critical path focuses on security and testing infrastructure first.