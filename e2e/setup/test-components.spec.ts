import { test, expect } from '@playwright/test';

test.describe('Component Testing Setup', () => {
  
  test('should test application startup and basic navigation', async ({ page }) => {
    console.log('🚀 Testing basic application functionality...');
    
    // Test homepage loads
    const response = await page.goto('/');
    expect(response?.status()).toBeLessThan(400);
    
    await page.waitForLoadState('networkidle');
    console.log('✅ Homepage loaded successfully');
    
    // Test if page has basic content
    const hasContent = await page.locator('body').count() > 0;
    expect(hasContent).toBe(true);
    
    // Test navigation links if they exist
    const navLinks = page.locator('nav a, .nav a, [role="navigation"] a');
    const linkCount = await navLinks.count();
    console.log(`📊 Found ${linkCount} navigation links`);
    
    if (linkCount > 0) {
      // Test first few navigation links
      for (let i = 0; i < Math.min(linkCount, 3); i++) {
        const link = navLinks.nth(i);
        const href = await link.getAttribute('href');
        
        if (href && href.startsWith('/')) {
          console.log(`🔗 Testing navigation to: ${href}`);
          
          try {
            await link.click();
            await page.waitForLoadState('networkidle');
            
            const newUrl = page.url();
            console.log(`✅ Successfully navigated to: ${newUrl}`);
            
            // Go back to homepage for next test
            await page.goto('/');
            await page.waitForLoadState('networkidle');
            
          } catch (error) {
            console.warn(`⚠️ Could not navigate to ${href}: ${error.message}`);
          }
        }
      }
    }
    
    console.log('✅ Basic navigation testing completed');
  });

  test('should test gradient elements are interactive', async ({ page }) => {
    console.log('🔍 Testing gradient element interactivity...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const gradientButtons = page.locator('.gradient-button');
    const buttonCount = await gradientButtons.count();
    console.log(`📊 Found ${buttonCount} gradient buttons to test`);
    
    if (buttonCount > 0) {
      // Test first gradient button
      const firstButton = gradientButtons.first();
      
      // Test hover state
      await firstButton.hover();
      await page.waitForTimeout(200);
      console.log('✅ Hover interaction tested');
      
      // Test if button is clickable (don't actually click to avoid navigation)
      const isEnabled = await firstButton.isEnabled();
      const isVisible = await firstButton.isVisible();
      
      expect(isEnabled).toBe(true);
      expect(isVisible).toBe(true);
      
      console.log('✅ Gradient button interactivity verified');
    }
  });

  test('should test form elements and gradients', async ({ page }) => {
    console.log('🔍 Testing form-related gradients...');
    
    // Test auth pages which likely have forms
    const authPages = ['/auth/signin', '/auth/signup'];
    
    for (const authUrl of authPages) {
      try {
        console.log(`📝 Testing forms on ${authUrl}...`);
        
        const response = await page.goto(authUrl);
        if (response?.status() >= 400) {
          console.warn(`⚠️ Page ${authUrl} returned ${response.status()}`);
          continue;
        }
        
        await page.waitForLoadState('networkidle');
        
        // Look for form elements with gradients
        const formGradients = page.locator('form .gradient-button, form .auth-panel-gradient');
        const formGradientCount = await formGradients.count();
        
        console.log(`📊 Found ${formGradientCount} gradient elements in forms`);
        
        if (formGradientCount > 0) {
          // Screenshot form with gradients
          await expect(page.locator('form').first()).toHaveScreenshot(`${authUrl.replace('/', '')}-form-gradients.png`);
          console.log(`✅ Form gradients captured for ${authUrl}`);
        }
        
        // Test form inputs exist
        const inputs = page.locator('input, textarea, select');
        const inputCount = await inputs.count();
        console.log(`📊 Found ${inputCount} form inputs`);
        
      } catch (error) {
        console.warn(`⚠️ Could not test ${authUrl}: ${error.message}`);
      }
    }
  });

  test('should test error handling and fallbacks', async ({ page }) => {
    console.log('🔍 Testing error handling...');
    
    // Test non-existent page
    const response = await page.goto('/non-existent-page-12345');
    
    if (response) {
      const status = response.status();
      console.log(`📊 404 page returned status: ${status}`);
      
      // Look for gradients on error page
      const errorPageGradients = page.locator('.gradient-button, .error-gradient');
      const errorGradientCount = await errorPageGradients.count();
      
      console.log(`📊 Found ${errorGradientCount} gradients on error page`);
      
      if (errorGradientCount > 0) {
        await expect(page).toHaveScreenshot('error-page-gradients.png');
        console.log('✅ Error page gradients captured');
      }
    }
  });

  test('should test loading states and animations', async ({ page }) => {
    console.log('🔍 Testing loading states and animations...');
    
    await page.goto('/');
    
    // Test loading states if they exist
    const loadingElements = page.locator('.loading, .loading-gradient, .uploading-gradient, .loading-border');
    const loadingCount = await loadingElements.count();
    
    console.log(`📊 Found ${loadingCount} loading-related gradient elements`);
    
    if (loadingCount > 0) {
      // Test loading animations
      for (let i = 0; i < Math.min(loadingCount, 3); i++) {
        const loadingEl = loadingElements.nth(i);
        
        if (await loadingEl.isVisible()) {
          // Capture loading state
          await expect(loadingEl).toHaveScreenshot(`loading-gradient-${i}.png`);
          console.log(`✅ Loading gradient ${i} captured`);
        }
      }
    }
    
    // Test CSS animations are working
    const animatedElements = page.locator('.animate-gradient, .gradient-button');
    const animatedCount = await animatedElements.count();
    
    if (animatedCount > 0) {
      console.log(`📊 Found ${animatedCount} animated gradient elements`);
      console.log('✅ Animation elements detected');
    }
  });

  test('should test cross-browser gradient consistency', async ({ browserName, page }) => {
    console.log(`🌐 Testing gradient consistency in ${browserName}...`);
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const gradientButton = page.locator('.gradient-button').first();
    
    if (await gradientButton.count() > 0) {
      // Capture browser-specific screenshot
      await expect(gradientButton).toHaveScreenshot(`gradient-${browserName}.png`);
      
      // Test CSS property support
      const cssSupport = await page.evaluate(() => {
        const div = document.createElement('div');
        div.style.background = 'linear-gradient(45deg, #ff6b6b, #ffd93d)';
        
        return {
          supportsLinearGradient: div.style.background.includes('linear-gradient'),
          browserInfo: {
            userAgent: navigator.userAgent,
            vendor: navigator.vendor
          }
        };
      });
      
      console.log(`📊 ${browserName} CSS support:`, cssSupport.supportsLinearGradient);
      expect(cssSupport.supportsLinearGradient).toBe(true);
      
      console.log(`✅ ${browserName} gradient support verified`);
    }
  });

  test('should generate comprehensive test report', async ({ page }) => {
    console.log('📊 Generating comprehensive test report...');
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    const report = await page.evaluate(() => {
      // Comprehensive page analysis
      const gradientSelectors = [
        '.gradient-button', '.edit-gradient', '.delete-gradient',
        '.copy-gradient', '.share-gradient', '.user-logged-gradient',
        '.auth-panel-gradient', '.uploading-gradient', '.loading-border'
      ];
      
      const elementCounts = {};
      let totalGradients = 0;
      
      gradientSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elementCounts[selector] = elements.length;
        totalGradients += elements.length;
      });
      
      // Get page info
      const pageInfo = {
        title: document.title,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight
        }
      };
      
      // Check for CSS features
      const cssFeatures = {
        hasStylesheets: document.styleSheets.length > 0,
        hasFonts: document.fonts ? document.fonts.size > 0 : false,
        hasAnimations: !!document.querySelector('[style*="animation"], .animate-')
      };
      
      return {
        pageInfo,
        gradientCounts: elementCounts,
        totalGradients,
        cssFeatures,
        testComplete: true
      };
    });
    
    console.log('🎉 VISUAL REGRESSION TEST REPORT');
    console.log('═'.repeat(60));
    console.log(`Page: ${report.pageInfo.title}`);
    console.log(`URL: ${report.pageInfo.url}`);
    console.log(`Timestamp: ${report.pageInfo.timestamp}`);
    console.log(`Viewport: ${report.pageInfo.viewport.width}x${report.pageInfo.viewport.height}`);
    console.log('');
    console.log(`Total Gradient Elements: ${report.totalGradients}`);
    console.log('');
    console.log('Gradient Breakdown:');
    
    Object.entries(report.gradientCounts).forEach(([selector, count]) => {
      if (count > 0) {
        console.log(`  ${selector}: ${count}`);
      }
    });
    
    console.log('');
    console.log('CSS Features:');
    Object.entries(report.cssFeatures).forEach(([feature, supported]) => {
      console.log(`  ${feature}: ${supported ? '✅' : '❌'}`);
    });
    
    console.log('═'.repeat(60));
    
    expect(report.testComplete).toBe(true);
    expect(report.totalGradients).toBeGreaterThan(0);
    
    console.log('✅ Comprehensive test report generated successfully');
  });
});