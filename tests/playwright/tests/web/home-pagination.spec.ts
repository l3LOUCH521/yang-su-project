import { seed } from "@repo/db/seed";
import { client } from "@repo/db/client";
import { expect, test } from "./fixtures";

test.beforeAll(async () => {
  await seed();
});

test.describe("HOME PAGINATION", () => {
  test(
    "Can paginate from current page to next page",
    {
      tag: "@a3",
    },
    async ({ page }) => {
      await page.goto("/?page=1&pageSize=2");

      await expect(page.getByTestId("pagination")).toBeVisible();
      await expect(page.getByTestId("pagination-status")).toContainText(
        "Page 1 of 2",
      );

      await expect(page.locator("article")).toHaveCount(2);

      await page.getByTestId("pagination-next").click();
      await expect(page).toHaveURL(/\/?page=2(&|$)/);

      await expect(page.getByTestId("pagination-status")).toContainText(
        "Page 2 of 2",
      );

      await expect(page.locator("article")).toHaveCount(1);

      // Inactive post (Dec 2012) should never appear
      await expect(page.getByText("December, 2012")).not.toBeVisible();
    },
  );

});
