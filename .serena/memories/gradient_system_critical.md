# CRITICAL: Gradient System Preservation

## Overview
The LINK application has a comprehensive gradient button system that is ESSENTIAL to preserve during modernization. This is a critical requirement mentioned throughout the implementation plan.

## Gradient Classes (DO NOT MODIFY)
- `.gradient-button` - Base gradient button with animated border
- `.edit-gradient` - Green gradient for edit actions  
- `.delete-gradient` - Red gradient for delete actions
- `.copy-gradient` - Blue gradient for copy actions
- `.share-gradient` - Orange gradient for share actions
- `.user-logged-gradient` - Yellow gradient for user-related UI
- `.auth-panel-gradient` - Gradient borders for authentication panels
- `.uploading-gradient` - Progress indicator gradient

## CSS Implementation Location
File: `app/globals.css` (lines 104-346)

## Dark Mode Variants
All gradients have dark mode variants with `.dark` class prefix that must be preserved.

## Visual Testing Required
- Screenshot comparisons before/after any changes
- Hover state testing for all gradient buttons
- Dark/light mode verification
- Responsive testing across breakpoints

## Integration with New Components
When adding shadcn/ui or other component libraries:
- Map gradient variants to new component props
- Preserve existing class combinations
- Maintain hover effects and animations
- Test visual consistency

## Test Files Required
- `__tests__/ui/gradient-preservation.test.ts` - Unit tests
- `e2e/ui/gradient-components.spec.ts` - E2E visual tests
- `__tests__/visual/ui-regression.test.ts` - Regression tests

## Migration Strategy
1. Create baseline screenshots FIRST
2. Test component changes against baseline
3. Ensure identical visual output
4. Verify all gradient classes still work
5. Check hover/focus states
6. Validate dark mode compatibility

**CRITICAL**: Any change that breaks gradient styling will be considered a failed implementation.