import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

test.describe("COMMENTS SYSTEM", () => {
  test.beforeAll(async () => {
    await seed();
  });

  test("Display comments section on detail page", { tag: "@a4" }, async ({ page }) => {
    await page.goto("/post/boost-your-conversion-rate");
    await expect(page.getByTestId("comments")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Comments" })).toBeVisible();
  });

  test("Show empty state when no comments", { tag: "@a4" }, async ({ page }) => {
    await page.goto("/post/boost-your-conversion-rate");
    await expect(page.getByText("No comments yet.")).toBeVisible();
  });

  test("Add a new comment", { tag: "@a4" }, async ({ page }) => {
    await page.goto("/post/boost-your-conversion-rate");
    const commentText = `Test comment ${Date.now()}`;

    await page.getByPlaceholder("Your name (optional)").fill("Test User");
    await page.getByPlaceholder("Write a comment...").fill(commentText);
    await page.getByRole("button", { name: "Comment" }).click();

    
    await page.reload();
    await expect(page.getByText(commentText)).toBeVisible({ timeout: 10000 });
    await expect(page.getByText("Test User")).toBeVisible();
  });

  test("Add comment without name uses Anonymous", { tag: "@a4" }, async ({ page }) => {
    await page.goto("/post/boost-your-conversion-rate");
    const commentText = `Anonymous comment ${Date.now()}`;

    await page.getByPlaceholder("Write a comment...").fill(commentText);
    await page.getByRole("button", { name: "Comment" }).click();

    await page.reload();
    await expect(page.getByText(commentText)).toBeVisible({ timeout: 10000 });
    
    const authorSpan = page.locator('span.font-semibold', { hasText: 'Anonymous' });
    await expect(authorSpan).toBeVisible();
  });

  test("Reply to a comment", { tag: "@a4" }, async ({ page }) => {
    await page.goto("/post/boost-your-conversion-rate");
    const parentComment = `Parent comment ${Date.now()}`;

    await page.getByPlaceholder("Write a comment...").fill(parentComment);
    await page.getByRole("button", { name: "Comment" }).click();
    await page.reload();
    await expect(page.getByText(parentComment)).toBeVisible({ timeout: 10000 });

    const parentDiv = page.locator(`div[data-test-id^="comment-"]:has-text("${parentComment}")`).first();
    await parentDiv.getByRole("link", { name: "Reply" }).click();
    await page.waitForURL(/replyTo=\d+/);

    const replyText = `Reply content ${Date.now()}`;
    await page.getByPlaceholder("Write a reply...").fill(replyText);
    await page.getByRole("button", { name: "Reply" }).click();

    await page.reload();
    await expect(page.getByText(replyText)).toBeVisible({ timeout: 10000 });
  });

  test("Cancel reply", { tag: "@a4" }, async ({ page }) => {
    await page.goto("/post/boost-your-conversion-rate");
    const parentComment = `Cancel test ${Date.now()}`;

    await page.getByPlaceholder("Write a comment...").fill(parentComment);
    await page.getByRole("button", { name: "Comment" }).click();
    await page.reload();
    await expect(page.getByText(parentComment)).toBeVisible();

    const parentDiv = page.locator(`div[data-test-id^="comment-"]:has-text("${parentComment}")`).first();
    await parentDiv.getByRole("link", { name: "Reply" }).click();
    await page.waitForURL(/replyTo=\d+/);
    await page.getByRole("link", { name: "Cancel" }).click();
    await expect(page).not.toHaveURL(/replyTo=\d+/);
    await expect(page.getByPlaceholder("Write a reply...")).not.toBeVisible();
  });

  test("Multiple comments displayed in order", { tag: "@a4" }, async ({ page }) => {
    await page.goto("/post/boost-your-conversion-rate");
    const comment1 = `First ${Date.now()}`;
    const comment2 = `Second ${Date.now()}`;

    await page.getByPlaceholder("Write a comment...").fill(comment1);
    await page.getByRole("button", { name: "Comment" }).click();
    await page.reload();
    await expect(page.getByText(comment1)).toBeVisible();

    await page.getByPlaceholder("Write a comment...").fill(comment2);
    await page.getByRole("button", { name: "Comment" }).click();
    await page.reload();

    const commentContents = await page.locator('[data-test-id="comment-content"]').allTextContents();
    const firstIndex = commentContents.findIndex(c => c.includes(comment1));
    const secondIndex = commentContents.findIndex(c => c.includes(comment2));
    expect(firstIndex).toBeLessThan(secondIndex);
  });
});