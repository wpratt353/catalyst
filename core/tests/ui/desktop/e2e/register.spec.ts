import { expect, test } from '@playwright/test';

import { testUser } from '~/tests/test-data';

test('Account register', async ({ page }) => {
  await page.goto('/login');

  await page.getByRole('link', { name: 'Create Account' }).click();
  await page.getByRole('heading', { name: 'New account' }).waitFor();

  await page.getByLabel('Email Address').fill(testUser.emailAddress);
  await page.getByLabel('PasswordRequired', { exact: true }).fill(testUser.password);
  await page.getByLabel('Confirm PasswordRequired').fill(testUser.password);
  await page.getByLabel('First NameRequired').fill(testUser.firstName);
  await page.getByLabel('Last NameRequired').fill(testUser.lastName);
  await page.getByLabel('Phone NumberRequired').fill(testUser.phoneNumber);
  await page.getByLabel('Address Line 1Required').fill(testUser.streetAddress);
  await page.getByLabel('Suburb/CityRequired').fill(testUser.city);
  await page.getByLabel('Zip/PostcodeRequired').fill(testUser.zipCode);

  await page.getByRole('button', { name: 'Create account' }).click();
  await page.getByRole('heading', { name: 'New account' }).waitFor();
  await expect(page).toHaveURL('account/');
});
