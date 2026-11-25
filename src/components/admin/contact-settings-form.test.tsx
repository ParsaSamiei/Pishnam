import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { ContactSettingsForm } from "./contact-settings-form";
import { formActionError } from "@/lib/form-state";
import type { ContactSettingsFormState } from "@/app/admin/(dashboard)/contact/actions";

vi.mock("@/components/admin/en-field-label", () => ({
  EnFieldLabel: ({ children, htmlFor }: { children: ReactNode; htmlFor?: string }) => (
    <label htmlFor={htmlFor}>{children}</label>
  ),
}));

afterEach(cleanup);

const defaults = {
  phones: ["09120000000"],
  email: null,
  footerTaglineFa: null,
  footerTaglineEn: null,
  telegramUrl: null,
  baleUrl: null,
  youtubeUrl: null,
  aparatUrl: null,
  instagramUrl: null,
  addresses: [
    {
      addressFa: "تهران",
      addressEn: "Tehran",
      postalCode: null,
      mapEmbedUrl: null,
      phones: ["021 11111111"],
    },
    {
      addressFa: "شیراز",
      addressEn: "Shiraz",
      postalCode: null,
      mapEmbedUrl: null,
      phones: ["071 22222222", "09121111111"],
    },
  ],
};

const idleAction = async (): Promise<ContactSettingsFormState> => ({ status: "idle" });

describe("ContactSettingsForm branch phones", () => {
  it("submits phone numbers under their own branch and supports newly added branches", () => {
    const { container } = render(
      <ContactSettingsForm action={idleAction} defaultValues={defaults} />,
    );
    fireEvent.click(screen.getByRole("button", { name: "افزودن آدرس" }));
    fireEvent.change(screen.getByRole("textbox", { name: "تلفن شعبه 3، شماره 1" }), {
      target: { value: "03133333333" },
    });
    const data = new FormData(container.querySelector("form")!);
    expect(data.getAll("phones")).toEqual(["09120000000"]);
    expect(data.getAll("addressPhones.0")).toEqual(["021 11111111"]);
    expect(data.getAll("addressPhones.1")).toEqual(["071 22222222", "09121111111"]);
    expect(data.getAll("addressPhones.2")).toEqual(["03133333333"]);
  });

  it("keeps a surviving branch's numbers when another branch is deleted", () => {
    const { container } = render(
      <ContactSettingsForm action={idleAction} defaultValues={defaults} />,
    );
    fireEvent.click(screen.getByRole("button", { name: /^حذف آدرس$/ }));
    const data = new FormData(container.querySelector("form")!);
    expect(data.getAll("addressFa")).toEqual(["شیراز"]);
    expect(data.getAll("addressPhones.0")).toEqual(["071 22222222", "09121111111"]);
    expect(data.getAll("addressPhones.1")).toEqual([]);
  });

  it("adds and removes numbers without affecting other branches", () => {
    const { container } = render(
      <ContactSettingsForm action={idleAction} defaultValues={defaults} />,
    );
    fireEvent.click(screen.getAllByRole("button", { name: "افزودن تلفن برای این شعبه" })[0]!);
    fireEvent.change(screen.getByRole("textbox", { name: "تلفن شعبه 1، شماره 2" }), {
      target: { value: "09122222222" },
    });
    fireEvent.click(screen.getByRole("button", { name: "حذف تلفن 1 از شعبه 1" }));
    const data = new FormData(container.querySelector("form")!);
    expect(data.getAll("addressPhones.0")).toEqual(["09122222222"]);
    expect(data.getAll("addressPhones.1")).toEqual(["071 22222222", "09121111111"]);
  });

  it("preserves branch numbers after a validation failure, including cleared numbers", async () => {
    const action = vi.fn(async (_previous: ContactSettingsFormState, data: FormData) =>
      formActionError({ "addresses.1.phones.0": "شماره تلفن شعبه معتبر نیست." }, data),
    );
    const { container } = render(<ContactSettingsForm action={action} defaultValues={defaults} />);
    fireEvent.change(screen.getByRole("textbox", { name: "تلفن شعبه 1، شماره 1" }), {
      target: { value: "" },
    });
    fireEvent.change(screen.getByRole("textbox", { name: "تلفن شعبه 2، شماره 1" }), {
      target: { value: "invalid" },
    });
    fireEvent.submit(container.querySelector("form")!);
    await waitFor(() => expect(screen.getByText("شماره تلفن شعبه معتبر نیست.")).toBeTruthy());

    const data = new FormData(container.querySelector("form")!);
    expect(data.getAll("addressPhones.0")).toEqual([""]);
    expect(data.getAll("addressPhones.1")).toEqual(["invalid", "09121111111"]);
    expect(
      screen.getByRole("textbox", { name: "تلفن شعبه 2، شماره 1" }).getAttribute("aria-invalid"),
    ).toBe("true");
  });
});
