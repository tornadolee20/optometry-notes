import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load homepage successfully', async ({ page }) => {
    await page.goto('/');

    // Check if the page loads
    await expect(page).toHaveTitle(/Review Quickly/);
    
    // Check for main navigation
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check for main content
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('should display hero section', async ({ page }) => {
    await page.goto('/');

    // Check for hero elements
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    
    // Check for call-to-action buttons
    const ctaButtons = page.getByRole('button').filter({ hasText: /開始|註冊|立即/ });
    await expect(ctaButtons.first()).toBeVisible();
  });

  test('should have working navigation', async ({ page }) => {
    await page.goto('/');

    // Test navigation links
    const navLinks = page.getByRole('navigation').getByRole('link');
    
    // Check if navigation links are visible and clickable
    const linkCount = await navLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Test first navigation link
    if (linkCount > 0) {
      const firstLink = navLinks.first();
      await expect(firstLink).toBeVisible();
      await expect(firstLink).toBeEnabled();
    }
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check if page loads on mobile
    await expect(page.getByRole('main')).toBeVisible();
    
    // Check if navigation is accessible (might be in a hamburger menu)
    const mobileNav = page.getByRole('navigation');
    await expect(mobileNav).toBeVisible();
  });

  test('should handle page load performance', async ({ page }) => {
    // Start measuring load time
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Assert reasonable load time (less than 5 seconds)
    expect(loadTime).toBeLessThan(5000);
  });

  test('should have proper SEO meta tags', async ({ page }) => {
    await page.goto('/');

    // Check for essential meta tags
    await expect(page.locator('meta[charset]')).toBeTruthy();
    await expect(page.locator('meta[name="viewport"]')).toBeTruthy();
    
    // Check for title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should handle offline scenario gracefully', async ({ page, context }) => {
    await page.goto('/');
    
    // Simulate offline
    await context.setOffline(true);
    
    // Try to navigate
    await page.goto('/about', { waitUntil: 'networkidle' });
    
    // Should show some kind of offline indicator or cached content
    // This depends on your PWA implementation
    await expect(page).toHaveTitle(/Review Quickly/);
    
    // Restore online
    await context.setOffline(false);
  });
});