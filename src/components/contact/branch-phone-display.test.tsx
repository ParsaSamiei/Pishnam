import type { ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/en.json";
import faMessages from "@/messages/fa.json";
import { SiteFooter } from "@/components/layout/site-footer";
import ContactPage from "@/app/[locale]/contact-us/page";
import { FloatingContactButton } from "@/components/home/floating-contact-button";
import { BranchPhoneNumbers } from "./branch-phone-numbers";
import { toDisplayAddresses } from "@/lib/contact-addresses";
import type { ContactSettingsWithAddresses } from "@/lib/contact-settings";

const requestLocale = vi.hoisted(() => ({ value: "en" }));

vi.mock("@/lib/contact-settings", () => ({ getContactSettings: async () => settings }));
vi.mock("next-intl/server", () => ({
  getLocale: async () => requestLocale.value,
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
    nameFa: null,
    nameEn: null,
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

beforeEach(() => {
  requestLocale.value = "en";
  settings.addresses.forEach((address) => {
    address.nameFa = null;
    address.nameEn = null;
    address.mapEmbedUrl = null;
  });
});

function renderContact(node: ReactNode, locale: "en" | "fa" = "en") {
  return render(
    <NextIntlClientProvider locale={locale} messages={locale === "fa" ? faMessages : messages}>
      {node}
    </NextIntlClientProvider>,
  );
}

function footerBranchTriggers() {
  return within(screen.getByRole("group", { name: /^footer\.branches/ })).getAllByRole("button");
}

function openFooterBranches() {
  footerBranchTriggers().forEach((trigger) => fireEvent.click(trigger));
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
  it.each(
    (["footer", "page", "widget"] as const).flatMap((view) =>
      (["en", "fa"] as const).map((locale) => ({ view, locale })),
    ),
  )(
    "uses edited branch names and language fallback in $view ($locale)",
    async ({ view, locale }) => {
      requestLocale.value = locale;
      settings.addresses[0]!.nameFa = "شعبه رسالت";
      settings.addresses[0]!.nameEn = "Resalat branch";
      settings.addresses[1]!.nameFa = locale === "fa" ? null : "شعبه شیراز";
      settings.addresses[1]!.nameEn = locale === "fa" ? "Shiraz branch" : null;
      settings.addresses[1]!.mapEmbedUrl = "https://www.google.com/maps/embed?pb=second";

      if (view === "footer") {
        renderContact(await SiteFooter(), locale);
        openFooterBranches();
      } else if (view === "page")
        renderContact(await ContactPage({ params: Promise.resolve({ locale }) }), locale);
      else {
        renderContact(
          <FloatingContactButton
            addresses={toDisplayAddresses(settings.addresses, locale === "fa")}
            phones={settings.phones}
            socialLinks={[]}
          />,
          locale,
        );
        const activeMessages = locale === "fa" ? faMessages : messages;
        fireEvent.click(
          screen.getByRole("button", { name: activeMessages.home.floatingContact.open }),
        );
      }

      const firstName = locale === "fa" ? "شعبه رسالت" : "Resalat branch";
      const secondName = locale === "fa" ? "Shiraz branch" : "شعبه شیراز";
      const first = screen.getByRole("group", { name: firstName });
      const second = screen.getByRole("group", { name: secondName });
      expect(first.querySelector('a[href="tel:02111111111"]')).toBeTruthy();
      expect(second.querySelector('a[href="tel:07122222222"]')).toBeTruthy();
      expect(screen.queryByRole("group", { name: "Address 1" })).toBeNull();

      if (view === "page") {
        expect(screen.getByRole("heading", { level: 2, name: secondName })).toBeTruthy();
        expect(
          screen
            .getByTitle(
              `${secondName} — ${locale === "fa" ? "موقعیت روی نقشه" : "Location on map"}`,
            )
            .getAttribute("src"),
        ).toBe(settings.addresses[1]!.mapEmbedUrl);
        const data = JSON.parse(
          document.querySelector('script[type="application/ld+json"]')!.textContent!,
        );
        expect(data.mainEntity.location.map((location: { name: string }) => location.name)).toEqual(
          [firstName, secondName],
        );
      }
    },
  );

  it("keeps the second branch's numbered map label when the first branch has no map", async () => {
    settings.addresses[1]!.mapEmbedUrl = "https://www.google.com/maps/embed?pb=second";
    renderContact(await ContactPage({ params: Promise.resolve({ locale: "en" }) }));
    expect(screen.getByTitle("Address 2 — Location on map").getAttribute("src")).toBe(
      settings.addresses[1]!.mapEmbedUrl,
    );
    expect(screen.queryByTitle("Address 1 — Location on map")).toBeNull();
  });

  it("keeps each footer branch collapsed until opened, independently", async () => {
    renderContact(await SiteFooter());
    const [first, second] = footerBranchTriggers();
    expect(first!.getAttribute("aria-expanded")).toBe("false");
    expect(second!.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("group", { name: "Address 1" })).toBeNull();

    fireEvent.click(first!);

    expect(first!.getAttribute("aria-expanded")).toBe("true");
    expect(second!.getAttribute("aria-expanded")).toBe("false");
    expect(screen.getByRole("group", { name: "Address 1" })).toBeTruthy();
    expect(screen.queryByRole("group", { name: "Address 2" })).toBeNull();

    fireEvent.click(second!);

    expect(second!.getAttribute("aria-expanded")).toBe("true");
    expect(screen.getByRole("group", { name: "Address 2" })).toBeTruthy();
  });

  it("shows branch numbers under their own addresses in the footer and preserves the tagline", async () => {
    renderContact(await SiteFooter());
    openFooterBranches();
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

  it.each([false, true])(
    "keeps branch phone lines compact like postal codes (compact=%s)",
    (compact) => {
      render(
        <BranchPhoneNumbers
          phones={["021 11111111", "09120000000"]}
          isFa={false}
          compact={compact}
        />,
      );
      const links = screen.getAllByRole("link");
      expect(links).toHaveLength(2);
      links.forEach((link) => {
        expect(link.classList.contains("block")).toBe(true);
        expect(link.classList.contains("min-h-11")).toBe(false);
        expect(link.classList.contains("text-sm")).toBe(true);
        expect(link.classList.contains("focus-visible:ring-2")).toBe(true);
      });
    },
  );

  it("hides an empty branch-phone section", () => {
    const { container } = render(<BranchPhoneNumbers phones={[]} isFa={false} />);
    expect(container.childElementCount).toBe(0);
  });
});
