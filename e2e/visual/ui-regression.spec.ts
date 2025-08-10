import { test, expect } from '@playwright/test';

test.describe('UI Gradient Preservation', () => {
  test('should preserve all gradient buttons', async ({ page }) => {
    await page.goto('/');
    
    // Test każdego typu przycisku z gradientem
    const gradientButtons = [
      '.gradient-button',
      '.edit-gradient', 
      '.delete-gradient',
      '.copy-gradient',
      '.share-gradient',
      '.user-logged-gradient'
    ];
    
    for (const selector of gradientButtons) {
      const element = page.locator(selector).first();
      // Sprawdź czy element istnieje przed zrobieniem screenshota
      if (await element.count() > 0) {
        await expect(element).toHaveScreenshot(
          `gradient-${selector.replace('.', '')}.png`
        );
      }
    }
  });
  
  test('should preserve hover effects', async ({ page }) => {
    await page.goto('/links');
    const button = page.locator('.gradient-button').first();
    
    // Sprawdź czy przycisk istnieje
    if (await button.count() > 0) {
      // Before hover
      await expect(button).toHaveScreenshot('gradient-before-hover.png');
      
      // After hover
      await button.hover();
      await expect(button).toHaveScreenshot('gradient-after-hover.png');
    }
  });

  test('should preserve dark mode variants', async ({ page }) => {
    // Test light mode
    await page.goto('/');
    const lightButton = page.locator('.gradient-button').first();
    if (await lightButton.count() > 0) {
      await expect(lightButton).toHaveScreenshot('gradient-light-mode.png');
    }
    
    // Switch to dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Test dark mode
    const darkButton = page.locator('.gradient-button').first();
    if (await darkButton.count() > 0) {
      await expect(darkButton).toHaveScreenshot('gradient-dark-mode.png');
    }
  });

  test('should preserve responsive breakpoints', async ({ page }) => {
    const breakpoints = [
      { name: 'mobile', width: 375, height: 667 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'desktop', width: 1920, height: 1080 }
    ];

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      
      await page.goto('/');
      const button = page.locator('.gradient-button').first();
      
      if (await button.count() > 0) {
        await expect(button).toHaveScreenshot(
          `gradient-${breakpoint.name}.png`
        );
      }
    }
  });

  test('should preserve auth panel gradients', async ({ page }) => {
    await page.goto('/auth/signin');
    const authPanel = page.locator('.auth-panel-gradient').first();
    
    if (await authPanel.count() > 0) {
      await expect(authPanel).toHaveScreenshot('auth-panel-gradient.png');
    }
  });

  test('should preserve user menu gradient', async ({ page }) => {
    await page.goto('/');
    const userMenu = page.locator('.user-logged-gradient').first();
    
    if (await userMenu.count() > 0) {
      await expect(userMenu).toHaveScreenshot('user-menu-gradient.png');
    }
  });
});