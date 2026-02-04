// Playwright test configuration
import { defineConfig, devices } from '@playwright/test';
import process from 'process';
import dotenv from 'dotenv';

dotenv.config();

process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'debug';
const browser = process.env.BROWSER || '';
export default defineConfig({
    testDir: './tests',
    testIgnore: ['**/examples/**'],
    fullyParallel: process.env.FULL_PARALLEL === 'true',
    reporter: [
        ['junit', { outputFile: 'results.xml' }],
        ['html', { open: 'never' }],
    ],
    workers: 1,
    use: {
        headless: true,
        actionTimeout: 30000,
        navigationTimeout: 60000,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure'
    },
    projects: [
        {
            name: 'desktopChromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ].filter( project => { return !browser || project.name === browser; }),

});