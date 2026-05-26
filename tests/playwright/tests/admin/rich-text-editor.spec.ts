import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

async function enableRichText(userPage: any) {
  const toggle = userPage.getByLabel("Rich Text");
  await toggle.check();
  await expect(userPage.getByTestId("rich-text-editor")).toBeVisible();
  await expect(userPage.locator(".ql-editor")).toBeVisible();
  await expect(userPage.locator(".ql-toolbar")).toBeVisible();
}

test.describe("ADMIN RICH TEXT EDITOR", () => {
  test.beforeEach(async () => {
    await seed();
  });

  test(
    "Can enable rich text editor",
    {
      tag: "@a4",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");

      await enableRichText(userPage);

      await expect(userPage.locator("#post-content")).toHaveCount(0);
      await expect(userPage.locator(".ql-editor")).toBeVisible();
      await expect(userPage.locator(".ql-toolbar")).toBeVisible();
    },
  );
});
