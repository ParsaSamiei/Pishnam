import Image from "next/image";
import type { ReactNode } from "react";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import type { DatasheetPartWithContent } from "@/lib/datasheet-parts";
import { RichText } from "@/components/rich-text";
import { CourseDocuments } from "@/components/courses/course-documents";
import { CoursePhotos } from "@/components/courses/course-photos";
import { VideoEmbedCard } from "@/components/home/video-embed-card";
import { DatasheetCodeBlock } from "@/components/datasheets/datasheet-code-block";
import { DatasheetSpecStrip } from "@/components/datasheets/datasheet-spec-strip";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

interface DatasheetContentProps {
  part: DatasheetPartWithContent;
  locale: AppLocale;
  eyebrow: string;
  children?: ReactNode;
}

export function DatasheetContent({ part, locale, eyebrow, children }: DatasheetContentProps) {
  const isFa = locale === "fa";
  const title = pickLocaleField(part.titleFa, part.titleEn, locale);
  const excerpt = pickLocaleField(part.excerptFa, part.excerptEn, locale);
  const body = pickLocaleField(part.bodyFa, part.bodyEn, locale);

  const documents = part.documents.map((doc) => ({
    id: doc.id,
    title: pickLocaleField(doc.titleFa, doc.titleEn, locale),
    description: pickLocaleField(doc.descriptionFa, doc.descriptionEn, locale),
    fileUrl: doc.fileUrl,
    source: doc.source,
    fileSizeBytes: doc.fileSizeBytes,
  }));

  const photos = part.images.map((img) => {
    const caption = pickLocaleField(img.captionFa, img.captionEn, locale);
    return {
      id: img.id,
      image: img.image,
      caption,
      alt: caption || title,
    };
  });

  const sections = [
    body ? { id: "overview", label: isFa ? "معرفی" : "Overview" } : null,
    documents.length > 0 ? { id: "files", label: isFa ? "فایل‌ها" : "Files" } : null,
    part.videos.length > 0 ? { id: "videos", label: isFa ? "ویدیو" : "Videos" } : null,
    photos.length > 0 ? { id: "photos", label: isFa ? "عکس‌ها" : "Photos" } : null,
    part.codeSamples.length > 0 ? { id: "code", label: isFa ? "کد" : "Code" } : null,
  ].filter((section): section is { id: string; label: string } => section !== null);

  const meta = [
    documents.length ? (isFa ? `${documents.length} فایل` : `${documents.length} files`) : null,
    part.videos.length
      ? isFa
        ? `${part.videos.length} ویدیو`
        : `${part.videos.length} videos`
      : null,
    photos.length ? (isFa ? `${photos.length} عکس` : `${photos.length} photos`) : null,
    part.codeSamples.length
      ? isFa
        ? `${part.codeSamples.length} نمونه کد`
        : `${part.codeSamples.length} samples`
      : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <>
      <div className="bg-pishnam-navy-900 relative h-56 w-full sm:h-72">
        <Image
          src={part.image}
          alt=""
          fill
          className="object-contain p-10 opacity-80 sm:p-16"
          sizes="100vw"
          priority
        />
        <div className="from-pishnam-navy-900 via-pishnam-navy-900/50 absolute inset-0 flex items-end bg-linear-to-t to-transparent">
          <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            <h1 className="text-pishnam-off-white text-2xl font-extrabold sm:text-3xl">{title}</h1>
            {excerpt ? (
              <p className="text-pishnam-off-white/75 mt-2 max-w-2xl text-sm">{excerpt}</p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <DatasheetSpecStrip slug={part.slug} eyebrow={eyebrow} meta={meta} />

        {children}

        {sections.length > 1 ? (
          <nav
            aria-label={isFa ? "بخش‌های صفحه" : "On this page"}
            className="mt-6 flex flex-wrap gap-2"
          >
            {sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={cn(
                  "border-border text-text-secondary hover:border-pishnam-gold-500 hover:text-pishnam-gold-600",
                  "focus-visible:ring-pishnam-gold-500 inline-flex min-h-11 cursor-pointer items-center rounded-full border px-3 text-xs font-semibold tracking-wide uppercase transition-colors duration-200 focus-visible:ring-2 focus-visible:outline-none",
                )}
              >
                {section.label}
              </a>
            ))}
          </nav>
        ) : null}

        {body ? (
          <section id="overview" className="mt-10 scroll-mt-24">
            <RichText html={body} />
          </section>
        ) : null}

        {part.videos.length > 0 ? (
          <section id="videos" className="mt-10 scroll-mt-24" aria-labelledby="datasheet-videos">
            <Reveal from="start">
              <h2 id="datasheet-videos" className="text-text-primary text-lg font-bold">
                {isFa ? "ویدیو" : "Videos"}
              </h2>
            </Reveal>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {part.videos.map((video) => (
                <li key={video.id}>
                  <VideoEmbedCard
                    title={pickLocaleField(video.titleFa, video.titleEn, locale)}
                    aparatUrl={video.aparatUrl}
                    hostedVideo={video.hostedVideo}
                    thumbnail={video.thumbnail}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <div id="photos">
          <CoursePhotos photos={photos} title={isFa ? "عکس‌ها" : "Photos"} />
        </div>

        <div id="files">
          <CourseDocuments
            documents={documents}
            title={isFa ? "دیتاشیت و فایل‌ها" : "Datasheets & files"}
            downloadLabel={isFa ? "دانلود" : "Download"}
            openLabel={isFa ? "باز کردن" : "Open"}
          />
        </div>

        {part.codeSamples.length > 0 ? (
          <section id="code" className="mt-10 scroll-mt-24" aria-labelledby="datasheet-code">
            <Reveal from="start">
              <h2 id="datasheet-code" className="text-text-primary text-lg font-bold">
                {isFa ? "نمونه کد" : "Example code"}
              </h2>
            </Reveal>
            <ul className="mt-4 flex flex-col gap-4">
              {part.codeSamples.map((sample) => (
                <li key={sample.id}>
                  <DatasheetCodeBlock
                    title={pickLocaleField(sample.titleFa, sample.titleEn, locale)}
                    language={sample.language}
                    code={sample.code}
                    notes={pickLocaleField(sample.notesFa, sample.notesEn, locale)}
                    fileUrl={sample.fileUrl}
                    fileSource={sample.source}
                    fileSizeBytes={sample.fileSizeBytes}
                    downloadLabel={isFa ? "دانلود فایل" : "Download file"}
                    copyLabel={isFa ? "کپی" : "Copy"}
                    copiedLabel={isFa ? "کپی شد" : "Copied"}
                  />
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </>
  );
}
