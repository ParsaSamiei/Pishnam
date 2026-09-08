"use client";

import type { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import {
  TranslateToEnButton,
  type TranslateToEnButtonProps,
} from "@/components/admin/translate-to-en-button";
import { cn } from "@/lib/utils";

type EnFieldLabelProps = {
  children: ReactNode;
  htmlFor?: string;
  className?: string;
} & Pick<
  TranslateToEnButtonProps,
  "sourceName" | "targetName" | "format" | "getSourceText" | "getTargetText" | "onTranslated"
>;

/**
 * English-field label with a compact "ترجمه" control that fills the EN value
 * from the matching Persian field.
 */
export function EnFieldLabel({
  children,
  htmlFor,
  className,
  sourceName,
  targetName,
  format,
  getSourceText,
  getTargetText,
  onTranslated,
}: EnFieldLabelProps) {
  const resolvedTarget = targetName ?? htmlFor;

  return (
    <div className={cn("flex items-center justify-between gap-2", className)}>
      <Label htmlFor={htmlFor}>{children}</Label>
      <TranslateToEnButton
        sourceName={sourceName}
        targetName={resolvedTarget}
        format={format}
        getSourceText={getSourceText}
        getTargetText={getTargetText}
        onTranslated={onTranslated}
      />
    </div>
  );
}
