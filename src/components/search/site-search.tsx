"use client";

import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  BookOpen,
  Briefcase,
  CalendarDays,
  Cpu,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  HelpCircle,
  ImageIcon,
  Medal,
  Newspaper,
  Play,
  Radio,
  Search,
  Trophy,
  Users,
  X,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link, useRouter } from "@/lib/i18n/navigation";
import { filterAndGroupSearchHits } from "@/lib/search/match";
import type { SearchHit, SearchKind } from "@/lib/search/types";
import { cn } from "@/lib/utils";

const KIND_LABEL_KEYS: Record<SearchKind, `kinds.${SearchKind}`> = {
  page: "kinds.page",
  course: "kinds.course",
  class: "kinds.class",
  software: "kinds.software",
  datasheet: "kinds.datasheet",
  download: "kinds.download",
  poster: "kinds.poster",
  video: "kinds.video",
  article: "kinds.article",
  team: "kinds.team",
  achievement: "kinds.achievement",
  faq: "kinds.faq",
  job: "kinds.job",
  press: "kinds.press",
  gallery: "kinds.gallery",
};

const KIND_ICONS: Record<SearchKind, typeof Search> = {
  page: FileText,
  course: GraduationCap,
  class: CalendarDays,
  software: Download,
  datasheet: Cpu,
  download: BookOpen,
  poster: Trophy,
  video: Play,
  article: Newspaper,
  team: Users,
  achievement: Medal,
  faq: HelpCircle,
  job: Briefcase,
  press: Radio,
  gallery: ImageIcon,
};

type IndexCache = { hits: SearchHit[]; fetchedAt: number };
const indexCache = new Map<string, IndexCache>();
const CACHE_TTL_MS = 60_000;

function isLocalImage(src: string | null): src is string {
  return Boolean(src?.startsWith("/"));
}

function isMacPlatform(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad/.test(navigator.platform) || navigator.userAgent.includes("Mac");
}

function subscribeMac() {
  return () => {};
}

function getMacShortcut() {
  return isMacPlatform() ? "⌘K" : "Ctrl+K";
}

function getMacShortcutServer() {
  return "Ctrl+K";
}

export function SiteSearch({
  triggerClassName,
  open: openProp,
  onOpenChange,
}: {
  triggerClassName?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  const t = useTranslations("search");
  const tNav = useTranslations("nav");
  const locale = useLocale();
  const router = useRouter();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = openProp ?? uncontrolledOpen;
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<SearchHit[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [activeIndex, setActiveIndex] = useState(0);
  const shortcutLabel = useSyncExternalStore(subscribeMac, getMacShortcut, getMacShortcutServer);
  const inputRef = useRef<HTMLInputElement>(null);
  const listId = useId();

  const loadIndex = useCallback(
    async (force = false) => {
      const cached = indexCache.get(locale);
      if (!force && cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        setHits(cached.hits);
        setActiveIndex(0);
        setStatus("idle");
        return;
      }

      setStatus("loading");
      try {
        const response = await fetch(`/api/search?locale=${locale}`);
        if (!response.ok) throw new Error("search failed");
        const data = (await response.json()) as { hits: SearchHit[] };
        indexCache.set(locale, { hits: data.hits, fetchedAt: Date.now() });
        setHits(data.hits);
        setActiveIndex(0);
        setStatus("idle");
      } catch {
        setStatus("error");
      }
    },
    [locale],
  );

  const handleOpenChange = useCallback(
    (next: boolean) => {
      onOpenChange?.(next);
      if (openProp === undefined) setUncontrolledOpen(next);
    },
    [onOpenChange, openProp],
  );

  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      setQuery("");
      setActiveIndex(0);
      void loadIndex();
    });
    return () => cancelAnimationFrame(frame);
  }, [loadIndex, open]);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        handleOpenChange(!open);
        return;
      }
      if (event.key === "/" && !open) {
        const target = event.target;
        if (target instanceof HTMLElement) {
          const tag = target.tagName;
          if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT" ||
            target.isContentEditable
          ) {
            return;
          }
        }
        event.preventDefault();
        handleOpenChange(true);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleOpenChange, open]);

  const groups = useMemo(() => filterAndGroupSearchHits(hits, query), [hits, query]);
  const flatHits = useMemo(() => groups.flatMap((group) => group.hits), [groups]);
  const indexById = useMemo(() => {
    const map = new Map<string, number>();
    flatHits.forEach((item, index) => map.set(item.id, index));
    return map;
  }, [flatHits]);
  const total = flatHits.length;

  useEffect(() => {
    document.getElementById(`${listId}-${activeIndex}`)?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, listId]);

  const goToHit = useCallback(
    (item: SearchHit) => {
      handleOpenChange(false);
      if (item.external) {
        window.open(item.href, "_blank", "noopener,noreferrer");
        return;
      }
      router.push(item.href);
    },
    [handleOpenChange, router],
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`${tNav("search")} (${shortcutLabel})`}
        aria-haspopup="dialog"
        aria-expanded={open}
        className={triggerClassName}
        onClick={() => handleOpenChange(true)}
      >
        <Search aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          hideClose
          className={cn(
            "inset-x-3 top-[max(0.75rem,6dvh)] mx-auto flex h-auto w-auto max-w-none translate-y-0 flex-col gap-0 overflow-hidden p-0",
            "sm:inset-x-auto sm:max-w-xl",
            "max-h-[min(40rem,88dvh)]",
          )}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            inputRef.current?.focus();
          }}
        >
          <DialogHeader className="sr-only">
            <DialogTitle>{t("title")}</DialogTitle>
            <DialogDescription>{t("description")}</DialogDescription>
          </DialogHeader>

          <form
            role="search"
            className="border-border flex items-center gap-2 border-b px-3"
            onSubmit={(event) => {
              event.preventDefault();
              const item = flatHits[activeIndex];
              if (item) goToHit(item);
            }}
          >
            <Search className="text-pishnam-gold-600 size-4 shrink-0" aria-hidden="true" />
            <input
              ref={inputRef}
              type="text"
              inputMode="search"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
              }}
              placeholder={t("placeholder")}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              role="combobox"
              aria-autocomplete="list"
              aria-controls={listId}
              aria-expanded="true"
              aria-activedescendant={flatHits[activeIndex] ? `${listId}-${activeIndex}` : undefined}
              className="text-text-primary placeholder:text-text-secondary min-h-12 min-w-0 flex-1 bg-transparent text-base outline-none"
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActiveIndex((index) => (total === 0 ? 0 : (index + 1) % total));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActiveIndex((index) => (total === 0 ? 0 : (index - 1 + total) % total));
                } else if (event.key === "Home") {
                  event.preventDefault();
                  setActiveIndex(0);
                } else if (event.key === "End") {
                  event.preventDefault();
                  setActiveIndex(Math.max(0, total - 1));
                }
              }}
            />
            <kbd
              dir="ltr"
              className="border-border text-text-secondary hidden rounded-md border px-1.5 py-0.5 font-sans text-[10px] tracking-wide sm:inline-flex"
            >
              {shortcutLabel}
            </kbd>
            <button
              type="button"
              onClick={() => handleOpenChange(false)}
              className="text-text-secondary hover:text-text-primary hover:bg-pishnam-gold-500/12 flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md transition-colors duration-200"
              aria-label={t("close")}
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </form>
          <div className="bg-pishnam-gold-500 h-0.5 w-full" aria-hidden="true" />

          <div
            id={listId}
            role="listbox"
            aria-label={t("results")}
            className="min-h-0 flex-1 overflow-y-auto px-2 py-2"
          >
            {status === "loading" && hits.length === 0 ? (
              <div className="flex flex-col gap-2 px-2 py-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : status === "error" ? (
              <div className="text-text-secondary px-3 py-8 text-center text-sm">
                <p>{t("error")}</p>
                <button
                  type="button"
                  className="text-pishnam-gold-600 mt-3 cursor-pointer font-medium underline-offset-2 hover:underline"
                  onClick={() => void loadIndex(true)}
                >
                  {t("retry")}
                </button>
              </div>
            ) : total === 0 ? (
              <p className="text-text-secondary px-3 py-8 text-center text-sm" role="status">
                {t("empty")}
              </p>
            ) : (
              groups.map((group) => (
                <section key={group.kind} className="mb-3 last:mb-0">
                  <h2 className="text-pishnam-steel-600 px-2 py-1.5 text-xs font-semibold">
                    {t(KIND_LABEL_KEYS[group.kind])}
                  </h2>
                  <ul className="flex flex-col gap-0.5">
                    {group.hits.map((item) => {
                      const index = indexById.get(item.id) ?? 0;
                      const active = index === activeIndex;
                      const Icon = KIND_ICONS[item.kind];
                      const content = (
                        <>
                          <span
                            className={cn(
                              "bg-bg-surface-alt text-pishnam-steel-600 flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg",
                              active && "ring-pishnam-gold-500/40 ring-2",
                            )}
                          >
                            {isLocalImage(item.image) ? (
                              <Image
                                src={item.image}
                                alt=""
                                width={36}
                                height={36}
                                className="size-9 object-cover"
                              />
                            ) : (
                              <Icon className="size-4" aria-hidden="true" />
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="text-text-primary block truncate text-sm font-medium">
                              {item.title}
                            </span>
                            {item.subtitle ? (
                              <span className="text-text-secondary mt-0.5 block truncate text-xs">
                                {item.subtitle}
                              </span>
                            ) : null}
                          </span>
                          {item.external ? (
                            <ExternalLink
                              className="text-text-secondary size-3.5 shrink-0 opacity-70"
                              aria-hidden="true"
                            />
                          ) : null}
                        </>
                      );

                      const className = cn(
                        "relative flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-lg px-2 py-1.5 text-start",
                        "transition-colors duration-200",
                        active
                          ? "bg-pishnam-gold-500/14 before:bg-pishnam-gold-500 before:absolute before:inset-s-0 before:my-1.5 before:w-0.5 before:rounded-full"
                          : "hover:bg-pishnam-gold-500/10",
                      );

                      return (
                        <li key={item.id} role="none">
                          {item.external ? (
                            <a
                              id={`${listId}-${index}`}
                              role="option"
                              aria-selected={active}
                              href={item.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={className}
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => handleOpenChange(false)}
                            >
                              {content}
                            </a>
                          ) : (
                            <Link
                              id={`${listId}-${index}`}
                              role="option"
                              aria-selected={active}
                              href={item.href}
                              className={className}
                              onMouseEnter={() => setActiveIndex(index)}
                              onClick={() => handleOpenChange(false)}
                            >
                              {content}
                            </Link>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </section>
              ))
            )}
          </div>

          <div className="border-border text-text-secondary flex items-center justify-between gap-3 border-t px-3 py-2 text-xs">
            <span aria-live="polite">
              {status === "loading" && hits.length === 0
                ? t("loading")
                : t("count", { count: total })}
            </span>
            <span className="hidden sm:inline">{t("hint")}</span>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
