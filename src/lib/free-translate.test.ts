import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

describe("translateFaToEn", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("calls MyMemory and returns translated text", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        responseStatus: 200,
        responseData: { translatedText: "Hello world" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { translateFaToEn } = await import("./free-translate");
    await expect(translateFaToEn("سلام دنیا")).resolves.toBe("Hello world");

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0] as [string];
    const parsed = new URL(url);
    expect(parsed.origin + parsed.pathname).toBe("https://api.mymemory.translated.net/get");
    expect(parsed.searchParams.get("q")).toBe("سلام دنیا");
    expect(parsed.searchParams.get("langpair")).toBe("fa|en");
  });

  it("sends optional email for higher free quota", async () => {
    vi.stubEnv("MYMEMORY_EMAIL", "editor@example.com");
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        responseStatus: 200,
        responseData: { translatedText: "Hi" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { translateFaToEn } = await import("./free-translate");
    await translateFaToEn("سلام");

    const [url] = fetchMock.mock.calls[0] as [string];
    expect(new URL(url).searchParams.get("de")).toBe("editor@example.com");
  });

  it("preserves HTML tags while translating", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        responseStatus: 200,
        responseData: { translatedText: "⟦T0⟧Hello⟦T1⟧" },
      }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { translateFaToEn } = await import("./free-translate");
    await expect(translateFaToEn("<p>سلام</p>", "html")).resolves.toBe("<p>Hello</p>");
  });

  it("rejects empty source text", async () => {
    const { translateFaToEn, TranslateError } = await import("./free-translate");
    await expect(translateFaToEn("   ")).rejects.toBeInstanceOf(TranslateError);
  });
});
