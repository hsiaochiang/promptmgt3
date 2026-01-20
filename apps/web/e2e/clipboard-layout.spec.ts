import { expect, test } from '@playwright/test';

test.describe('clipboard layout', () => {
  test('點 Header「搜尋」不應造成內容跳動', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '剪貼簿' }).click();

    const listToolbar = page.getByRole('toolbar').first();
    await expect(listToolbar).toBeVisible();

    const beforeTop = await listToolbar.boundingBox().then((b) => b?.y ?? null);

    // 點 MainContent header 的搜尋按鈕（title="搜尋"）
    await page.getByTitle('搜尋').first().click();
    await expect(page.getByPlaceholder('搜尋剪貼簿...')).toBeVisible();

    const afterTop = await listToolbar.boundingBox().then((b) => b?.y ?? null);

    test.skip(beforeTop === null || afterTop === null, 'toolbar bounding box 不存在，跳過位移檢查');
    expect(Math.abs((afterTop ?? 0) - (beforeTop ?? 0))).toBeLessThanOrEqual(1);

    // 收合搜尋（清除）
    await page.getByTitle('清除').first().click();
    const afterClearTop = await listToolbar.boundingBox().then((b) => b?.y ?? null);
    test.skip(afterClearTop === null, 'toolbar bounding box 不存在，跳過位移檢查');
    expect(Math.abs((afterClearTop ?? 0) - (beforeTop ?? 0))).toBeLessThanOrEqual(1);
  });

  test('點「新增」不應造成左欄列表位移', async ({ page }) => {
    await page.goto('/');

    await page.getByRole('button', { name: '剪貼簿' }).click();

    // 左欄列表容器（有片段時存在）
    const snippetList = page.locator('#snippet-list');

    // 若還在載入，等到有內容或空態訊息
    await expect(page.getByText('片段')).toBeVisible();

    const beforeListTop = await snippetList
      .first()
      .boundingBox()
      .then((b) => b?.y ?? null);

    // 點左欄「新增」
    await page.getByRole('button', { name: '新增' }).first().click();

    // 右側 editor 應出現標題 input（placeholder=未命名）
    await expect(page.getByPlaceholder('未命名')).toBeVisible();

    const afterListTop = await snippetList
      .first()
      .boundingBox()
      .then((b) => b?.y ?? null);

    // 如果 snippet list 不存在（極端狀況），直接略過本檢查
    test.skip(beforeListTop === null || afterListTop === null, 'snippet list 不存在，跳過位移檢查');

    // 允許 1px 浮動（抗鋸齒/子像素）
    expect(Math.abs((afterListTop ?? 0) - (beforeListTop ?? 0))).toBeLessThanOrEqual(1);
  });

  test('右側 textarea 預設應有足夠寬度與高度', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: '剪貼簿' }).click();

    await page.getByRole('button', { name: '新增' }).first().click();
    await expect(page.getByPlaceholder('未命名')).toBeVisible();

    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();

    const box = await textarea.boundingBox();
    expect(box).not.toBeNull();

    // 寬度：至少 520px（在 1280x720 viewport + 左側欄位存在下仍應達到）
    expect(box!.width).toBeGreaterThanOrEqual(520);

    // 高度：至少 240px（避免只剩 1–2 行）
    expect(box!.height).toBeGreaterThanOrEqual(240);
  });
});
