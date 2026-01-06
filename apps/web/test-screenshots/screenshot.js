const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const base = process.env.BASE_URL || 'http://localhost:3000';
  const outDir = path.resolve(__dirname);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });

  try {
    // Library (資料庫)
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.waitForTimeout(500);
    await page.screenshot({ path: path.join(outDir, 'library.png'), fullPage: true });

    // Inbox
    // Click sidebar '暫存區' button (by text)
    const inboxBtn = await page.locator('button:has-text("暫存區")').first();
    if (await inboxBtn.count()) {
      await inboxBtn.click();
      await page.waitForTimeout(400);
      await page.screenshot({ path: path.join(outDir, 'inbox.png'), fullPage: true });
    }

    // Try open detail: click first prompt row
    const firstRow = await page.locator('[role="button"]:has-text("提示詞")').first();
    // fallback: try list row selector
    if (!(await firstRow.count())) {
      const altRow = await page.locator('div:has-text("編輯提示詞").nth(0)');
      if (await altRow.count()) {
        await altRow.click();
        await page.waitForTimeout(400);
      }
    } else {
      await firstRow.click();
      await page.waitForTimeout(400);
    }

    // Take detail panel screenshot (if open)
    const detail = await page.locator('text=已保存').first();
    if (await detail.count()) {
      await page.screenshot({ path: path.join(outDir, 'detail.png'), fullPage: true });
    }

    console.log('Screenshots saved to', outDir);
  } catch (err) {
    console.error('Screenshot error:', err);
  } finally {
    await browser.close();
  }
})();
