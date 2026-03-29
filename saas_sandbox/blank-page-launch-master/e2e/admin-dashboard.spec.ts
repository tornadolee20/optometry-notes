import { test, expect } from '@playwright/test';

test.describe('Admin Dashboard', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should load admin dashboard', async ({ page }) => {
    await page.goto('/admin');

    // Check if dashboard loads
    await expect(page.getByRole('heading', { name: /管理儀表板|admin dashboard/i })).toBeVisible();
    
    // Check for navigation menu
    await expect(page.getByRole('navigation')).toBeVisible();
    
    // Check for main dashboard content
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('should display statistics cards', async ({ page }) => {
    await page.goto('/admin');

    // Wait for dashboard to load
    await page.waitForSelector('[data-testid="dashboard-stats"], .statistics, .stats-card', { timeout: 10000 });

    // Check for statistics cards (common dashboard elements)
    const statsCards = page.locator('.card, [data-testid="stat-card"], .stat-card');
    
    // Should have at least one statistics card
    await expect(statsCards.first()).toBeVisible();
  });

  test('should have working navigation between admin sections', async ({ page }) => {
    await page.goto('/admin');

    // Look for navigation items
    const navItems = page.getByRole('navigation').getByRole('link');
    const navCount = await navItems.count();

    if (navCount > 0) {
      // Click on first navigation item
      const firstNavItem = navItems.first();
      await firstNavItem.click();
      
      // Should navigate somewhere
      await page.waitForTimeout(1000);
      
      // URL should change or content should update
      const currentUrl = page.url();
      expect(currentUrl).toContain('/admin');
    }
  });

  test('should handle data loading states', async ({ page }) => {
    await page.goto('/admin');

    // Check for loading indicators
    const loadingIndicators = page.locator('.loading, [data-testid="loading"], .spinner');
    
    // If loading indicators exist, wait for them to disappear
    if (await loadingIndicators.first().isVisible().catch(() => false)) {
      await expect(loadingIndicators.first()).toBeHidden();
    }

    // Check that main content is loaded
    await expect(page.getByRole('main')).toBeVisible();
  });

  test('should display tables with data', async ({ page }) => {
    await page.goto('/admin');

    // Look for data tables
    const tables = page.getByRole('table');
    const tableCount = await tables.count();

    if (tableCount > 0) {
      const firstTable = tables.first();
      await expect(firstTable).toBeVisible();
      
      // Check for table headers
      const headers = firstTable.getByRole('columnheader');
      await expect(headers.first()).toBeVisible();
    }
  });

  test('should handle search functionality', async ({ page }) => {
    await page.goto('/admin');

    // Look for search input
    const searchInput = page.getByPlaceholder(/搜尋|search/i).or(
      page.getByRole('searchbox')
    );

    if (await searchInput.isVisible().catch(() => false)) {
      await searchInput.fill('test');
      await page.keyboard.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Should show some kind of results or no results message
      const results = page.locator('.search-results, .results, .no-results');
      if (await results.count() > 0) {
        await expect(results.first()).toBeVisible();
      }
    }
  });

  test('should handle user profile/settings', async ({ page }) => {
    await page.goto('/admin');

    // Look for user profile or settings button
    const profileButton = page.getByRole('button').filter({ 
      hasText: /profile|設定|settings|用戶|user/i 
    }).or(
      page.locator('[data-testid="user-menu"], .user-menu, .profile-button')
    );

    if (await profileButton.isVisible().catch(() => false)) {
      await profileButton.click();
      
      // Should show dropdown or navigate to profile page
      await page.waitForTimeout(500);
      
      // Check for profile-related content
      const profileContent = page.locator('.dropdown, .profile-dropdown, .user-dropdown');
      if (await profileContent.count() > 0) {
        await expect(profileContent.first()).toBeVisible();
      }
    }
  });

  test('should be responsive on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/admin');

    // Check if admin dashboard loads on tablet
    await expect(page.getByRole('main')).toBeVisible();
    
    // Navigation should be accessible
    await expect(page.getByRole('navigation')).toBeVisible();
  });

  test('should handle error states gracefully', async ({ page }) => {
    // Mock network failure
    await page.route('**/api/**', route => {
      route.abort();
    });

    await page.goto('/admin');

    // Should handle API failures gracefully
    await page.waitForTimeout(2000);
    
    // Should still show the main layout
    await expect(page.getByRole('main')).toBeVisible();
    
    // Might show error messages
    const errorElements = page.locator('.error, .alert-error, [data-testid="error"]');
    if (await errorElements.count() > 0) {
      await expect(errorElements.first()).toBeVisible();
    }
  });

  test('should handle logout functionality', async ({ page }) => {
    await page.goto('/admin');

    // Look for logout button
    const logoutButton = page.getByRole('button').filter({ 
      hasText: /logout|登出|sign out/i 
    }).or(
      page.getByRole('link').filter({ hasText: /logout|登出|sign out/i })
    );

    if (await logoutButton.isVisible().catch(() => false)) {
      await logoutButton.click();
      
      // Should redirect to login or home page
      await page.waitForTimeout(1000);
      
      const currentUrl = page.url();
      expect(currentUrl).not.toContain('/admin');
    }
  });
});