import { beforeEach, describe, expect, it, vi } from "vitest";
import { updateContactSettings } from "./actions";

const mocks = vi.hoisted(() => ({
  upsert: vi.fn(),
  requireAdminSession: vi.fn(),
  updateTag: vi.fn(),
  revalidatePath: vi.fn(),
  redirect: vi.fn(() => {
    throw new Error("redirect");
  }),
}));

vi.mock("@/lib/prisma", () => ({ prisma: { contactSettings: { upsert: mocks.upsert } } }));
vi.mock("@/lib/actions/admin-guard", () => ({ requireAdminSession: mocks.requireAdminSession }));
vi.mock("@/lib/contact-settings", () => ({
  CONTACT_SETTINGS_ID: "default",
  CONTACT_SETTINGS_CACHE_TAG: "contact-settings",
}));
vi.mock("next/cache", () => ({ updateTag: mocks.updateTag, revalidatePath: mocks.revalidatePath }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));

function contactForm(branches: Array<{ address: string; phones: string[] }>) {
  const data = new FormData();
  data.append("phones", "09120000000");
  data.append("footerTaglineFa", "متن فوتر");
  data.append("footerTaglineEn", "Footer tagline");
  branches.forEach((branch, index) => {
    data.append("addressFa", branch.address);
    data.append("addressEn", "");
    data.append("postalCode", "");
    data.append("mapEmbedUrl", "");
    branch.phones.forEach((phone) => data.append(`addressPhones.${index}`, phone));
  });
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireAdminSession.mockResolvedValue({ user: { id: "admin" } });
  mocks.upsert.mockResolvedValue({});
});

describe("updateContactSettings branch phones", () => {
  it("saves each branch's numbers independently and invalidates the shared cache", async () => {
    const data = contactForm([
      { address: "تهران", phones: ["۰۲۱۱۱۱۱۱۱۱۱"] },
      { address: "شیراز", phones: ["07122222222", "09121111111"] },
    ]);
    await expect(updateContactSettings({ status: "idle" }, data)).rejects.toThrow("redirect");

    const write = mocks.upsert.mock.calls[0]![0];
    expect(write.update.phones).toEqual(["09120000000"]);
    expect(write.update.footerTaglineEn).toBe("Footer tagline");
    expect(write.update.addresses.deleteMany).toEqual({});
    expect(write.update.addresses.create).toEqual([
      {
        addressFa: "تهران",
        addressEn: null,
        postalCode: null,
        mapEmbedUrl: null,
        phones: ["021 11111111"],
        order: 0,
      },
      {
        addressFa: "شیراز",
        addressEn: null,
        postalCode: null,
        mapEmbedUrl: null,
        phones: ["071 22222222", "09121111111"],
        order: 1,
      },
    ]);
    expect(write.create.addresses.create).toEqual(write.update.addresses.create);
    expect(mocks.updateTag).toHaveBeenCalledWith("contact-settings");
    expect(mocks.redirect).toHaveBeenCalledWith("/admin/contact?saved=1");
  });

  it("keeps the original row association when an empty branch is omitted", async () => {
    const data = contactForm([
      { address: "", phones: [""] },
      { address: "شیراز", phones: ["07122222222"] },
    ]);
    await expect(updateContactSettings({ status: "idle" }, data)).rejects.toThrow("redirect");
    expect(mocks.upsert.mock.calls[0]![0].update.addresses.create).toEqual([
      expect.objectContaining({ addressFa: "شیراز", phones: ["071 22222222"], order: 0 }),
    ]);
  });

  it("saves an empty phone list when a branch's number is cleared", async () => {
    const data = contactForm([{ address: "تهران", phones: [""] }]);
    await expect(updateContactSettings({ status: "idle" }, data)).rejects.toThrow("redirect");
    expect(mocks.upsert.mock.calls[0]![0].update.addresses.create[0].phones).toEqual([]);
  });

  it("preserves all submitted numbers and reports errors under the correct branch", async () => {
    const data = contactForm([
      { address: "تهران", phones: ["02111111111"] },
      { address: "شیراز", phones: ["invalid", "09121111111"] },
    ]);
    const state = await updateContactSettings({ status: "idle" }, data);
    expect(state.status).toBe("error");
    expect(state.errors?.["addresses.1.phones.0"]).toContain("شماره تلفن معتبر نیست");
    expect(state.values?.["addressPhones.0"]).toBe("02111111111");
    expect(JSON.parse(state.values!["addressPhones.1"]!)).toEqual(["invalid", "09121111111"]);
    expect(mocks.upsert).not.toHaveBeenCalled();
    expect(mocks.updateTag).not.toHaveBeenCalled();
  });

  it("keeps general-phone validation errors at the field key the form displays", async () => {
    const data = contactForm([]);
    data.set("phones", "invalid");
    const state = await updateContactSettings({ status: "idle" }, data);
    expect(state.errors?.phones).toContain("شماره تلفن معتبر نیست");
    expect(mocks.upsert).not.toHaveBeenCalled();
  });

  it("checks admin authorization before any write", async () => {
    mocks.requireAdminSession.mockRejectedValueOnce(new Error("Unauthorized"));
    await expect(updateContactSettings({ status: "idle" }, contactForm([]))).rejects.toThrow(
      "Unauthorized",
    );
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
});
