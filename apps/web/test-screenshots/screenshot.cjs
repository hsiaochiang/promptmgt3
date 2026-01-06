const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const outDir = path.resolve(__dirname);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log('[screenshot] base URL=', base);
  const browser = await chromium.launch();
  console.log('[screenshot] launched browser');
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  console.log('[screenshot] opened page');

  try {
    // Library (資料庫)
    console.log('[screenshot] navigating to', base);
    await page.goto(base, { waitUntil: 'networkidle' });
    console.log('[screenshot] page loaded');
    await page.waitForTimeout(500);
    const libPath = path.join(outDir, 'library.png');
    await page.screenshot({ path: libPath, fullPage: true });
    console.log('[screenshot] saved', libPath);

    // Inbox
    // Click sidebar '暫存區' button (by text)
    const inboxBtn = await page.locator('button:has-text("暫存區")').first();
    if (await inboxBtn.count()) {
      await inboxBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(outDir, 'inbox.png'), fullPage: true });
    }

    // Try open detail: click first prompt row
    console.log('[screenshot] trying to open detail row');
    const firstRow = await page.locator('div:has-text("提示詞")').first();
    console.log('[screenshot] firstRow count=', await firstRow.count());
    if (await firstRow.count()) {
      await firstRow.click();
      await page.waitForTimeout(400);

      const detailPath = path.join(outDir, 'detail.png');
      await page.screenshot({ path: detailPath, fullPage: true });
      console.log('[screenshot] saved', detailPath);
    } else {
      console.log('[screenshot] no detail row found');
    }

    console.log('[screenshot] finished, screenshots (if any) saved to', outDir);
  } catch (err) {
    console.error('[screenshot] error:', err && err.stack ? err.stack : err);
  } finally {
    await browser.close();
  }
})();
