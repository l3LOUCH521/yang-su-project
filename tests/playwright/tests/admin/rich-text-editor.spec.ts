import { client } from "@repo/db/client";
import { seed } from "@repo/db/seed";
import { expect, test } from "./fixtures";

// Enable the rich text editor and verify it appears correctly.
async function enableRichText(userPage: any) {
  const toggle = userPage.getByLabel("Rich Text");
  await toggle.check();
  await expect(userPage.getByTestId("rich-text-editor")).toBeVisible();
  await expect(userPage.locator(".ql-editor")).toBeVisible();
  await expect(userPage.locator(".ql-toolbar")).toBeVisible();
}

// get the content of the rich text editor
async function getEditorContent(userPage: any) {
  return await userPage.locator(".ql-editor").innerHTML();
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
  test(
    "Can use Heading 1",
    {
      tag: "@a4",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");
      await enableRichText(userPage);

      const editor = userPage.locator(".ql-editor");
      await editor.click();

      // Click the Heading dropdown and select Heading 1
      await userPage.locator('.ql-header.ql-picker').click();
      await userPage.locator('.ql-picker-options [data-value="1"]').click();

      await editor.fill("This is Heading 1");

      const content = await getEditorContent(userPage);
      expect(content).toContain("<h1>");
      expect(content).toContain("This is Heading 1");
    },
  );

  test(
    "Can use Heading 2",
    {
      tag: "@a4",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");
      await enableRichText(userPage);

      const editor = userPage.locator(".ql-editor");
      await editor.click();

      // Click the Heading dropdown and select Heading 2
      await userPage.locator('.ql-header.ql-picker').click();
      await userPage.locator('.ql-picker-options [data-value="2"]').click();

      await editor.fill("This is Heading 2");

      const content = await getEditorContent(userPage);
      expect(content).toContain("<h2>");
      expect(content).toContain("This is Heading 2");
    },
  );

  test(
    "Can use Heading 3",
    {
      tag: "@a4",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");
      await enableRichText(userPage);

      const editor = userPage.locator(".ql-editor");
      await editor.click();

      // Click the Heading dropdown and select Heading 3
      await userPage.locator('.ql-header.ql-picker').click();
      await userPage.locator('.ql-picker-options [data-value="3"]').click();

      await editor.fill("This is Heading 3");

      const content = await getEditorContent(userPage);
      expect(content).toContain("<h3>");
      expect(content).toContain("This is Heading 3");
    },
  );

  test(
    "Can use Bold text",
    {
      tag: "@a4",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");
      await enableRichText(userPage);

      const editor = userPage.locator(".ql-editor");
      await editor.click();
      await editor.fill("Bold text");

      await userPage.locator('.ql-bold').click();

      const content = await getEditorContent(userPage);
      expect(content).toContain("<strong>");
      expect(content).toContain("Bold text");
    },
  );

  test(
    "Can use Italic text",
    {
      tag: "@a4",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");
      await enableRichText(userPage);

      const editor = userPage.locator(".ql-editor");
      await editor.click();
      await editor.fill("Italic text");

      await userPage.locator('.ql-italic').click();

      const content = await getEditorContent(userPage);
      expect(content).toContain("<em>");
      expect(content).toContain("Italic text");
    },
  );
  test(
    "Can use Underline text",
    {
      tag: "@a4",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");
      await enableRichText(userPage);

      const editor = userPage.locator(".ql-editor");
      await editor.click();
      await editor.fill("Underline text");

      await userPage.locator('.ql-underline').click();

      const content = await getEditorContent(userPage);
      expect(content).toContain("<u>");
      expect(content).toContain("Underline text");
    },
  );
  test(
  "Can add link",
  {
    tag: "@a4",
  },
  async ({ userPage }) => {
    await userPage.goto("/post/no-front-end-framework-is-the-best");
    await enableRichText(userPage);

    const editor = userPage.locator(".ql-editor");
    await editor.click();
    await editor.fill("Click here");

    // Select all text
    await editor.click();
    await editor.press("Control+A");

    // Use Quill API — must target the inner container div where __quill is set
    await userPage.evaluate(() => {
      // Quill is set on the .ql-editor's parent (.ql-container), or on containerEl.
      // Try both the editor element and its parent.
      const editorEl = document.querySelector('.ql-editor') as any;
      const containerEl = editorEl?.closest('.ql-container') as any;
      const quill = editorEl?.__quill ?? containerEl?.__quill;
      if (quill) {
        quill.focus();
        quill.setSelection(0, quill.getLength());
        quill.format('link', 'https://example.com');
      }
    });

    await userPage.waitForTimeout(500);

    const content = await getEditorContent(userPage);
    expect(content).toContain('href="https://example.com"');
    expect(content).toContain("Click here");
  },
);

test(
  "Can create bullet list",
  {
    tag: "@a4",
  },
  async ({ userPage }) => {
    await userPage.goto("/post/no-front-end-framework-is-the-best");
    await enableRichText(userPage);

    const editor = userPage.locator(".ql-editor");
    await editor.click();

    // press the bullet list button
    await userPage.locator('.ql-list[value="bullet"]').click();

    await editor.pressSequentially("First item");
    await editor.press("Enter");
    await editor.pressSequentially("Second item");

    const content = await getEditorContent(userPage);
    expect(content).toContain('data-list="bullet"');
    expect(content).toContain("First item");
    expect(content).toContain("Second item");
  },
);

  test(
    "Can create numbered list",
    {
      tag: "@a4",
    },
    async ({ userPage }) => {
      await userPage.goto("/post/no-front-end-framework-is-the-best");
      await enableRichText(userPage);

      const editor = userPage.locator(".ql-editor");
      await editor.click();

      // press the numbered list button
      await userPage.locator('.ql-list[value="ordered"]').click();

      await editor.fill("First item");
      await editor.press("Enter");
      await editor.fill("Second item");

      const content = await getEditorContent(userPage);
      expect(content).toContain("<ol>");
      expect(content).toContain("<li");
    },
  );
  test(
  "Can clear formatting with Tx button",
  {
    tag: "@a4",
  },
  async ({ userPage }) => {
    await userPage.goto("/post/no-front-end-framework-is-the-best");
    await enableRichText(userPage);

    const editor = userPage.locator(".ql-editor");
    await editor.click();

    // input some text, select it, and apply bold and italic formatting
    await editor.fill("Formatted text");
    await editor.press("Control+A");
    await userPage.locator('.ql-bold').click();
    await userPage.locator('.ql-italic').click();

    // validate formatting is applied
    let content = await getEditorContent(userPage);
    expect(content).toContain("<strong>");
    expect(content).toContain("<em>");

    // highlight all text again to clear formatting
    await editor.click();
    await editor.press("Control+A");

    // press the "Tx" clear formatting button
    await userPage.locator('.ql-clean, button:has-text("Tx")').click();

    // wait for the content to update
    await userPage.waitForTimeout(500);

    // validate formatting is removed but text remains
    content = await getEditorContent(userPage);
    expect(content).not.toContain("<strong>");
    expect(content).not.toContain("<em>");
    expect(content).toContain("Formatted text");
  },
);

test(
  "Can disable rich text editor",
  {
    tag: "@a4",
  },
  async ({ userPage }) => {
    await userPage.goto("/post/no-front-end-framework-is-the-best");

    //enable first to ensure the editor is present before disabling
    await enableRichText(userPage);

    // Then disable and check it disappears
    const toggle = userPage.getByLabel("Rich Text");
    await toggle.uncheck();


    await expect(userPage.getByTestId("rich-text-editor")).not.toBeVisible();
    await expect(userPage.locator(".ql-editor")).not.toBeVisible();
    await expect(userPage.locator(".ql-toolbar")).not.toBeVisible();

    await expect(userPage.locator("#post-content")).toBeVisible();
  },
);
});
