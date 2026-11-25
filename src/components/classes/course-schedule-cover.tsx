"use client";

import { useState } from "react";
import Image from "next/image";
import { GraduationCap } from "lucide-react";

/** Keep the existing cover URL, falling back to the normal course placeholder. */
export function CourseScheduleCover({ src }: { src: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="text-text-secondary flex h-full items-center justify-center">
        <GraduationCap className="size-8" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt=""
      fill
      className="object-contain"
      sizes="(min-width: 1024px) 480px, (min-width: 640px) 50vw, 100vw"
      onError={() => setFailed(true)}
    />
  );
}
