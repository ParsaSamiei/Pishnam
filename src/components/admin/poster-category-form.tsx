"use client";

import { useActionState, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import type { PosterCategoryFormState } from "@/app/admin/(dashboard)/poster-categories/actions";

export interface LeagueOption {
  id: string;
  title: string;
  competitionId: string;
}

interface PosterCategoryFormProps {
  action: (
    prevState: PosterCategoryFormState,
    formData: FormData,
  ) => Promise<PosterCategoryFormState>;
  competitions: { id: string; title: string }[];
  leagues: LeagueOption[];
  defaultValues?: {
    competitionId: string;
    leagueId: string;
    slug: string;
    titleFa: string;
    titleEn: string;
    order: number;
    active: boolean;
  };
  submitLabel: string;
}

const initialState: PosterCategoryFormState = { status: "idle" };

export function PosterCategoryForm({
  action,
  competitions,
  leagues,
  defaultValues,
  submitLabel,
}: PosterCategoryFormProps) {
  const [state, formAction, isPending] = useActionState(action, initialState);
  const [competitionId, setCompetitionId] = useState(
    defaultValues?.competitionId ?? competitions[0]?.id ?? "",
  );

  const filteredLeagues = useMemo(
    () => leagues.filter((league) => league.competitionId === competitionId),
    [leagues, competitionId],
  );

  const defaultLeagueId =
    defaultValues?.leagueId &&
    filteredLeagues.some((league) => league.id === defaultValues.leagueId)
      ? defaultValues.leagueId
      : (filteredLeagues[0]?.id ?? "");

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="competitionId">مسابقه *</Label>
          <NativeSelect
            id="competitionId"
            value={competitionId}
            onChange={(e) => setCompetitionId(e.target.value)}
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
          <Label htmlFor="leagueId">لیگ *</Label>
          <NativeSelect
            id="leagueId"
            name="leagueId"
            key={competitionId}
            defaultValue={defaultLeagueId}
            required
            disabled={filteredLeagues.length === 0}
            aria-invalid={Boolean(state.errors?.leagueId)}
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
          {state.errors?.leagueId && (
            <p className="text-pishnam-danger text-xs">{state.errors.leagueId}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="slug">نامک (slug) *</Label>
        <Input
          id="slug"
          name="slug"
          dir="ltr"
          placeholder="rules"
          defaultValue={defaultValues?.slug}
          required
          aria-invalid={Boolean(state.errors?.slug)}
        />
        {state.errors?.slug && <p className="text-pishnam-danger text-xs">{state.errors.slug}</p>}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="titleFa">عنوان (فارسی) *</Label>
          <Input
            id="titleFa"
            name="titleFa"
            defaultValue={defaultValues?.titleFa}
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
            defaultValue={defaultValues?.titleEn}
            required
            aria-invalid={Boolean(state.errors?.titleEn)}
          />
          {state.errors?.titleEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.titleEn}</p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 sm:max-w-40">
        <Label htmlFor="order">ترتیب نمایش</Label>
        <Input
          id="order"
          name="order"
          type="number"
          min={0}
          defaultValue={defaultValues?.order ?? 0}
        />
      </div>

      <label className="text-text-primary flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="active"
          defaultChecked={defaultValues?.active ?? true}
          className="border-border accent-pishnam-gold-500 size-4 rounded"
        />
        نمایش در مرکز دانلود
      </label>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending || filteredLeagues.length === 0}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
