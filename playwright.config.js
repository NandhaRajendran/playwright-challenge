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
    workers: 2,
    timeout: 60000,
    expect: {
        timeout: 10000
    },
    use: {
        headless: true,
        actionTimeout: 30000,
        navigationTimeout: 60000,
        screenshot: 'only-on-failure',
        trace: 'retain-on-failure',
        viewport: {
            height: 720,
            width: 1280
        }
    },
    projects: [
        {
            name: 'desktopChromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ].filter( project => { return !browser || project.name === browser; }),

});