import { describe, it, expect } from "vitest";
import { render, waitFor, act } from "@testing-library/react";
import type { Editor } from "@tiptap/react";
import { RichTextEditor } from "@/components/admin/rich-text-editor";

/**
 * Regression cover for the admin body fields submitting empty.
 *
 * The editor previously mirrored its HTML into `<input type="hidden"
 * defaultValue={...}>` by assigning `.value` from an effect. For
 * `type="hidden"` the `value` IDL attribute reflects the *content attribute*,
 * so React's next reconcile of the `defaultValue` prop overwrote it -- and
 * Tiptap re-renders on every keystroke to refresh the toolbar. The result:
 * "متن دوره الزامی است." on create, and a silent revert to the previously
 * saved body on edit. These tests submit real FormData, which is the only
 * thing the server action ever sees.
 */
async function typeAndSubmit(defaultValue: string, text: string) {
  const { container } = render(
    <form>
      <RichTextEditor name="bodyFa" defaultValue={defaultValue} />
    </form>,
  );
  await waitFor(() => expect(container.querySelector(".ProseMirror")).toBeTruthy());

  // Tiptap exposes the instance on its editable element; driving a command is
  // the same code path as typing (fires `update`, then re-renders).
  const editable = container.querySelector(".ProseMirror") as HTMLElement & { editor: Editor };
  await act(async () => {
    editable.editor.commands.selectAll();
    if (text) editable.editor.commands.insertContent(text);
    else editable.editor.commands.deleteSelection();
  });
  await act(async () => {});

  const form = container.querySelector("form") as HTMLFormElement;
  return new FormData(form).get("bodyFa");
}

describe("RichTextEditor", () => {
  it("submits the body typed into an empty editor", async () => {
    expect(await typeAndSubmit("", "متن دوره من")).toBe("<p>متن دوره من</p>");
  });

  it("submits the edited body rather than reverting to the saved one", async () => {
    expect(await typeAndSubmit("<p>OLD SAVED BODY</p>", "متن جدید")).toBe("<p>متن جدید</p>");
  });

  it("submits an empty string when the editor is cleared, so the field reads as missing", async () => {
    // An empty Tiptap document stringifies to "<p></p>", which would satisfy
    // the schema's required check and store a blank body.
    expect(await typeAndSubmit("<p>OLD SAVED BODY</p>", "")).toBe("");
  });

  it("registers the field before the editor has mounted", () => {
    const { container } = render(
      <form>
        <RichTextEditor name="bodyFa" defaultValue="<p>saved</p>" />
      </form>,
    );
    const form = container.querySelector("form") as HTMLFormElement;
    expect(new FormData(form).get("bodyFa")).toBe("<p>saved</p>");
  });
});
