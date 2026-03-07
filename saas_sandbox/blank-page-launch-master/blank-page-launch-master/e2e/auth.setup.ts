import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ page }) => {
  // Perform authentication steps
  await page.goto('/auth');
  
  // Mock authentication for testing
  await page.evaluate(() => {
    // Set mock user session in localStorage
    const mockUser = {
      id: 'test-user-id',
      email: 'admin@test.com',
      role: 'admin',
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token'
    };
    
    localStorage.setItem('supabase.auth.token', JSON.stringify({
      currentSession: {
        access_token: mockUser.access_token,
        refresh_token: mockUser.refresh_token,
        user: mockUser
      }
    }));
  });

  // Wait for authentication to be processed
  await page.waitForTimeout(1000);

  // Verify we're authenticated by checking if we can access protected route
  await page.goto('/admin');
  
  // Should not be redirected to login
  await expect(page).toHaveURL(/.*admin.*/);

  // Save authentication state
  await page.context().storageState({ path: authFile });
});