import { seed } from "@repo/db/seed";
import { expect, test, type Page } from "./fixtures";

test.describe("COMMENTING", () => {
  test.beforeEach(async () => {
    await seed();
  });

  function commentCardForContent(page: Page, content: string) {
    const contentNode = page
      .getByTestId("comment-content")
      .filter({ hasText: content })
      .first();

    return contentNode.locator(
      'xpath=ancestor::*[starts-with(@data-test-id,"comment-")][1]',
    );
  }

  test(
    "Add a top-level comment",
    {
      tag: "@a4",
    },
    async ({ page }) => {
      await page.goto("/post/boost-your-conversion-rate");

      const comments = page.getByTestId("comments");
      await expect(comments).toBeVisible();
      await expect(comments.getByText("No comments yet.")).toBeVisible();

      await comments.getByPlaceholder("Write a comment...").fill("Hello from E2E");
      await comments.getByRole("button", { name: "Comment" }).click();

      await expect(comments.getByText("Hello from E2E")).toBeVisible();
      await expect(comments.getByText("Anonymous")).toBeVisible();
    },
  );

  test(
    "Reply to an existing comment",
    {
      tag: "@a4",
    },
    async ({ page }) => {
      await page.goto("/post/boost-your-conversion-rate");

      const comments = page.getByTestId("comments");
      await expect(comments).toBeVisible();

      await comments.getByPlaceholder("Write a comment...").fill("Parent comment");
      await comments.getByRole("button", { name: "Comment" }).click();
      await expect(comments.getByText("Parent comment")).toBeVisible();

      const parentCard = commentCardForContent(page, "Parent comment");

      await parentCard.getByRole("link", { name: "Reply" }).click();
      await expect(parentCard.getByPlaceholder("Write a reply...")).toBeVisible();

      await parentCard.getByPlaceholder("Write a reply...").fill("Child reply");
      await parentCard.getByRole("button", { name: "Reply" }).click();

      await expect(comments.getByText("Child reply")).toBeVisible();
    },
  );

  test(
    "Support nested replies (reply to a reply)",
    {
      tag: "@a4",
    },
    async ({ page }) => {
      await page.goto("/post/boost-your-conversion-rate");

      const comments = page.getByTestId("comments");
      await expect(comments).toBeVisible();

      await comments.getByPlaceholder("Write a comment...").fill("Level 1");
      await comments.getByRole("button", { name: "Comment" }).click();
      await expect(comments.getByText("Level 1")).toBeVisible();

      const level1Card = commentCardForContent(page, "Level 1");

      await level1Card.getByRole("link", { name: "Reply" }).click();
      await level1Card.getByPlaceholder("Write a reply...").fill("Level 2");
      await level1Card.getByRole("button", { name: "Reply" }).click();
      await expect(comments.getByText("Level 2")).toBeVisible();

      const level2Card = commentCardForContent(page, "Level 2");

      await level2Card.getByRole("link", { name: "Reply" }).click();
      await level2Card.getByPlaceholder("Write a reply...").fill("Level 3");
      await level2Card.getByRole("button", { name: "Reply" }).click();

      await expect(comments.getByText("Level 3")).toBeVisible();
    },
  );
});
