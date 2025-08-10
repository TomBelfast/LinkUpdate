import { test, expect } from '@playwright/test';

test.describe('UI Component Gradients - Visual Regression', () => {
  // Before running tests, ensure test page is available
  test.beforeEach(async ({ page }) => {
    await page.goto('/test-components');
    await page.waitForLoadState('networkidle');
    
    // Wait for all buttons to be visible
    await expect(page.locator('[data-testid="button-gradient"]')).toBeVisible();
  });

  test.describe('Individual Gradient Button Screenshots', () => {
    const gradientVariants = [
      { testId: 'button-gradient', name: 'gradient' },
      { testId: 'button-edit', name: 'edit' },
      { testId: 'button-delete', name: 'delete' },
      { testId: 'button-copy', name: 'copy' },
      { testId: 'button-share', name: 'share' },
      { testId: 'button-user', name: 'user' },
      { testId: 'button-authPanel', name: 'authPanel' },
    ];

    for (const variant of gradientVariants) {
      test(`should capture ${variant.name} gradient button`, async ({ page }) => {
        const button = page.locator(`[data-testid="${variant.testId}"]`);
        await expect(button).toBeVisible();
        
        // Screenshot of button in normal state
        await expect(button).toHaveScreenshot(`button-${variant.name}-normal.png`);
        
        // Screenshot of button in hover state
        await button.hover();
        await page.waitForTimeout(500); // Wait for hover transition
        await expect(button).toHaveScreenshot(`button-${variant.name}-hover.png`);
      });
    }
  });

  test.describe('Size Variant Screenshots', () => {
    const sizeVariants = [
      { testId: 'button-edit-sm', name: 'edit-sm' },
      { testId: 'button-copy-default', name: 'copy-default' },
      { testId: 'button-delete-lg', name: 'delete-lg' },
    ];

    for (const variant of sizeVariants) {
      test(`should capture ${variant.name} size variant`, async ({ page }) => {
        const button = page.locator(`[data-testid="${variant.testId}"]`);
        await expect(button).toBeVisible();
        
        await expect(button).toHaveScreenshot(`button-${variant.name}.png`);
      });
    }
  });

  test.describe('Button State Screenshots', () => {
    test('should capture disabled gradient button state', async ({ page }) => {
      const disabledButton = page.locator('[data-testid="button-share-disabled"]');
      await expect(disabledButton).toBeVisible();
      await expect(disabledButton).toHaveScreenshot('button-disabled-state.png');
    });

    test('should capture custom class gradient button', async ({ page }) => {
      const customButton = page.locator('[data-testid="button-edit-custom"]');
      await expect(customButton).toBeVisible();
      await expect(customButton).toHaveScreenshot('button-custom-class.png');
    });

    test('should capture asChild gradient button (link)', async ({ page }) => {
      const linkButton = page.locator('[data-testid="button-copy-link"]');
      await expect(linkButton).toBeVisible();
      await expect(linkButton).toHaveScreenshot('button-as-child-link.png');
    });
  });

  test.describe('Standard Shadcn/ui Variants Preservation', () => {
    const standardVariants = [
      { testId: 'button-standard-default', name: 'standard-default' },
      { testId: 'button-standard-destructive', name: 'standard-destructive' },
      { testId: 'button-standard-outline', name: 'standard-outline' },
      { testId: 'button-standard-secondary', name: 'standard-secondary' },
      { testId: 'button-standard-ghost', name: 'standard-ghost' },
      { testId: 'button-standard-link', name: 'standard-link' },
    ];

    for (const variant of standardVariants) {
      test(`should preserve ${variant.name} standard variant`, async ({ page }) => {
        const button = page.locator(`[data-testid="${variant.testId}"]`);
        await expect(button).toBeVisible();
        
        // Verify standard variants still work
        await expect(button).toHaveScreenshot(`${variant.name}.png`);
        
        // Test hover state for interactive variants
        if (!variant.name.includes('link')) {
          await button.hover();
          await page.waitForTimeout(300);
          await expect(button).toHaveScreenshot(`${variant.name}-hover.png`);
        }
      });
    }
  });

  test.describe('Interactive Functionality', () => {
    test('should maintain gradient classes during interactions', async ({ page }) => {
      const gradientButton = page.locator('[data-testid="button-interactive-gradient"]');
      
      // Check initial state
      await expect(gradientButton).toHaveClass(/gradient-button/);
      
      // Hover and verify classes maintained
      await gradientButton.hover();
      await expect(gradientButton).toHaveClass(/gradient-button/);
      
      // Click and verify classes maintained
      page.on('dialog', dialog => dialog.accept()); // Handle alert
      await gradientButton.click();
      await expect(gradientButton).toHaveClass(/gradient-button/);
    });

    test('should maintain edit gradient classes during interactions', async ({ page }) => {
      const editButton = page.locator('[data-testid="button-interactive-edit"]');
      
      // Check initial classes
      await expect(editButton).toHaveClass(/gradient-button/);
      await expect(editButton).toHaveClass(/edit-gradient/);
      
      // Interact and verify preservation
      await editButton.hover();
      await expect(editButton).toHaveClass(/gradient-button/);
      await expect(editButton).toHaveClass(/edit-gradient/);
    });

    test('should maintain delete gradient classes during interactions', async ({ page }) => {
      const deleteButton = page.locator('[data-testid="button-interactive-delete"]');
      
      // Check initial classes
      await expect(deleteButton).toHaveClass(/gradient-button/);
      await expect(deleteButton).toHaveClass(/delete-gradient/);
      
      // Test interaction with confirmation dialog
      page.on('dialog', dialog => dialog.dismiss()); // Handle confirm dialog
      await deleteButton.click();
      await expect(deleteButton).toHaveClass(/gradient-button/);
      await expect(deleteButton).toHaveClass(/delete-gradient/);
    });
  });

  test.describe('Dark Mode Compatibility', () => {
    test.beforeEach(async ({ page }) => {
      // Enable dark mode
      await page.emulateMedia({ colorScheme: 'dark' });
    });

    test('should preserve gradients in dark mode', async ({ page }) => {
      const darkModeButtons = [
        { testId: 'button-dark-user', name: 'user-dark' },
        { testId: 'button-dark-auth', name: 'auth-dark' },
        { testId: 'button-dark-gradient', name: 'gradient-dark' },
      ];

      for (const button of darkModeButtons) {
        const element = page.locator(`[data-testid="${button.testId}"]`);
        await expect(element).toBeVisible();
        
        // Screenshot in dark mode
        await expect(element).toHaveScreenshot(`${button.name}.png`);
        
        // Hover state in dark mode
        await element.hover();
        await page.waitForTimeout(300);
        await expect(element).toHaveScreenshot(`${button.name}-hover.png`);
      }
    });

    test('should maintain gradient classes in dark mode', async ({ page }) => {
      const userButton = page.locator('[data-testid="button-dark-user"]');
      const authButton = page.locator('[data-testid="button-dark-auth"]');
      const gradientButton = page.locator('[data-testid="button-dark-gradient"]');

      // Verify classes preserved in dark mode
      await expect(userButton).toHaveClass(/user-logged-gradient/);
      await expect(authButton).toHaveClass(/auth-panel-gradient/);
      await expect(gradientButton).toHaveClass(/gradient-button/);
    });
  });

  test.describe('Responsive Design', () => {
    const viewports = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 },
    ];

    for (const viewport of viewports) {
      test(`should maintain gradients on ${viewport.name}`, async ({ page }) => {
        await page.setViewportSize({ 
          width: viewport.width, 
          height: viewport.height 
        });

        // Test a few key gradient buttons on different screen sizes
        const gradientButton = page.locator('[data-testid="button-gradient"]').first();
        const editButton = page.locator('[data-testid="button-edit"]').first();
        
        await expect(gradientButton).toBeVisible();
        await expect(editButton).toBeVisible();

        // Take screenshots for responsive comparison
        await expect(gradientButton).toHaveScreenshot(`gradient-${viewport.name}.png`);
        await expect(editButton).toHaveScreenshot(`edit-${viewport.name}.png`);
      });
    }
  });

  test.describe('Full Page Component Layout', () => {
    test('should capture complete test page layout', async ({ page }) => {
      // Full page screenshot to verify overall layout
      await expect(page).toHaveScreenshot('test-components-full-page.png', {
        fullPage: true,
        animations: 'disabled', // Disable animations for consistent screenshots
      });
    });

    test('should capture gradient button grid section', async ({ page }) => {
      const gradientSection = page.locator('text=Gradient Button Variants').locator('..').locator('..');
      await expect(gradientSection).toHaveScreenshot('gradient-button-grid.png');
    });

    test('should capture size variants section', async ({ page }) => {
      const sizeSection = page.locator('text=Size Variants').locator('..').locator('..');
      await expect(sizeSection).toHaveScreenshot('size-variants-section.png');
    });

    test('should capture button states section', async ({ page }) => {
      const statesSection = page.locator('text=Button States').locator('..').locator('..');
      await expect(statesSection).toHaveScreenshot('button-states-section.png');
    });
  });

  test.describe('Performance and Load Testing', () => {
    test('should load all gradient buttons within reasonable time', async ({ page }) => {
      const startTime = Date.now();
      
      // Wait for all gradient buttons to be visible
      const gradientButtons = page.locator('[data-testid^="button-"]');
      await expect(gradientButtons.first()).toBeVisible();
      await expect(gradientButtons.last()).toBeVisible();
      
      const endTime = Date.now();
      const loadTime = endTime - startTime;
      
      // Should load within 3 seconds
      expect(loadTime).toBeLessThan(3000);
      
      console.log(`All gradient buttons loaded in ${loadTime}ms`);
    });

    test('should handle rapid hover interactions', async ({ page }) => {
      const buttons = [
        page.locator('[data-testid="button-gradient"]'),
        page.locator('[data-testid="button-edit"]'),
        page.locator('[data-testid="button-delete"]'),
        page.locator('[data-testid="button-copy"]'),
        page.locator('[data-testid="button-share"]'),
      ];

      // Rapidly hover over each button
      for (let i = 0; i < 3; i++) { // Do 3 cycles
        for (const button of buttons) {
          await button.hover();
          await page.waitForTimeout(50); // Very quick hover
        }
      }

      // Verify all buttons still have correct classes after rapid interaction
      await expect(buttons[0]).toHaveClass(/gradient-button/);
      await expect(buttons[1]).toHaveClass(/edit-gradient/);
      await expect(buttons[2]).toHaveClass(/delete-gradient/);
      await expect(buttons[3]).toHaveClass(/copy-gradient/);
      await expect(buttons[4]).toHaveClass(/share-gradient/);
    });
  });
});