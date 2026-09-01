/** Shared shape for server actions that should keep user input after validation errors. */
export type PreservedFormState = {
  status: "idle" | "error" | "success";
  errors?: Record<string, string>;
  message?: string;
  values?: Record<string, string>;
  /** Bumps on each failed submit so forms can remount with preserved defaults. */
  revision?: number;
};

/** Narrow error payload returned from failed form submissions. */
export type FormErrorState = {
  status: "error";
  errors?: Record<string, string>;
  message?: string;
  values: Record<string, string>;
  revision: number;
};

/** Admin dashboard forms redirect on success; they only need idle/error plus preserved values. */
export type AdminFormState = {
  status: "idle" | "error";
  errors?: Record<string, string>;
  values?: Record<string, string>;
  revision?: number;
};

/** Serializes FormData into plain strings (multi-value fields as JSON arrays). */
export function extractFormValues(formData: FormData): Record<string, string> {
  const keys = new Set<string>();
  for (const key of formData.keys()) {
    keys.add(key);
  }

  const values: Record<string, string> = {};
  for (const key of keys) {
    const entries = formData.getAll(key);
    const strings = entries.filter((entry): entry is string => typeof entry === "string");
    if (strings.length === 0) continue;
    values[key] = strings.length === 1 ? strings[0]! : JSON.stringify(strings);
  }
  return values;
}

export function formActionError(
  errors: Record<string, string>,
  formData: FormData,
): FormErrorState {
  return {
    status: "error",
    errors,
    values: extractFormValues(formData),
    revision: Date.now(),
  };
}

export function formActionErrorWithMessage(message: string, formData: FormData): FormErrorState {
  return {
    status: "error",
    message,
    values: extractFormValues(formData),
    revision: Date.now(),
  };
}

/** Parses a field saved via extractFormValues when the input used `name` multiple times. */
export function parseMultiValueField(raw: string | undefined): string[] {
  if (!raw) return [];
  if (raw.startsWith("[")) {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(String);
      }
    } catch {
      // fall through
    }
  }
  return [raw];
}
