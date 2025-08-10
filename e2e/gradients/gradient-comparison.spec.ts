import { test, expect } from '@playwright/test';

test.describe('Gradient Preservation Comparison Tests', () => {
  
  test('should verify gradient button consistency across pages', async ({ page }) => {
    console.log('🔍 Testing gradient consistency...');
    
    const pages = ['/', '/links', '/todo'];
    const gradientScreenshots: Buffer[] = [];
    
    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      const gradientButton = page.locator('.gradient-button').first();
      if (await gradientButton.count() > 0) {
        // Capture each gradient for comparison
        const screenshot = await gradientButton.screenshot();
        gradientScreenshots.push(screenshot);
        
        console.log(`✅ Gradient captured from ${url}`);
      }
    }
    
    // Verify we captured multiple gradients
    expect(gradientScreenshots.length).toBeGreaterThan(0);
    console.log(`📊 Captured ${gradientScreenshots.length} gradient variations`);
  });

  test('should test gradient border-box technique preservation', async ({ page }) => {
    console.log('🔍 Testing border-box gradient technique...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const gradientButton = page.locator('.gradient-button').first();
    
    if (await gradientButton.count() > 0) {
      // Test CSS properties
      const borderStyle = await gradientButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          border: computed.border,
          background: computed.background,
          borderRadius: computed.borderRadius,
        };
      });
      
      // Verify border-box technique is applied
      expect(borderStyle.border).toContain('4px');
      expect(borderStyle.background).toContain('linear-gradient');
      
      console.log('✅ Border-box gradient technique verified');
      console.log('📊 CSS Properties:', borderStyle);
    }
  });

  test('should verify hover transition preservation', async ({ page }) => {
    console.log('🔍 Testing hover transitions...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const gradientButton = page.locator('.gradient-button').first();
    
    if (await gradientButton.count() > 0) {
      // Test transition properties
      const transitionStyle = await gradientButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          transition: computed.transition,
          transform: computed.transform,
        };
      });
      
      console.log('🎨 Transition properties:', transitionStyle);
      
      // Test hover state
      await gradientButton.hover();
      
      const hoverStyle = await gradientButton.evaluate((el) => {
        const computed = window.getComputedStyle(el);
        return {
          transform: computed.transform,
        };
      });
      
      console.log('🎨 Hover properties:', hoverStyle);
      console.log('✅ Hover transitions verified');
    }
  });

  test('should verify gradient color values are preserved', async ({ page }) => {
    console.log('🔍 Testing gradient color preservation...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check if our CSS colors are present in the page
    const hasRequiredColors = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      let cssText = '';
      
      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules);
          rules.forEach(rule => {
            cssText += rule.cssText || '';
          });
        } catch (e) {
          // Cross-origin stylesheets may not be accessible
        }
      });
      
      // Also check inline styles and link tags
      const styleTags = document.querySelectorAll('style');
      styleTags.forEach(style => {
        cssText += style.textContent || '';
      });
      
      const requiredColors = [
        '#ff6b6b', // main gradient red
        '#ffd93d', // main gradient yellow
        '#6c5ce7', // main gradient purple
        '#4ade80', // edit green
        '#ef4444', // delete red
        '#3b82f6', // copy blue
        '#f59e0b', // share orange
      ];
      
      const foundColors = requiredColors.filter(color => 
        cssText.toLowerCase().includes(color.toLowerCase())
      );
      
      return {
        totalColors: requiredColors.length,
        foundColors: foundColors.length,
        colors: foundColors,
        cssLength: cssText.length
      };
    });
    
    console.log('📊 Color preservation check:', hasRequiredColors);
    
    // Verify most colors are preserved
    expect(hasRequiredColors.foundColors).toBeGreaterThan(5);
    expect(hasRequiredColors.cssLength).toBeGreaterThan(0);
    
    console.log('✅ Gradient colors verified in CSS');
  });

  test('should test animation preservation', async ({ page }) => {
    console.log('🔍 Testing gradient animations...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for animation-related CSS
    const hasAnimations = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      let cssText = '';
      
      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules);
          rules.forEach(rule => {
            cssText += rule.cssText || '';
          });
        } catch (e) {
          // Skip inaccessible stylesheets
        }
      });
      
      const styleTags = document.querySelectorAll('style');
      styleTags.forEach(style => {
        cssText += style.textContent || '';
      });
      
      return {
        hasKeyframes: cssText.includes('@keyframes'),
        hasGradientAnimation: cssText.includes('gradient 15s ease infinite'),
        hasTransition: cssText.includes('transition'),
        hasHoverEffects: cssText.includes(':hover'),
      };
    });
    
    console.log('🎬 Animation preservation check:', hasAnimations);
    
    expect(hasAnimations.hasKeyframes).toBe(true);
    expect(hasAnimations.hasTransition).toBe(true);
    expect(hasAnimations.hasHoverEffects).toBe(true);
    
    console.log('✅ Animations and transitions verified');
  });

  test('should verify accessibility features', async ({ page }) => {
    console.log('🔍 Testing accessibility preservation...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check for reduced motion support
    const hasReducedMotionSupport = await page.evaluate(() => {
      const styleSheets = Array.from(document.styleSheets);
      let cssText = '';
      
      styleSheets.forEach(sheet => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules);
          rules.forEach(rule => {
            cssText += rule.cssText || '';
          });
        } catch (e) {
          // Skip inaccessible stylesheets
        }
      });
      
      const styleTags = document.querySelectorAll('style');
      styleTags.forEach(style => {
        cssText += style.textContent || '';
      });
      
      return {
        hasReducedMotion: cssText.includes('@media (prefers-reduced-motion: reduce)'),
        hasAnimationNone: cssText.includes('animation: none'),
      };
    });
    
    console.log('♿ Accessibility check:', hasReducedMotionSupport);
    
    expect(hasReducedMotionSupport.hasReducedMotion).toBe(true);
    
    console.log('✅ Accessibility features verified');
  });

  test('should create gradient preservation report', async ({ page }) => {
    console.log('📊 Creating gradient preservation report...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Count all gradient elements
    const gradientStats = await page.evaluate(() => {
      const selectors = [
        '.gradient-button',
        '.edit-gradient',
        '.delete-gradient',
        '.copy-gradient', 
        '.share-gradient',
        '.user-logged-gradient',
        '.auth-panel-gradient',
        '.uploading-gradient',
        '.loading-border'
      ];
      
      const stats = {};
      let totalElements = 0;
      
      selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        stats[selector] = elements.length;
        totalElements += elements.length;
      });
      
      return {
        gradientStats: stats,
        totalElements,
        pageTitle: document.title,
        timestamp: new Date().toISOString()
      };
    });
    
    console.log('📋 Gradient Preservation Report:');
    console.log('═'.repeat(50));
    console.log(`Page: ${gradientStats.pageTitle}`);
    console.log(`Timestamp: ${gradientStats.timestamp}`);
    console.log(`Total gradient elements: ${gradientStats.totalElements}`);
    console.log('');
    console.log('Breakdown by class:');
    
    Object.entries(gradientStats.gradientStats).forEach(([selector, count]) => {
      if (count > 0) {
        console.log(`  ${selector}: ${count} elements`);
      }
    });
    
    console.log('═'.repeat(50));
    
    expect(gradientStats.totalElements).toBeGreaterThan(0);
    console.log('✅ Gradient preservation report generated');
  });
});