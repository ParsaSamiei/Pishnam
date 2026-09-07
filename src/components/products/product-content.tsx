import Image from "next/image";
import { GraduationCap } from "lucide-react";
import { pickLocaleField } from "@/lib/i18n/pick";
import type { AppLocale } from "@/lib/i18n/routing";
import { Link } from "@/lib/i18n/navigation";
import { formatProductPrice } from "@/lib/format";
import { RichText } from "@/components/rich-text";
import { CoursePhotos } from "@/components/courses/course-photos";
import { VideoEmbedCard } from "@/components/home/video-embed-card";
import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type ProductDetail = {
  slug: string;
  image: string;
  titleFa: string;
  titleEn: string;
  excerptFa: string | null;
  excerptEn: string | null;
  bodyFa: string | null;
  bodyEn: string | null;
  price: number | null;
  currencyFa: string | null;
  currencyEn: string | null;
  tags: { nameFa: string; nameEn: string; slug: string }[];
  images: {
    id: string;
    image: string;
    captionFa: string | null;
    captionEn: string | null;
  }[];
  videos: {
    id: string;
    titleFa: string;
    titleEn: string;
    aparatUrl: string | null;
    hostedVideo: string | null;
    thumbnail: string | null;
  }[];
  specs: {
    id: string;
    keyFa: string;
    keyEn: string;
    valueFa: string;
    valueEn: string;
  }[];
  course: {
    slug: string;
    titleFa: string;
    titleEn: string;
  } | null;
};

interface ProductContentProps {
  product: ProductDetail;
  locale: AppLocale;
}

export function ProductContent({ product, locale }: ProductContentProps) {
  const isFa = locale === "fa";
  const title = pickLocaleField(product.titleFa, product.titleEn, locale);
  const excerpt = pickLocaleField(product.excerptFa, product.excerptEn, locale);
  const body = pickLocaleField(product.bodyFa, product.bodyEn, locale);
  const price = formatProductPrice(
    product.price,
    locale,
    pickLocaleField(product.currencyFa, product.currencyEn, locale),
  );

  const photos = product.images.map((img) => {
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
    product.specs.length > 0 ? { id: "specs", label: isFa ? "مشخصات" : "Specs" } : null,
    product.videos.length > 0 ? { id: "videos", label: isFa ? "ویدیو" : "Videos" } : null,
    photos.length > 0 ? { id: "photos", label: isFa ? "عکس‌ها" : "Photos" } : null,
  ].filter((section): section is { id: string; label: string } => section !== null);

  return (
    <>
      <div className="bg-pishnam-navy-900 relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(230,168,23,0.35), transparent 45%), radial-gradient(circle at 80% 70%, rgba(59,94,130,0.45), transparent 40%)",
          }}
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-center lg:px-8 lg:py-16">
          <div>
            {product.tags.length > 0 ? (
              <p className="text-pishnam-gold-500 text-xs font-semibold tracking-[0.18em] uppercase">
                {product.tags
                  .map((tag) => pickLocaleField(tag.nameFa, tag.nameEn, locale))
                  .join(" · ")}
              </p>
            ) : null}
            <h1 className="text-pishnam-off-white mt-3 text-3xl font-extrabold sm:text-4xl">
              {title}
            </h1>
            {excerpt ? (
              <p className="text-pishnam-off-white/75 mt-3 max-w-xl text-sm leading-relaxed sm:text-base">
                {excerpt}
              </p>
            ) : null}
            {price ? <p className="text-pishnam-gold-500 mt-5 text-lg font-bold">{price}</p> : null}
            {product.course ? (
              <div className="mt-6">
                <Button asChild variant="secondary" className="cursor-pointer">
                  <Link href={`/courses/${product.course.slug}`}>
                    <GraduationCap className="size-4" aria-hidden="true" />
                    {isFa
                      ? `دوره مرتبط: ${product.course.titleFa}`
                      : `Related course: ${product.course.titleEn}`}
                  </Link>
                </Button>
              </div>
            ) : null}
          </div>

          <div className="border-pishnam-gold-500/20 bg-pishnam-navy-800/50 relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-2xl border">
            <Image
              src={product.image}
              alt=""
              fill
              className="object-contain p-8"
              sizes="(min-width: 1024px) 420px, 90vw"
              priority
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {sections.length > 1 ? (
          <nav aria-label={isFa ? "بخش‌های صفحه" : "On this page"} className="flex flex-wrap gap-2">
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

        {product.specs.length > 0 ? (
          <section id="specs" className="mt-10 scroll-mt-24" aria-labelledby="product-specs">
            <Reveal from="start">
              <h2 id="product-specs" className="text-text-primary text-lg font-bold">
                {isFa ? "مشخصات فنی" : "Specifications"}
              </h2>
            </Reveal>
            <div className="border-border mt-4 overflow-hidden rounded-xl border">
              <table className="w-full text-sm">
                <tbody>
                  {product.specs.map((spec, index) => (
                    <tr
                      key={spec.id}
                      className={cn(
                        "border-border border-b last:border-b-0",
                        index % 2 === 0 ? "bg-bg-surface" : "bg-bg-surface-alt/60",
                      )}
                    >
                      <th
                        scope="row"
                        className="text-text-secondary w-[40%] px-4 py-3 text-start font-medium"
                      >
                        {pickLocaleField(spec.keyFa, spec.keyEn, locale)}
                      </th>
                      <td className="text-text-primary px-4 py-3">
                        {pickLocaleField(spec.valueFa, spec.valueEn, locale)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {product.videos.length > 0 ? (
          <section id="videos" className="mt-10 scroll-mt-24" aria-labelledby="product-videos">
            <Reveal from="start">
              <h2 id="product-videos" className="text-text-primary text-lg font-bold">
                {isFa ? "ویدیو" : "Videos"}
              </h2>
            </Reveal>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2">
              {product.videos.map((video) => (
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
      </div>
    </>
  );
}
