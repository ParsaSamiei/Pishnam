import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/en.json";
import { SiteFooter } from "@/components/layout/site-footer";
import ContactPage from "@/app/[locale]/contact-us/page";
import { FloatingContactButton } from "@/components/home/floating-contact-button";
import { BranchPhoneNumbers } from "./branch-phone-numbers";
import { toDisplayAddresses } from "@/lib/contact-addresses";
import type { ContactSettingsWithAddresses } from "@/lib/contact-settings";

vi.mock("@/lib/contact-settings", () => ({ getContactSettings: async () => settings }));
vi.mock("next-intl/server", () => ({
  getLocale: async () => "en",
  getTranslations: async () => (key: string) => key,
  setRequestLocale: vi.fn(),
}));
vi.mock("next/image", () => ({ default: () => null }));
vi.mock("@/lib/i18n/navigation", () => ({
  Link: ({ children }: { children: ReactNode }) => <span>{children}</span>,
}));
vi.mock("@/components/forms/lead-capture-form", () => ({ LeadCaptureForm: () => null }));
vi.mock("@/components/layout/page-header", () => ({ PageHeader: () => null }));
vi.mock("@/components/motion/use-reduced-motion-safe", () => ({
  useReducedMotionSafe: () => true,
}));

afterEach(cleanup);

const settings: ContactSettingsWithAddresses = {
  id: "default",
  phones: ["09120000000"],
  email: null,
  footerTaglineFa: null,
  footerTaglineEn: "Custom footer tagline",
  telegramUrl: null,
  baleUrl: null,
  youtubeUrl: null,
  aparatUrl: null,
  instagramUrl: null,
  updatedAt: new Date(),
  addresses: ["First branch", "Second branch"].map((addressEn, index) => ({
    id: `branch-${index}`,
    contactSettingsId: "default",
    addressFa: null,
    addressEn,
    postalCode: null,
    mapEmbedUrl: null,
    phones: index === 0 ? ["021 11111111"] : ["071 22222222"],
    order: index,
    createdAt: new Date(),
    updatedAt: new Date(),
  })),
};

function renderContact(node: ReactNode) {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      {node}
    </NextIntlClientProvider>,
  );
}

function expectBranchPhones() {
  const first = within(screen.getByRole("group", { name: "Address 1" }));
  const second = within(screen.getByRole("group", { name: "Address 2" }));
  expect(first.getByRole("link", { name: "021 11111111" }).getAttribute("href")).toBe(
    "tel:02111111111",
  );
  expect(second.getByRole("link", { name: "071 22222222" }).getAttribute("href")).toBe(
    "tel:07122222222",
  );
  expect(first.queryByRole("link", { name: "071 22222222" })).toBeNull();
  expect(second.queryByRole("link", { name: "021 11111111" })).toBeNull();
  expect(first.queryByRole("link", { name: "09120000000" })).toBeNull();
}

describe("branch phone display", () => {
  it("shows branch numbers under their own addresses in the footer and preserves the tagline", async () => {
    renderContact(await SiteFooter());
    expectBranchPhones();
    expect(screen.getByText("General phone")).toBeTruthy();
    expect(screen.getByText("Custom footer tagline")).toBeTruthy();
  });

  it("shows branch numbers on the contact page and associates them with their locations in JSON-LD", async () => {
    const { container } = renderContact(
      await ContactPage({ params: Promise.resolve({ locale: "en" }) }),
    );
    expectBranchPhones();
    const data = JSON.parse(
      container.querySelector('script[type="application/ld+json"]')!.textContent!,
    );
    expect(data.mainEntity.telephone).toEqual(["09120000000"]);
    expect(data.mainEntity.location[0].telephone).toEqual(["021 11111111"]);
    expect(data.mainEntity.location[1].telephone).toEqual(["071 22222222"]);
  });

  it("shows branch numbers in the floating contact widget", () => {
    renderContact(
      <FloatingContactButton
        addresses={toDisplayAddresses(settings.addresses, false)}
        phones={settings.phones}
        socialLinks={[]}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: messages.home.floatingContact.open }));
    expectBranchPhones();
    expect(screen.getByText("General phone")).toBeTruthy();
  });

  it("uses Persian digits for display and Latin digits in callable links", () => {
    render(<BranchPhoneNumbers phones={["021 11111111"]} isFa />);
    expect(screen.getByRole("link", { name: "۰۲۱ ۱۱۱۱۱۱۱۱" }).getAttribute("href")).toBe(
      "tel:02111111111",
    );
  });

  it("hides an empty branch-phone section", () => {
    const { container } = render(<BranchPhoneNumbers phones={[]} isFa={false} />);
    expect(container.childElementCount).toBe(0);
  });
});
