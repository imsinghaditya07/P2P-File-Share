import { test, expect } from '@playwright/test';
import { randomBytes } from 'crypto';
import fs from 'fs';
import path from 'path';

test('P2P Transfer Flow', async ({ browser }) => {
    // Setup contexts
    const contextA = await browser.newContext();
    const contextB = await browser.newContext();
    const pageA = await contextA.newPage();
    const pageB = await contextB.newPage();

    // Generate test file
    const testFile = path.join(__dirname, 'test-10mb.bin');
    const buffer = randomBytes(10 * 1024 * 1024);
    fs.writeFileSync(testFile, buffer);

    // Sender (Page A)
    await pageA.goto('http://localhost:3000');

    // Drag and drop file
    // Note: Playwright drag and drop support varies, sometimes input[type=file] is easier.
    // Our DropZone has a hidden input.
    const fileInput = pageA.locator('input[type="file"]');
    await fileInput.setInputFiles(testFile);

    // Wait for processing
    await expect(pageA.getByText('Ready to send')).toBeVisible();

    // Create Room
    await pageA.getByRole('button', { name: 'Create P2P Room' }).click();

    // Wait for room ID in URL
    await pageA.waitForURL(/\/room\/.+/);
    const roomUrl = pageA.url();

    // Receiver (Page B)
    await pageB.goto(roomUrl);

    // Wait for connection
    await expect(pageA.getByText('connected')).toBeVisible({ timeout: 10000 });
    await expect(pageB.getByText('connected')).toBeVisible({ timeout: 10000 });

    // Wait for transfer complete
    await expect(pageB.getByText('Transfer Complete')).toBeVisible({ timeout: 30000 });

    // Cleanup
    fs.unlinkSync(testFile);
});
