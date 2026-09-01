"use client";

import { useMemo, useState } from "react";
import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { FileUploadField } from "@/components/admin/file-upload-field";
import type { CompetitionPosterFormState } from "@/app/admin/(dashboard)/posters/actions";

export interface PosterLeagueOption {
  id: string;
  title: string;
  competitionId: string;
}

export interface PosterCategoryOption {
  id: string;
  title: string;
  leagueId: string;
}

interface CompetitionPosterFormProps {
  action: (
    prevState: CompetitionPosterFormState,
    formData: FormData,
  ) => Promise<CompetitionPosterFormState>;
  competitions: { id: string; title: string }[];
  leagues: PosterLeagueOption[];
  categories: PosterCategoryOption[];
  defaultValues?: {
    competitionId: string;
    leagueId: string;
    categoryId: string;
    titleFa: string;
    titleEn: string;
    descriptionFa: string | null;
    descriptionEn: string | null;
    previewImage: string;
    source: string;
    fileUrl: string;
    fileSizeBytes: number | null;
    order: number;
    active: boolean;
  };
  submitLabel: string;
}

const initialState: CompetitionPosterFormState = { status: "idle" };

type CompetitionPosterFormFieldsProps = Omit<CompetitionPosterFormProps, "action"> & {
  state: CompetitionPosterFormState;
  field: ReturnType<typeof usePreservedFormAction<CompetitionPosterFormState>>["field"];
  checked: ReturnType<typeof usePreservedFormAction<CompetitionPosterFormState>>["checked"];
  isPending: boolean;
};

function CompetitionPosterFormFields({
  competitions,
  leagues,
  categories,
  defaultValues,
  submitLabel,
  state,
  field,
  checked,
  isPending,
}: CompetitionPosterFormFieldsProps) {
  const [competitionId, setCompetitionId] = useState(() =>
    field("competitionId", defaultValues?.competitionId ?? competitions[0]?.id ?? ""),
  );
  const [leagueId, setLeagueId] = useState(() => field("leagueId", defaultValues?.leagueId ?? ""));
  const [source, setSource] = useState(() => field("source", defaultValues?.source ?? "HOSTED"));
  const [fileSizeBytes, setFileSizeBytes] = useState(() =>
    Number(field("fileSizeBytes", defaultValues?.fileSizeBytes ?? 0)),
  );

  const filteredLeagues = useMemo(
    () => leagues.filter((league) => league.competitionId === competitionId),
    [leagues, competitionId],
  );

  const effectiveLeagueId =
    leagueId && filteredLeagues.some((league) => league.id === leagueId)
      ? leagueId
      : (filteredLeagues[0]?.id ?? "");

  const filteredCategories = useMemo(
    () => categories.filter((category) => category.leagueId === effectiveLeagueId),
    [categories, effectiveLeagueId],
  );

  const defaultCategoryId =
    defaultValues?.categoryId &&
    filteredCategories.some((category) => category.id === defaultValues.categoryId)
      ? defaultValues.categoryId
      : (filteredCategories[0]?.id ?? "");

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="competitionId">مسابقه *</Label>
          <NativeSelect
            id="competitionId"
            value={competitionId}
            onChange={(e) => {
              setCompetitionId(e.target.value);
              setLeagueId("");
            }}
            required
          >
            <option value="" disabled>
              انتخاب کنید...
            </option>
            {competitions.map((competition) => (
              <option key={competition.id} value={competition.id}>
                {competition.title}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="leagueIdFilter">لیگ *</Label>
          <NativeSelect
            id="leagueIdFilter"
            value={effectiveLeagueId}
            onChange={(e) => setLeagueId(e.target.value)}
            required
            disabled={filteredLeagues.length === 0}
          >
            <option value="" disabled>
              {filteredLeagues.length === 0 ? "ابتدا یک لیگ بسازید" : "انتخاب کنید..."}
            </option>
            {filteredLeagues.map((league) => (
              <option key={league.id} value={league.id}>
                {league.title}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="categoryId">دسته‌بندی *</Label>
          <NativeSelect
            id="categoryId"
            name="categoryId"
            key={effectiveLeagueId}
            defaultValue={field("categoryId", defaultCategoryId)}
            required
            disabled={filteredCategories.length === 0}
            aria-invalid={Boolean(state.errors?.categoryId)}
          >
            <option value="" disabled>
              {filteredCategories.length === 0 ? "ابتدا یک دسته بسازید" : "انتخاب کنید..."}
            </option>
            {filteredCategories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.title}
              </option>
            ))}
          </NativeSelect>
          {state.errors?.categoryId && (
            <p className="text-pishnam-danger text-xs">{state.errors.categoryId}</p>
          )}
        </div>
      </div>

      <ImageUploadField
        name="previewImage"
        label="تصویر پیش‌نمایش"
        field="competitionPoster.previewImage"
        defaultValue={field("previewImage", defaultValues?.previewImage)}
        required
        error={state.errors?.previewImage}
      />

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="source">نوع منبع *</Label>
        <NativeSelect
          id="source"
          name="source"
          value={source}
          onChange={(e) => setSource(e.target.value)}
          required
        >
          <option value="HOSTED">فایل آپلودی</option>
          <option value="EXTERNAL">لینک خارجی</option>
        </NativeSelect>
      </div>

      {source === "HOSTED" ? (
        <>
          <FileUploadField
            name="fileUrl"
            label="فایل پوستر *"
            policy="download.poster"
            accept=".pdf,image/jpeg,image/png"
            field="competitionPoster.fileUrl"
            defaultValue={field(
              "fileUrl",
              defaultValues?.source === "HOSTED" ? defaultValues.fileUrl : undefined,
            )}
            required
            error={state.errors?.fileUrl}
            onUploaded={(result) => setFileSizeBytes(result.sizeBytes)}
          />
          <input type="hidden" name="fileSizeBytes" value={fileSizeBytes} />
        </>
      ) : (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="fileUrl">آدرس لینک خارجی *</Label>
          <Input
            id="fileUrl"
            name="fileUrl"
            dir="ltr"
            placeholder="https://..."
            defaultValue={field(
              "fileUrl",
              defaultValues?.source === "EXTERNAL" ? defaultValues.fileUrl : undefined,
            )}
            required
            aria-invalid={Boolean(state.errors?.fileUrl)}
          />
          {state.errors?.fileUrl && (
            <p className="text-pishnam-danger text-xs">{state.errors.fileUrl}</p>
          )}
        </div>
      )}

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

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descriptionFa">توضیحات (فارسی)</Label>
          <Textarea
            id="descriptionFa"
            name="descriptionFa"
            rows={3}
            defaultValue={field("descriptionFa", defaultValues?.descriptionFa ?? "")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="descriptionEn">Description (English)</Label>
          <Textarea
            id="descriptionEn"
            name="descriptionEn"
            dir="ltr"
            rows={3}
            defaultValue={field("descriptionEn", defaultValues?.descriptionEn ?? "")}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:max-w-40">
        <Label htmlFor="order">ترتیب نمایش</Label>
        <Input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={field("order", defaultValues?.order ?? 0)}
        />
      </div>

      <label className="text-text-primary flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={checked("active", defaultValues?.active ?? true)}
          className="border-border accent-pishnam-gold-500 size-4 rounded"
        />
        نمایش در مرکز دانلود
      </label>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || filteredCategories.length === 0}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </>
  );
}

export function CompetitionPosterForm({
  action,
  competitions,
  leagues,
  categories,
  defaultValues,
  submitLabel,
}: CompetitionPosterFormProps) {
  const { state, formAction, isPending, formKey, field, checked } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      <CompetitionPosterFormFields
        key={formKey}
        competitions={competitions}
        leagues={leagues}
        categories={categories}
        defaultValues={defaultValues}
        submitLabel={submitLabel}
        state={state}
        field={field}
        checked={checked}
        isPending={isPending}
      />
    </form>
  );
}
