/** Dispatched when admin tools need to push HTML into a RichTextEditor by field name. */
export const RICHTEXT_SET_EVENT = "pishnam:richtext-set";

export type RichTextSetDetail = {
  name: string;
  html: string;
};

export function dispatchRichTextSet(name: string, html: string) {
  window.dispatchEvent(
    new CustomEvent<RichTextSetDetail>(RICHTEXT_SET_EVENT, {
      detail: { name, html },
    }),
  );
}
