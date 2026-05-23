import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

test.describe("ADMIN PAGINATION", () => {
  test.beforeAll(async () => {
    await seed();
  });

  test(
    "Shows pagination controls (page size 4)",
    {
      tag: "@a4",
    },
    async ({ userPage }) => {
      await userPage.goto("/");

      const totalPosts = await client.db.post.count();
      const expectedPages = Math.max(1, Math.ceil(totalPosts / 4));

      await expect(userPage.getByTestId("pagination")).toBeVisible();
      await expect(userPage.getByTestId("pagination-status")).toContainText(
        `Page 1 of ${expectedPages}`,
      );

      const page1Count = await userPage.locator("article").count();
      expect(page1Count).toBeGreaterThan(0);
      expect(page1Count).toBeLessThanOrEqual(4);

      if (expectedPages === 1) {
        await expect(userPage.getByTestId("pagination-prev")).toBeDisabled();
        await expect(userPage.getByTestId("pagination-next")).toBeDisabled();
      }
    },
  );

  test(
    "Can go from current page to next page",
    {
      tag: "@a4",
    },
    async ({ userPage }) => {
      await seed();

      try {
        await client.db.post.create({
          data: {
            urlId: "extra-post-for-pagination",
            title: "Extra Post For Pagination testing",
            content: "testing pagination",
            description: "testing pagination",
            imageUrl: "https://plus.unsplash.com/premium_photo-1661517706036-a48d5fc8f2f5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            category: "React",
            tags: "Front-End",
            active: true,
            date: new Date("2026-05-21T00:00:00Z"),
          },
        });

        const totalPosts = await client.db.post.count();
        const expectedPages = Math.max(1, Math.ceil(totalPosts / 4));
        expect(expectedPages).toBeGreaterThan(1);

        await userPage.goto("/");

        await expect(userPage.getByTestId("pagination-status")).toContainText(
          `Page 1 of ${expectedPages}`,
        );
        await expect(userPage.getByTestId("pagination-prev")).toBeDisabled();
        await expect(userPage.getByTestId("pagination-next")).toBeEnabled();

        const firstTitle = await userPage.locator("article h3").first().innerText();
        await userPage.getByTestId("pagination-next").click();

        await expect(userPage.getByTestId("pagination-status")).toContainText(
          `Page 2 of ${expectedPages}`,
        );
        await expect(userPage.getByTestId("pagination-prev")).toBeEnabled();

        const page2Count = await userPage.locator("article").count();
        expect(page2Count).toBeGreaterThan(0);
        expect(page2Count).toBeLessThanOrEqual(4);

        const secondTitle = await userPage.locator("article h3").first().innerText();
        expect(secondTitle).not.toEqual(firstTitle);
      } finally {
        await seed();
      }
    },
  );

  test(
    "Can go from current page back to previous page",
    {
      tag: "@a4",
    },
    async ({ userPage }) => {
      await seed();

      try {
        await client.db.post.create({
          data: {
            urlId: "extra-post-for-pagination",
            title: "Extra Post For Pagination testing",
            content: "testing pagination",
            description: "testing pagination",
            imageUrl:
              "https://plus.unsplash.com/premium_photo-1661517706036-a48d5fc8f2f5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
            category: "React",
            tags: "Front-End",
            active: true,
            date: new Date("2026-05-21T00:00:00Z"),
          },
        });

        const totalPosts = await client.db.post.count();
        const expectedPages = Math.max(1, Math.ceil(totalPosts / 4));
        expect(expectedPages).toBeGreaterThan(1);

        await userPage.goto("/");

        await userPage.getByTestId("pagination-next").click();
        await expect(userPage.getByTestId("pagination-status")).toContainText(
          `Page 2 of ${expectedPages}`,
        );

        await userPage.getByTestId("pagination-prev").click();
        await expect(userPage.getByTestId("pagination-status")).toContainText(
          `Page 1 of ${expectedPages}`,
        );
      } finally {
        await seed();
      }
    },
  );
});
