import { test, expect } from '@playwright/test';

const timestamp = Date.now();
const testUser = {
  username: `user${timestamp}`,
  password: 'test1234',
};

test.describe('註冊功能', () => {
  test('成功開啟登入/註冊 Dialog', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Sign In / Register")');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText('Player Account')).toBeVisible();
  });

  test('成功註冊新帳號', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Sign In / Register")');
    await page.getByRole('tab', { name: 'Register' }).click();
    await page.locator('#register-username').fill(testUser.username);
    await page.locator('#register-password').fill(testUser.password);
    await page.click('button:has-text("Create Account")');

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(`Playing as`)).toBeVisible();
    await expect(page.getByText(testUser.username)).toBeVisible();
  });

  test('重複帳號名稱顯示錯誤訊息', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Sign In / Register")');
    await page.getByRole('tab', { name: 'Register' }).click();
    await page.locator('#register-username').fill(testUser.username);
    await page.locator('#register-password').fill(testUser.password);
    await page.click('button:has-text("Create Account")');
    await expect(page.getByText(`Playing as`)).toBeVisible();
    await page.click('button:has-text("Logout")');

    await page.click('button:has-text("Sign In / Register")');
    await page.getByRole('tab', { name: 'Register' }).click();
    await page.locator('#register-username').fill(testUser.username);
    await page.locator('#register-password').fill(testUser.password);
    await page.click('button:has-text("Create Account")');
    await expect(page.getByText('Username already taken')).toBeVisible();
  });

  test('密碼不足 8 字元顯示驗證錯誤', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Sign In / Register")');
    await page.getByRole('tab', { name: 'Register' }).click();
    await page.locator('#register-username').fill(`user${timestamp}x`);
    await page.locator('#register-password').fill('short');
    await page.click('button:has-text("Create Account")');
    await expect(page.getByText('At least 8 characters required')).toBeVisible();
  });
});

test.describe('登入功能', () => {
  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage();
    await page.goto('/');
    await page.click('button:has-text("Sign In / Register")');
    await page.getByRole('tab', { name: 'Register' }).click();
    await page.locator('#register-username').fill(testUser.username);
    await page.locator('#register-password').fill(testUser.password);
    await page.click('button:has-text("Create Account")');
    await expect(page.getByText(`Playing as`)).toBeVisible();
    await page.close();
  });

  test('成功登入', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Sign In / Register")');
    await page.locator('#login-username').fill(testUser.username);
    await page.locator('#login-password').fill(testUser.password);
    await page.click('button:has-text("Login")');

    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText(testUser.username)).toBeVisible();
  });

  test('錯誤密碼顯示錯誤訊息', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Sign In / Register")');
    await page.locator('#login-username').fill(testUser.username);
    await page.locator('#login-password').fill('wrongpassword');
    await page.click('button:has-text("Login")');
    await expect(page.getByText('Invalid username or password')).toBeVisible();
  });

  test('登出後恢復訪客狀態', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Sign In / Register")');
    await page.locator('#login-username').fill(testUser.username);
    await page.locator('#login-password').fill(testUser.password);
    await page.click('button:has-text("Login")');
    await expect(page.getByText(testUser.username)).toBeVisible();

    await page.click('button:has-text("Logout")');
    await expect(page.getByText('Sign In / Register')).toBeVisible();
  });

  test('重整頁面後保持登入狀態', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Sign In / Register")');
    await page.locator('#login-username').fill(testUser.username);
    await page.locator('#login-password').fill(testUser.password);
    await page.click('button:has-text("Login")');
    await expect(page.getByText(testUser.username)).toBeVisible();

    await page.reload();
    await expect(page.getByText(testUser.username)).toBeVisible();
  });
});

test.describe('訪客模式', () => {
  test('Continue as Guest 可關閉 Dialog', async ({ page }) => {
    await page.goto('/');
    await page.click('button:has-text("Sign In / Register")');
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.click('text=Continue as Guest');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Sign In / Register')).toBeVisible();
  });
});
