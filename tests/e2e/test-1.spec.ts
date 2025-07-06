import { expect, test } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://preview.artsharebe.id.vn/');
  await page.getByRole('link', { name: 'Get Started' }).click();
  await page.getByRole('link', { name: 'Login' }).click();
  await page
    .getByRole('textbox', { name: 'Enter your username or email' })
    .click();

  await page
    .getByRole('textbox', { name: 'Enter your username or email' })
    .click();
  await page
    .getByRole('textbox', { name: 'Enter your username or email' })
    .fill('panngoc21@clc.fitus.edu.vn');
  await page.getByRole('textbox', { name: 'Enter your password' }).click();
  await page
    .getByRole('textbox', { name: 'Enter your password' })
    .fill('Test@123');
  await page.getByRole('button', { name: 'Login' }).click();
  await page.getByRole('link', { name: 'My Post' }).click();
  await page.getByRole('button', { name: 'Upload Image' }).click();
  await page
    .getByRole('button', { name: 'Upload Image' })
    .setInputFiles('Screenshot 2025-07-06 111124.png');

  await expect(page.getByRole('img', { name: 'Preview' })).toBeVisible();
  await page
    .getByRole('textbox', { name: 'What do you call your artwork' })
    .click();

  await page
    .getByRole('textbox', { name: 'What do you call your artwork' })
    .click();
  await page
    .getByRole('textbox', { name: 'What do you call your artwork' })
    .fill('My Artwork Test');

  await page.getByRole('textbox', { name: 'Describe your work' }).click();
  await page
    .getByRole('textbox', { name: 'Describe your work' })
    .fill('This is a test artwork description');

  await page
    .getByRole('textbox', { name: 'Choose art type or search...' })
    .click();
  await page.getByText('Video Art Add').click();
  await page
    .getByRole('listitem')
    .filter({ hasText: 'Video Art Add' })
    .getByRole('button')
    .click();
  await page.getByRole('button', { name: 'Submit' }).click();
  await page.getByRole('img', { name: 'Preview' }).click({
    button: 'right',
  });
});
