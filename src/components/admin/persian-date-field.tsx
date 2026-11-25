"use client";

import { useMemo, useState } from "react";
import { Label } from "@/components/ui/label";
import { NativeSelect } from "@/components/ui/native-select";
import {
  JALALI_MONTHS_FA,
  formatPersianDigits,
  isoDateToJalali,
  jalaliMonthLength,
  jalaliToIsoDate,
  todayJalali,
} from "@/lib/jalali";

interface PersianDateFieldProps {
  id: string;
  name: string;
  label: string;
  defaultValue?: string;
  error?: string;
  /** Inclusive Jalali year range. Defaults to 1370 … current + 1. */
  minYear?: number;
  maxYear?: number;
}

type Part = number | "";

function parseInitial(defaultValue?: string): { year: Part; month: Part; day: Part } {
  if (!defaultValue) return { year: "", month: "", day: "" };
  const jalali = isoDateToJalali(defaultValue);
  if (!jalali) return { year: "", month: "", day: "" };
  return { year: jalali.jy, month: jalali.jm, day: jalali.jd };
}

export function PersianDateField({
  id,
  name,
  label,
  defaultValue = "",
  error,
  minYear = 1370,
  maxYear,
}: PersianDateFieldProps) {
  const currentYear = todayJalali().jy;
  const yearMax = maxYear ?? currentYear + 1;
  const initial = parseInitial(defaultValue);

  const [year, setYear] = useState<Part>(initial.year);
  const [month, setMonth] = useState<Part>(initial.month);
  const [day, setDay] = useState<Part>(initial.day);

  const years = useMemo(() => {
    const list: number[] = [];
    for (let y = yearMax; y >= minYear; y -= 1) list.push(y);
    return list;
  }, [minYear, yearMax]);

  const dayCount = year !== "" && month !== "" ? jalaliMonthLength(year, month) : 31;
  const safeDay = day !== "" && day > dayCount ? dayCount : day;

  const isoValue =
    year !== "" && month !== "" && safeDay !== "" ? jalaliToIsoDate(year, month, safeDay) : "";

  function handleYearChange(next: Part) {
    setYear(next);
    if (next === "" || month === "" || day === "") {
      if (next === "") {
        setMonth("");
        setDay("");
      }
      return;
    }
    const max = jalaliMonthLength(next, month);
    if (day > max) setDay(max);
  }

  function handleMonthChange(next: Part) {
    setMonth(next);
    if (next === "" || year === "" || day === "") {
      if (next === "") setDay("");
      return;
    }
    const max = jalaliMonthLength(year, next);
    if (day > max) setDay(max);
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={`${id}-year`}>{label}</Label>
      <div className="grid grid-cols-3 gap-2">
        <NativeSelect
          id={`${id}-year`}
          aria-label="سال"
          value={year === "" ? "" : String(year)}
          onChange={(event) => {
            const value = event.target.value;
            handleYearChange(value === "" ? "" : Number(value));
          }}
        >
          <option value="">سال</option>
          {years.map((y) => (
            <option key={y} value={y}>
              {formatPersianDigits(y)}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          id={`${id}-month`}
          aria-label="ماه"
          value={month === "" ? "" : String(month)}
          onChange={(event) => {
            const value = event.target.value;
            handleMonthChange(value === "" ? "" : Number(value));
          }}
        >
          <option value="">ماه</option>
          {JALALI_MONTHS_FA.map((monthName, index) => (
            <option key={monthName} value={index + 1}>
              {monthName}
            </option>
          ))}
        </NativeSelect>

        <NativeSelect
          id={`${id}-day`}
          aria-label="روز"
          value={safeDay === "" ? "" : String(safeDay)}
          onChange={(event) => {
            const value = event.target.value;
            setDay(value === "" ? "" : Number(value));
          }}
        >
          <option value="">روز</option>
          {Array.from({ length: dayCount }, (_, index) => index + 1).map((d) => (
            <option key={d} value={d}>
              {formatPersianDigits(d)}
            </option>
          ))}
        </NativeSelect>
      </div>
      <input type="hidden" id={id} name={name} value={isoValue} />
      <p className="text-text-secondary text-xs">تقویم شمسی — انتخاب سال، ماه و روز</p>
      {error && <p className="text-pishnam-danger text-xs">{error}</p>}
    </div>
  );
}
