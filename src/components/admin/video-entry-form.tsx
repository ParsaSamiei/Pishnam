"use client";

import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  VideoEntrySourceFields,
  type VideoEntrySource,
} from "@/components/admin/video-entry-source-fields";
import { TIERS, TIER_LABELS } from "@/lib/tier-labels";
import type { VideoEntryFormState } from "@/app/admin/(dashboard)/videos/actions";

interface VideoEntryFormProps {
  action: (prevState: VideoEntryFormState, formData: FormData) => Promise<VideoEntryFormState>;
  defaultValues?: {
    titleFa: string;
    titleEn: string;
    aparatUrl: string | null;
    hostedVideo: string | null;
    thumbnail: string | null;
    tierTags: string[];
    topicTags: string[];
    publishedAt: Date;
  };
  submitLabel: string;
}

const initialState: VideoEntryFormState = { status: "idle" };

export function VideoEntryForm({ action, defaultValues, submitLabel }: VideoEntryFormProps) {
  const { state, formAction, isPending, formKey, field, multiValueField } = usePreservedFormAction(
    action,
    initialState,
  );

  const tierTags = multiValueField("tierTags", defaultValues?.tierTags ?? []);
  const inferredSource: VideoEntrySource = defaultValues?.hostedVideo ? "hosted" : "aparat";

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titleFa">عنوان (فارسی) *</Label>
          <Input
            id="titleFa"
            name="titleFa"
            defaultValue={field("titleFa", defaultValues?.titleFa)}
            required
            aria-invalid={Boolean(state.errors?.titleFa)}
          />
          {state.errors?.titleFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.titleFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titleEn">Title (English) *</Label>
          <Input
            id="titleEn"
            name="titleEn"
            dir="ltr"
            defaultValue={field("titleEn", defaultValues?.titleEn)}
            required
            aria-invalid={Boolean(state.errors?.titleEn)}
          />
          {state.errors?.titleEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.titleEn}</p>
          )}
        </div>
      </div>

      <VideoEntrySourceFields
        defaultSource={field("videoSource", inferredSource) as VideoEntrySource}
        aparatUrl={field("aparatUrl", defaultValues?.aparatUrl ?? "")}
        hostedVideo={field("hostedVideo", defaultValues?.hostedVideo ?? "")}
        thumbnail={field("thumbnail", defaultValues?.thumbnail ?? "")}
        errors={{
          videoSource: state.errors?.videoSource,
          aparatUrl: state.errors?.aparatUrl,
          hostedVideo: state.errors?.hostedVideo,
          thumbnail: state.errors?.thumbnail,
        }}
      />

      <div className="flex flex-col gap-1.5">
        <span className="text-text-primary text-sm font-medium">مقاطع مرتبط</span>
        <div className="flex flex-wrap gap-3">
          {TIERS.map((tierValue) => (
            <label key={tierValue} className="text-text-primary flex items-center gap-1.5 text-sm">
              <input
                type="checkbox"
                name="tierTags"
                value={tierValue}
                defaultChecked={tierTags.includes(tierValue)}
                className="border-border accent-pishnam-gold-500 size-4 rounded"
              />
              {TIER_LABELS.fa[tierValue]}
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="topicTags">برچسب‌های موضوعی (با کاما جدا کنید)</Label>
        <Input
          id="topicTags"
          name="topicTags"
          dir="ltr"
          defaultValue={field("topicTags", defaultValues?.topicTags.join(", "))}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="publishedAt">تاریخ انتشار *</Label>
        <Input
          id="publishedAt"
          name="publishedAt"
          type="date"
          dir="ltr"
          defaultValue={field("publishedAt", defaultValues?.publishedAt)}
          required
        />
      </div>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
