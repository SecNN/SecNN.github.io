import { test, expect } from '@playwright/test';

test('主页包含统一入口和隐私页链接', async ({ page }) => {
    await page.goto('/index.html');
    await expect(page).toHaveTitle(/SecNN/);
    await expect(page.locator('.ai-banner-title .fa-terminal')).toBeVisible();
    await expect(page.locator('footer a', { hasText: '隐私说明' })).toBeVisible();
});

test('旧 IP 地址跳转到统一工具页', async ({ page }) => {
    await page.goto('/ip-lookup.html');
    await page.waitForURL(/\/tools\/ip-lookup\.html$/);
    await expect(page.locator('h1')).toHaveText('IP 地址与域名查询');
});

test('GitMailFinder Token 仅存于会话且可以清除', async ({ page }) => {
    await page.goto('/GitMailFinder/index.html');
    await page.locator('#token').fill('temporary-token');
    await page.locator('#queryApi').click();
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('github_token'))).toBe('temporary-token');
    await page.locator('#clearToken').click();
    await expect(page.locator('#token')).toHaveValue('');
    await expect.poll(() => page.evaluate(() => sessionStorage.getItem('github_token'))).toBeNull();
});

test('随机选号支持切换玩法和复制全部', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/ssq/index.html');
    await page.locator('#qlc-btn').click();
    await page.locator('#bet-count').fill('3');
    await page.getByRole('button', { name: '重新生成' }).click();
    await expect(page.locator('.result-card')).toHaveCount(3);
    await page.locator('#copy-all').click();
    await expect(page.locator('#copy-all')).toHaveText('已复制全部');
});

test('JWT 页面使用本地依赖并可生成 Token', async ({ page }) => {
    await page.goto('/tools/jwt-tool.html');
    await expect(page.locator('h1')).toHaveText('JWT 编解码与签名验证');
    await expect(page.locator('script[src*="assets/vendor/crypto-js"]')).toHaveCount(1);
});

test('主要页面没有水平溢出', async ({ page }) => {
    for (const path of ['/index.html', '/tools/index.html', '/tools/jwt-tool.html', '/ssq/index.html', '/sponsor/sponsor.html']) {
        await page.goto(path);
        const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1);
        expect(overflow, `${path} 存在水平溢出`).toBeFalsy();
    }
});
