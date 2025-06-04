import { test, expect } from '@playwright/test';

test('homepage has expected title', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/Micro Frontend/);
});

test('displays all main sections', async ({ page }) => {
  await page.goto('/');
  
  // Check main heading
  await expect(page.locator('h1')).toHaveText('Micro Frontend Template');
  
  // Check all main sections are present
  const sections = [
    'Basic Information',
    'API Configuration',
    'Feature Flags',
    'Debug Information',
    'Environment Status'
  ];
  
  for (const section of sections) {
    await expect(page.getByText(section)).toBeVisible();
  }
});

test('displays environment information', async ({ page }) => {
  await page.goto('/');
  
  // Check environment status section
  const envStatus = page.locator('section:has-text("Environment Status")');
  await expect(envStatus).toBeVisible();
  
  // Check that at least one environment is marked as active
  const envStatuses = await page.locator('section:has-text("Environment Status") .text-gray-600').allTextContents();
  expect(envStatuses.some(status => status === 'Yes')).toBeTruthy();
});