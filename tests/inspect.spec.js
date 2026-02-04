import { test } from '@playwright/test';

// Simple inspect test to open the AUT and pause so you can interactively inspect selectors
test( 'inspect page for selectors', async({ page }) => {
    await page.goto( 'https://testapp.fairlo.se/application' );
    // Pause to allow headed interactive inspection
    await page.pause();
});