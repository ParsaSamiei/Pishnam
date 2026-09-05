import { Download, ExternalLink, FileText } from "lucide-react";
import { formatFileSize } from "@/lib/format";
import { Reveal } from "@/components/motion/reveal";

export type CourseDocumentView = {
  id: string;
  title: string;
  description: string | null;
  fileUrl: string;
  source: "HOSTED" | "EXTERNAL";
  fileSizeBytes: number | null;
};

interface CourseDocumentsProps {
  documents: CourseDocumentView[];
  title: string;
  downloadLabel: string;
  openLabel: string;
}

export function CourseDocuments({
  documents,
  title,
  downloadLabel,
  openLabel,
}: CourseDocumentsProps) {
  if (documents.length === 0) return null;

  return (
    <section className="mt-10" aria-labelledby="course-documents-heading">
      <Reveal from="start">
        <h2 id="course-documents-heading" className="text-text-primary text-lg font-bold">
          {title}
        </h2>
      </Reveal>

      <ul className="divide-border border-border mt-4 divide-y rounded-xl border">
        {documents.map((doc, index) => {
          const isExternal = doc.source === "EXTERNAL";
          const actionLabel = isExternal ? openLabel : downloadLabel;

          return (
            <Reveal key={doc.id} delay={0.05 * index} as="li">
              <a
                href={doc.fileUrl}
                target={isExternal ? "_blank" : undefined}
                rel={isExternal ? "noopener noreferrer" : undefined}
                download={!isExternal ? true : undefined}
                className="hover:bg-bg-surface-alt focus-visible:ring-pishnam-gold-500 group flex cursor-pointer items-start gap-3 px-4 py-3.5 transition-colors duration-200 ease-out focus-visible:ring-2 focus-visible:outline-none focus-visible:ring-inset"
              >
                <span className="bg-pishnam-navy-900/5 text-pishnam-navy-900 group-hover:bg-pishnam-gold-500/15 group-hover:text-pishnam-gold-600 mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors duration-200">
                  <FileText className="size-5" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="text-text-primary block text-sm font-semibold">{doc.title}</span>
                  {doc.description && (
                    <span className="text-text-secondary mt-0.5 block text-xs leading-relaxed">
                      {doc.description}
                    </span>
                  )}
                  {!isExternal && doc.fileSizeBytes ? (
                    <span className="text-text-secondary mt-1 block text-xs">
                      {formatFileSize(doc.fileSizeBytes)}
                    </span>
                  ) : null}
                </span>
                <span className="text-pishnam-steel-600 group-hover:text-pishnam-gold-600 mt-1 flex shrink-0 items-center gap-1.5 text-xs font-semibold transition-colors duration-200">
                  {actionLabel}
                  {isExternal ? (
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                  ) : (
                    <Download className="size-3.5" aria-hidden="true" />
                  )}
                </span>
              </a>
            </Reveal>
          );
        })}
      </ul>
    </section>
  );
}
