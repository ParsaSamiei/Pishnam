"use client";

import { useState } from "react";
import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { NativeSelect } from "@/components/ui/native-select";
import { FileUploadField } from "@/components/admin/file-upload-field";
import { SOFTWARE_PLATFORMS } from "@/lib/software-platforms";
import { DOWNLOAD_ACCEPT } from "@/lib/upload-policies";
import type { SoftwareReleaseFormState } from "@/app/admin/(dashboard)/software-releases/actions";

interface SoftwareReleaseFormProps {
  action: (
    prevState: SoftwareReleaseFormState,
    formData: FormData,
  ) => Promise<SoftwareReleaseFormState>;
  products: { id: string; title: string }[];
  defaultValues?: {
    productId: string;
    platform: string;
    versionLabel: string;
    source: string;
    fileUrl: string;
    fileSizeBytes: number | null;
    notesFa: string | null;
    notesEn: string | null;
    order: number;
  };
  submitLabel: string;
}

const initialState: SoftwareReleaseFormState = { status: "idle" };

type SoftwareReleaseFormFieldsProps = Omit<SoftwareReleaseFormProps, "action"> & {
  state: SoftwareReleaseFormState;
  field: ReturnType<typeof usePreservedFormAction<SoftwareReleaseFormState>>["field"];
  isPending: boolean;
};

function SoftwareReleaseFormFields({
  products,
  defaultValues,
  submitLabel,
  state,
  field,
  isPending,
}: SoftwareReleaseFormFieldsProps) {
  const [source, setSource] = useState(() => field("source", defaultValues?.source ?? "HOSTED"));
  const [fileSizeBytes, setFileSizeBytes] = useState(() =>
    Number(field("fileSizeBytes", defaultValues?.fileSizeBytes ?? 0)),
  );

  return (
    <>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="productId">نرم‌افزار *</Label>
        <NativeSelect
          id="productId"
          name="productId"
          defaultValue={field("productId", defaultValues?.productId)}
          required
          aria-invalid={Boolean(state.errors?.productId)}
        >
          <option value="" disabled>
            انتخاب کنید...
          </option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.title}
            </option>
          ))}
        </NativeSelect>
        {state.errors?.productId && (
          <p className="text-pishnam-danger text-xs">{state.errors.productId}</p>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="platform">پلتفرم *</Label>
          <NativeSelect
            id="platform"
            name="platform"
            defaultValue={field("platform", defaultValues?.platform ?? SOFTWARE_PLATFORMS[0].value)}
            required
          >
            {SOFTWARE_PLATFORMS.map((platform) => (
              <option key={platform.value} value={platform.value}>
                {platform.labelFa}
              </option>
            ))}
          </NativeSelect>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="versionLabel">شماره نسخه *</Label>
          <Input
            id="versionLabel"
            name="versionLabel"
            dir="ltr"
            placeholder="v2.3.1"
            defaultValue={field("versionLabel", defaultValues?.versionLabel)}
            required
            aria-invalid={Boolean(state.errors?.versionLabel)}
          />
          {state.errors?.versionLabel && (
            <p className="text-pishnam-danger text-xs">{state.errors.versionLabel}</p>
          )}
        </div>
      </div>

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
            label="فایل *"
            policy="download.software"
            accept={DOWNLOAD_ACCEPT}
            field="softwareRelease.fileUrl"
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
          <Label htmlFor="notesFa">توضیحات این نسخه (فارسی)</Label>
          <Textarea
            id="notesFa"
            name="notesFa"
            rows={3}
            placeholder="نیازمندی‌ها، تغییرات این نسخه و ..."
            defaultValue={field("notesFa", defaultValues?.notesFa ?? "")}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="notesEn">Notes for this release (English)</Label>
          <Textarea
            id="notesEn"
            name="notesEn"
            dir="ltr"
            rows={3}
            placeholder="Requirements, changelog, etc."
            defaultValue={field("notesEn", defaultValues?.notesEn ?? "")}
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

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          {submitLabel}
        </Button>
      </div>
    </>
  );
}

export function SoftwareReleaseForm({
  action,
  products,
  defaultValues,
  submitLabel,
}: SoftwareReleaseFormProps) {
  const { state, formAction, isPending, formKey, field } = usePreservedFormAction(
    action,
    initialState,
  );

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      <SoftwareReleaseFormFields
        key={formKey}
        products={products}
        defaultValues={defaultValues}
        submitLabel={submitLabel}
        state={state}
        field={field}
        isPending={isPending}
      />
    </form>
  );
}
