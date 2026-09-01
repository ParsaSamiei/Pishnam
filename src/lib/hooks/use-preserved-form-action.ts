"use client";

import { useActionState } from "react";
import {
  parseMultiValueField,
  type AdminFormState,
  type PreservedFormState,
} from "@/lib/form-state";

type FieldFallback = string | number | boolean | Date | null | undefined;

type FormActionState = PreservedFormState | AdminFormState;

type PreservedFormAction = (
  prevState: FormActionState,
  formData: FormData,
) => FormActionState | Promise<FormActionState>;

export function usePreservedFormAction<TState extends FormActionState>(
  action: (prevState: TState, formData: FormData) => Promise<TState>,
  initialState: TState,
) {
  const [state, formAction, isPending] = useActionState(
    action as unknown as PreservedFormAction,
    initialState as FormActionState,
  );

  const preservedState = state as TState;
  const formKey = preservedState.revision ?? "initial";

  function field(name: string, fallback?: FieldFallback): string {
    if (preservedState.values?.[name] !== undefined) {
      return preservedState.values[name]!;
    }
    if (fallback instanceof Date) {
      return fallback.toISOString().slice(0, 10);
    }
    if (fallback === null || fallback === undefined) {
      return "";
    }
    return String(fallback);
  }

  function checked(name: string, fallback = false): boolean {
    if (preservedState.values?.[name] !== undefined) {
      const value = preservedState.values[name]!;
      return value === "on" || value === "true" || value === "1";
    }
    return fallback;
  }

  function multiValueField(name: string, fallback: string[] = [""]): string[] {
    if (preservedState.values?.[name] !== undefined) {
      const parsed = parseMultiValueField(preservedState.values[name]);
      return parsed.length > 0 ? parsed : [""];
    }
    return fallback.length > 0 ? fallback : [""];
  }

  return {
    state: preservedState,
    formAction,
    isPending,
    formKey,
    field,
    checked,
    multiValueField,
  };
}
