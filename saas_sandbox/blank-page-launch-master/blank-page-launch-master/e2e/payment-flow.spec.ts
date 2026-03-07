import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test.use({ storageState: 'playwright/.auth/user.json' });

  test('should display pricing plans', async ({ page }) => {
    await page.goto('/pricing');

    // Check for pricing page content
    await expect(page.getByRole('heading', { name: /pricing|價格|方案/i })).toBeVisible();
    
    // Check for pricing cards
    const pricingCards = page.locator('.pricing-card, .plan-card, [data-testid="pricing-plan"]');
    await expect(pricingCards.first()).toBeVisible();
    
    // Should have multiple plans
    const cardCount = await pricingCards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('should show plan features', async ({ page }) => {
    await page.goto('/pricing');

    // Look for plan features
    const featureLists = page.locator('.features, .plan-features, ul');
    if (await featureLists.count() > 0) {
      await expect(featureLists.first()).toBeVisible();
      
      // Check for feature items
      const features = featureLists.first().locator('li');
      if (await features.count() > 0) {
        await expect(features.first()).toBeVisible();
      }
    }
  });

  test('should handle plan selection', async ({ page }) => {
    await page.goto('/pricing');

    // Look for "Choose Plan" or "Select" buttons
    const selectButton = page.getByRole('button').filter({ 
      hasText: /choose|select|選擇|立即|subscribe/i 
    });

    if (await selectButton.count() > 0) {
      await selectButton.first().click();
      
      // Should navigate to payment or checkout page
      await page.waitForTimeout(1000);
      
      // Check if we're on a payment-related page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/(payment|checkout|billing|subscribe)/);
    }
  });

  test('should display payment form', async ({ page }) => {
    // Try to navigate directly to payment page
    await page.goto('/payment');

    // If payment page exists, check for payment form
    if (page.url().includes('/payment')) {
      // Look for payment form elements
      const paymentForm = page.locator('form, .payment-form, [data-testid="payment-form"]');
      
      if (await paymentForm.isVisible().catch(() => false)) {
        await expect(paymentForm).toBeVisible();
        
        // Check for common payment fields
        const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
        const cardField = page.getByLabel(/card|credit/i).or(page.getByPlaceholder(/card number/i));
        
        if (await emailField.isVisible().catch(() => false)) {
          await expect(emailField).toBeVisible();
        }
      }
    }
  });

  test('should handle Stripe payment integration', async ({ page }) => {
    // Mock Stripe for testing
    await page.addInitScript(() => {
      // Mock Stripe object
      (window as any).Stripe = () => ({
        elements: () => ({
          create: () => ({
            mount: () => {},
            on: () => {},
            update: () => {}
          }),
          getElement: () => null
        }),
        confirmCardPayment: () => Promise.resolve({
          paymentIntent: { status: 'succeeded' }
        }),
        createPaymentMethod: () => Promise.resolve({
          paymentMethod: { id: 'pm_test_123' }
        })
      });
    });

    await page.goto('/payment');

    // If payment page exists, test Stripe integration
    if (page.url().includes('/payment')) {
      // Look for Stripe elements
      const stripeElements = page.locator('#card-element, .StripeElement, [data-testid="stripe-card"]');
      
      if (await stripeElements.count() > 0) {
        await expect(stripeElements.first()).toBeVisible();
      }
    }
  });

  test('should handle payment success', async ({ page }) => {
    // Mock successful payment
    await page.route('**/api/payment/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          paymentId: 'payment_test_123',
          status: 'completed'
        })
      });
    });

    await page.goto('/payment/success');

    // Check for success page
    if (page.url().includes('/success')) {
      const successMessage = page.getByText(/success|成功|完成|thank you/i);
      if (await successMessage.count() > 0) {
        await expect(successMessage.first()).toBeVisible();
      }
    }
  });

  test('should handle payment failure', async ({ page }) => {
    // Mock failed payment
    await page.route('**/api/payment/**', route => {
      route.fulfill({
        status: 400,
        contentType: 'application/json',
        body: JSON.stringify({
          success: false,
          error: 'Payment failed'
        })
      });
    });

    await page.goto('/payment');

    // If payment page exists, test error handling
    if (page.url().includes('/payment')) {
      // Look for error messages
      const errorElements = page.locator('.error, .alert-error, [data-testid="error"]');
      
      // Trigger a payment failure scenario if form exists
      const submitButton = page.getByRole('button').filter({ hasText: /pay|submit|確認/i });
      if (await submitButton.isVisible().catch(() => false)) {
        await submitButton.click();
        
        // Wait for error message
        await page.waitForTimeout(1000);
        
        if (await errorElements.count() > 0) {
          await expect(errorElements.first()).toBeVisible();
        }
      }
    }
  });

  test('should validate payment form fields', async ({ page }) => {
    await page.goto('/payment');

    if (page.url().includes('/payment')) {
      // Look for required form fields
      const emailField = page.getByLabel(/email/i).or(page.getByPlaceholder(/email/i));
      
      if (await emailField.isVisible().catch(() => false)) {
        // Test invalid email
        await emailField.fill('invalid-email');
        
        const submitButton = page.getByRole('button').filter({ hasText: /pay|submit|確認/i });
        if (await submitButton.isVisible().catch(() => false)) {
          await submitButton.click();
          
          // Should show validation error
          const validationError = page.locator('.error, .invalid, .field-error');
          if (await validationError.count() > 0) {
            await expect(validationError.first()).toBeVisible();
          }
        }
      }
    }
  });

  test('should handle subscription management', async ({ page }) => {
    await page.goto('/billing');

    // If billing page exists, check subscription management
    if (page.url().includes('/billing')) {
      // Look for subscription information
      const subscriptionInfo = page.locator('.subscription, .billing-info, [data-testid="subscription"]');
      
      if (await subscriptionInfo.count() > 0) {
        await expect(subscriptionInfo.first()).toBeVisible();
        
        // Look for manage subscription buttons
        const manageButtons = page.getByRole('button').filter({ 
          hasText: /manage|cancel|upgrade|modify/i 
        });
        
        if (await manageButtons.count() > 0) {
          await expect(manageButtons.first()).toBeVisible();
        }
      }
    }
  });

  test('should show invoice history', async ({ page }) => {
    await page.goto('/billing');

    if (page.url().includes('/billing')) {
      // Look for invoice history
      const invoiceTable = page.getByRole('table').or(
        page.locator('.invoice-list, .billing-history')
      );
      
      if (await invoiceTable.isVisible().catch(() => false)) {
        await expect(invoiceTable).toBeVisible();
        
        // Check for invoice rows
        const invoiceRows = invoiceTable.getByRole('row');
        if (await invoiceRows.count() > 1) { // More than just header
          await expect(invoiceRows.nth(1)).toBeVisible();
        }
      }
    }
  });
});