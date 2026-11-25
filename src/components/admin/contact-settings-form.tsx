"use client";

import { useId, useState } from "react";
import { usePreservedFormAction } from "@/lib/hooks/use-preserved-form-action";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EnFieldLabel } from "@/components/admin/en-field-label";
import { Textarea } from "@/components/ui/textarea";
import type { ContactSettingsFormState } from "@/app/admin/(dashboard)/contact/actions";
import {
  contactAddressLabel,
  MAX_CONTACT_ADDRESSES,
  MAX_CONTACT_BRANCH_NAME_LENGTH,
} from "@/lib/contact-addresses";
import { toGoogleMapsEmbedUrl } from "@/lib/google-maps";
import { IRANIAN_PHONE_HINT_FA } from "@/lib/phone";
import { SOCIAL_CHANNELS } from "@/lib/social-channels";

type AddressFormValue = {
  id: string;
  nameFa: string;
  nameEn: string;
  addressFa: string;
  addressEn: string;
  postalCode: string;
  phones: string[];
  mapEmbedUrl: string;
};

type AddressFormField = Exclude<keyof AddressFormValue, "id" | "phones">;

interface ContactSettingsFormProps {
  action: (
    prevState: ContactSettingsFormState,
    formData: FormData,
  ) => Promise<ContactSettingsFormState>;
  defaultValues?: {
    phones: string[];
    email: string | null;
    footerTaglineFa: string | null;
    footerTaglineEn: string | null;
    addresses: Array<{
      nameFa: string | null;
      nameEn: string | null;
      addressFa: string | null;
      addressEn: string | null;
      postalCode: string | null;
      phones: string[];
      mapEmbedUrl: string | null;
    }>;
    telegramUrl: string | null;
    baleUrl: string | null;
    youtubeUrl: string | null;
    aparatUrl: string | null;
    instagramUrl: string | null;
  };
}

const initialState: ContactSettingsFormState = { status: "idle" };

type ContactSettingsFormFieldsProps = Omit<ContactSettingsFormProps, "action"> & {
  state: ContactSettingsFormState;
  field: ReturnType<typeof usePreservedFormAction<ContactSettingsFormState>>["field"];
  multiValueField: ReturnType<
    typeof usePreservedFormAction<ContactSettingsFormState>
  >["multiValueField"];
  arrayField: ReturnType<typeof usePreservedFormAction<ContactSettingsFormState>>["arrayField"];
  isPending: boolean;
};

type AddressRowProps = {
  value: AddressFormValue;
  index: number;
  total: number;
  canRemove: boolean;
  errors: Record<string, string>;
  onChange: (field: AddressFormField, value: string) => void;
  onPhonesChange: (phones: string[]) => void;
  onRemove: () => void;
};

function AddressRow({
  value,
  index,
  total,
  canRemove,
  errors,
  onChange,
  onPhonesChange,
  onRemove,
}: AddressRowProps) {
  const idPrefix = useId();
  const nameFaId = `${idPrefix}-name-fa`;
  const nameEnId = `${idPrefix}-name-en`;
  const faId = `${idPrefix}-fa`;
  const enId = `${idPrefix}-en`;
  const postalId = `${idPrefix}-postal`;
  const mapId = `${idPrefix}-map`;
  const phonesErrorId = `${idPrefix}-phones-error`;
  const errorFor = (field: AddressFormField | "phones") => {
    const prefix = `addresses.${index}.${field}`;
    return (
      errors[prefix] ?? Object.entries(errors).find(([key]) => key.startsWith(`${prefix}.`))?.[1]
    );
  };
  const embedUrl = toGoogleMapsEmbedUrl(value.mapEmbedUrl);
  const branchLabel = contactAddressLabel(index, true, total, value);

  // Every branch keeps at least one input so an empty list is still submitted.
  const phoneValues = value.phones.length ? value.phones : [""];
  const updatePhone = (phoneIndex: number, next: string) =>
    onPhonesChange(phoneValues.map((phone, i) => (i === phoneIndex ? next : phone)));
  const addBranchPhone = () => onPhonesChange([...phoneValues, ""]);
  const removeBranchPhone = (phoneIndex: number) => {
    const next = phoneValues.filter((_, i) => i !== phoneIndex);
    onPhonesChange(next.length ? next : [""]);
  };

  return (
    <div className="border-border bg-surface/40 flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-center justify-between gap-2">
        <p className="text-text-primary text-sm font-semibold">{branchLabel}</p>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label={index === 0 ? "حذف آدرس" : `حذف آدرس ${index + 1}`}
          className="shrink-0 cursor-pointer"
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={nameFaId}>نام شعبه (فارسی)</Label>
          <Input
            id={nameFaId}
            name="nameFa"
            placeholder="مثلاً شعبه رسالت"
            maxLength={MAX_CONTACT_BRANCH_NAME_LENGTH}
            value={value.nameFa}
            onChange={(event) => onChange("nameFa", event.target.value)}
            aria-invalid={Boolean(errorFor("nameFa"))}
            aria-describedby={errorFor("nameFa") ? `${nameFaId}-error` : undefined}
          />
          {errorFor("nameFa") ? (
            <p id={`${nameFaId}-error`} className="text-pishnam-danger text-xs">
              {errorFor("nameFa")}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-1.5">
          <EnFieldLabel
            htmlFor={nameEnId}
            sourceName="nameFa"
            targetName="nameEn"
            getSourceText={() => value.nameFa}
            getTargetText={() => value.nameEn}
            onTranslated={(text) => onChange("nameEn", text)}
          >
            Branch name (English)
          </EnFieldLabel>
          <Input
            id={nameEnId}
            name="nameEn"
            dir="ltr"
            placeholder="Resalat branch"
            maxLength={MAX_CONTACT_BRANCH_NAME_LENGTH}
            value={value.nameEn}
            onChange={(event) => onChange("nameEn", event.target.value)}
            aria-invalid={Boolean(errorFor("nameEn"))}
            aria-describedby={errorFor("nameEn") ? `${nameEnId}-error` : undefined}
          />
          {errorFor("nameEn") ? (
            <p id={`${nameEnId}-error`} className="text-pishnam-danger text-xs">
              {errorFor("nameEn")}
            </p>
          ) : null}
        </div>
      </div>
      <p className="text-text-secondary text-xs">
        این نام در سراسر سایت جایگزین «آدرس ۱» می‌شود. اگر خالی بماند، عنوان شماره‌دار نمایش داده
        می‌شود؛ اگر یک زبان خالی باشد، نام زبان دیگر استفاده می‌شود.
      </p>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={faId}>آدرس (فارسی)</Label>
        <Textarea
          id={faId}
          name="addressFa"
          rows={2}
          value={value.addressFa}
          onChange={(event) => onChange("addressFa", event.target.value)}
          aria-invalid={Boolean(errorFor("addressFa"))}
        />
        {errorFor("addressFa") ? (
          <p className="text-pishnam-danger text-xs">{errorFor("addressFa")}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <EnFieldLabel
          htmlFor={enId}
          sourceName="addressFa"
          targetName="addressEn"
          getSourceText={() => value.addressFa}
          getTargetText={() => value.addressEn}
          onTranslated={(text) => onChange("addressEn", text)}
        >
          Address (English)
        </EnFieldLabel>
        <Textarea
          id={enId}
          name="addressEn"
          dir="ltr"
          rows={2}
          value={value.addressEn}
          onChange={(event) => onChange("addressEn", event.target.value)}
          aria-invalid={Boolean(errorFor("addressEn"))}
        />
        {errorFor("addressEn") ? (
          <p className="text-pishnam-danger text-xs">{errorFor("addressEn")}</p>
        ) : null}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={postalId}>کد پستی</Label>
        <Input
          id={postalId}
          name="postalCode"
          type="text"
          dir="ltr"
          inputMode="numeric"
          autoComplete="postal-code"
          placeholder="1234567890"
          value={value.postalCode}
          onChange={(event) => onChange("postalCode", event.target.value)}
          aria-invalid={Boolean(errorFor("postalCode"))}
        />
        {errorFor("postalCode") ? (
          <p className="text-pishnam-danger text-xs">{errorFor("postalCode")}</p>
        ) : null}
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-text-primary text-xs font-semibold">تلفن مخصوص این شعبه</legend>
        <p className="text-text-secondary text-xs">
          قالب مجاز: {IRANIAN_PHONE_HINT_FA}. فیلدهای خالی هنگام ذخیره نادیده گرفته میشوند.
        </p>
        {phoneValues.map((phone, phoneIndex) => (
          <div key={phoneIndex} className="flex items-start gap-2">
            <Input
              name={`addressPhones.${index}`}
              type="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="09121234567"
              value={phone}
              onChange={(event) => updatePhone(phoneIndex, event.target.value)}
              aria-label={`تلفن شعبه ${index + 1}، شماره ${phoneIndex + 1}`}
              aria-invalid={Boolean(errorFor("phones"))}
              aria-describedby={errorFor("phones") ? phonesErrorId : undefined}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removeBranchPhone(phoneIndex)}
              aria-label={`حذف تلفن ${phoneIndex + 1} از شعبه ${index + 1}`}
              className="shrink-0 cursor-pointer"
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        ))}
        {errorFor("phones") ? (
          <p id={phonesErrorId} className="text-pishnam-danger text-xs">
            {errorFor("phones")}
          </p>
        ) : null}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addBranchPhone}
          disabled={phoneValues.length >= 10}
          className="w-fit cursor-pointer"
        >
          <Plus aria-hidden="true" />
          افزودن تلفن برای این شعبه
        </Button>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={mapId}>نقشه گوگل (Embed)</Label>
        <Textarea
          id={mapId}
          name="mapEmbedUrl"
          dir="ltr"
          rows={3}
          placeholder='<iframe src="https://www.google.com/maps/embed?pb=..." ...></iframe>'
          value={value.mapEmbedUrl}
          onChange={(event) => onChange("mapEmbedUrl", event.target.value)}
          aria-invalid={Boolean(errorFor("mapEmbedUrl"))}
        />
        <p className="text-text-secondary text-xs">
          در گوگل مپ روی Share و سپس Embed a map بزنید و کد iframe را اینجا بچسبانید. لینک معمولی
          نقشه کار نمیکند.
        </p>
        {errorFor("mapEmbedUrl") ? (
          <p className="text-pishnam-danger text-xs">{errorFor("mapEmbedUrl")}</p>
        ) : null}
      </div>

      {embedUrl ? (
        <div className="border-border overflow-hidden rounded-md border">
          <iframe
            src={embedUrl}
            title={`پیش نمایش نقشه — ${branchLabel}`}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-56 w-full border-0"
          />
        </div>
      ) : null}
    </div>
  );
}

function ContactSettingsFormFields({
  defaultValues,
  state,
  field,
  multiValueField,
  arrayField,
  isPending,
}: ContactSettingsFormFieldsProps) {
  const phoneIdPrefix = useId();
  const addressIdPrefix = useId();
  const [phoneRows, setPhoneRows] = useState(() => {
    const phones = multiValueField(
      "phones",
      defaultValues?.phones.length ? defaultValues.phones : [""],
    );
    return phones.map((value, index) => ({ id: `${phoneIdPrefix}-${index}`, value }));
  });
  const [addressRows, setAddressRows] = useState<AddressFormValue[]>(() => {
    const nameFa = arrayField(
      "nameFa",
      defaultValues?.addresses.map((address) => address.nameFa ?? "") ?? [],
    );
    const nameEn = arrayField(
      "nameEn",
      defaultValues?.addresses.map((address) => address.nameEn ?? "") ?? [],
    );
    const fa = arrayField(
      "addressFa",
      defaultValues?.addresses.map((a) => a.addressFa ?? "") ?? [],
    );
    const en = arrayField(
      "addressEn",
      defaultValues?.addresses.map((a) => a.addressEn ?? "") ?? [],
    );
    const postal = arrayField(
      "postalCode",
      defaultValues?.addresses.map((a) => a.postalCode ?? "") ?? [],
    );
    const map = arrayField(
      "mapEmbedUrl",
      defaultValues?.addresses.map((a) => a.mapEmbedUrl ?? "") ?? [],
    );
    const count = Math.max(
      1,
      nameFa.length,
      nameEn.length,
      fa.length,
      en.length,
      postal.length,
      map.length,
    );
    return Array.from({ length: count }, (_, index) => ({
      id: `${addressIdPrefix}-${index}`,
      nameFa: nameFa[index] ?? "",
      nameEn: nameEn[index] ?? "",
      addressFa: fa[index] ?? "",
      addressEn: en[index] ?? "",
      postalCode: postal[index] ?? "",
      phones: arrayField(`addressPhones.${index}`, defaultValues?.addresses[index]?.phones ?? []),
      mapEmbedUrl: map[index] ?? "",
    }));
  });

  function addPhone() {
    setPhoneRows((current) => [
      ...current,
      { id: `${phoneIdPrefix}-${current.length}-${Date.now()}`, value: "" },
    ]);
  }

  function removePhone(id: string) {
    setPhoneRows((current) =>
      current.length <= 1
        ? [{ id: `${phoneIdPrefix}-0`, value: "" }]
        : current.filter((row) => row.id !== id),
    );
  }

  function addAddress() {
    setAddressRows((current) => [
      ...current,
      {
        id: `${addressIdPrefix}-${current.length}-${Date.now()}`,
        nameFa: "",
        nameEn: "",
        addressFa: "",
        addressEn: "",
        postalCode: "",
        phones: [],
        mapEmbedUrl: "",
      },
    ]);
  }

  function removeAddress(id: string) {
    setAddressRows((current) => current.filter((row) => row.id !== id));
  }

  function updateAddress(id: string, name: AddressFormField, value: string) {
    setAddressRows((current) =>
      current.map((row) => (row.id === id ? { ...row, [name]: value } : row)),
    );
  }

  function updateAddressPhones(id: string, phones: string[]) {
    setAddressRows((current) => current.map((row) => (row.id === id ? { ...row, phones } : row)));
  }

  return (
    <>
      <fieldset className="flex flex-col gap-3">
        <legend className="text-text-primary text-sm font-semibold">شماره‌های تلفن عمومی</legend>
        <p className="text-text-secondary text-xs">
          شماره‌های مشترک مجموعه را اینجا و شماره‌های مخصوص هر شعبه را در بخش آدرس همان شعبه وارد
          کنید. قالب مجاز: {IRANIAN_PHONE_HINT_FA}. فیلدهای خالی هنگام ذخیره نادیده گرفته می‌شوند.
        </p>
        {phoneRows.map((row, index) => (
          <div key={row.id} className="flex items-start gap-2">
            <Input
              name="phones"
              type="tel"
              autoComplete="tel"
              dir="ltr"
              placeholder="09121234567"
              defaultValue={row.value}
              aria-label={`شماره تلفن ${index + 1}`}
              aria-invalid={Boolean(state.errors?.phones)}
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => removePhone(row.id)}
              aria-label={`حذف شماره ${index + 1}`}
              className="shrink-0 cursor-pointer"
            >
              <Trash2 aria-hidden="true" />
            </Button>
          </div>
        ))}
        {state.errors?.phones && (
          <p className="text-pishnam-danger text-xs">{state.errors.phones}</p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addPhone}
          disabled={phoneRows.length >= 10}
          className="w-fit cursor-pointer"
        >
          <Plus aria-hidden="true" />
          افزودن شماره
        </Button>
      </fieldset>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">ایمیل</Label>
        <Input
          id="email"
          name="email"
          type="email"
          dir="ltr"
          placeholder="info@pishnam.ir"
          defaultValue={field("email", defaultValues?.email ?? "")}
          aria-invalid={Boolean(state.errors?.email)}
        />
        {state.errors?.email && <p className="text-pishnam-danger text-xs">{state.errors.email}</p>}
      </div>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-text-primary text-sm font-semibold">متن معرفی در فوتر</legend>
        <p className="text-text-secondary text-xs">
          جملهٔ کوتاه زیر لوگو در فوتر سایت. اگر خالی بماند، متن پیش‌فرض «آموزش پیشرونده…» نمایش
          داده می‌شود.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="footerTaglineFa">متن فوتر (فارسی)</Label>
          <Textarea
            id="footerTaglineFa"
            name="footerTaglineFa"
            rows={2}
            placeholder="آموزش پیشرونده رباتیک از دبستان تا مسابقات بین‌المللی."
            defaultValue={field("footerTaglineFa", defaultValues?.footerTaglineFa ?? "")}
            aria-invalid={Boolean(state.errors?.footerTaglineFa)}
          />
          {state.errors?.footerTaglineFa && (
            <p className="text-pishnam-danger text-xs">{state.errors.footerTaglineFa}</p>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <EnFieldLabel
            htmlFor="footerTaglineEn"
            sourceName="footerTaglineFa"
            targetName="footerTaglineEn"
          >
            Footer tagline (English)
          </EnFieldLabel>
          <Textarea
            id="footerTaglineEn"
            name="footerTaglineEn"
            dir="ltr"
            rows={2}
            placeholder="Progressive robotics and electronics education, from elementary school to international competitions."
            defaultValue={field("footerTaglineEn", defaultValues?.footerTaglineEn ?? "")}
            aria-invalid={Boolean(state.errors?.footerTaglineEn)}
          />
          {state.errors?.footerTaglineEn && (
            <p className="text-pishnam-danger text-xs">{state.errors.footerTaglineEn}</p>
          )}
        </div>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-text-primary text-sm font-semibold">آدرس‌ها</legend>
        <p className="text-text-secondary text-xs">
          آدرس‌ها به ترتیبی که قرار داده شدهاند در صفحه تماس، فوتر و پنجره تماس نمایش داده می‌شوند.
          ردیف خالی هنگام ذخیره نادیده گرفته میشود.
        </p>
        {addressRows.map((row, index) => (
          <AddressRow
            key={row.id}
            value={row}
            index={index}
            total={addressRows.length}
            canRemove={addressRows.length > 1}
            errors={state.errors ?? {}}
            onChange={(name, value) => updateAddress(row.id, name, value)}
            onPhonesChange={(phones) => updateAddressPhones(row.id, phones)}
            onRemove={() => removeAddress(row.id)}
          />
        ))}
        {state.errors?.addresses && (
          <p className="text-pishnam-danger text-xs">{state.errors.addresses}</p>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addAddress}
          disabled={addressRows.length >= MAX_CONTACT_ADDRESSES}
          className="w-fit cursor-pointer"
        >
          <Plus aria-hidden="true" />
          افزودن آدرس
        </Button>
      </fieldset>

      <fieldset className="flex flex-col gap-4">
        <legend className="text-text-primary text-sm font-semibold">شبکه‌های اجتماعی</legend>
        <p className="text-text-secondary text-xs">
          لینک پروفایل پیشنام در تلگرام، بله، یوتیوب، آپارات و اینستاگرام. فیلدهای خالی در صفحه تماس
          نشان داده نمیشوند.
        </p>
        {SOCIAL_CHANNELS.map((channel) => {
          const error = state.errors?.[channel.field];
          return (
            <div key={channel.field} className="flex flex-col gap-1.5">
              <Label htmlFor={channel.field}>
                {channel.labelFa} ({channel.labelEn})
              </Label>
              <Input
                id={channel.field}
                name={channel.field}
                type="url"
                dir="ltr"
                placeholder={channel.placeholder}
                defaultValue={field(channel.field, defaultValues?.[channel.field] ?? "")}
                aria-invalid={Boolean(error)}
              />
              {error ? <p className="text-pishnam-danger text-xs">{error}</p> : null}
            </div>
          );
        })}
      </fieldset>

      <div className="flex gap-3">
        <Button type="submit" disabled={isPending} className="cursor-pointer">
          {isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
          ذخیره اطلاعات تماس
        </Button>
      </div>
    </>
  );
}

export function ContactSettingsForm({ action, defaultValues }: ContactSettingsFormProps) {
  const { state, formAction, isPending, formKey, field, multiValueField, arrayField } =
    usePreservedFormAction(action, initialState);

  return (
    <form key={formKey} action={formAction} className="flex max-w-2xl flex-col gap-5">
      <ContactSettingsFormFields
        key={formKey}
        defaultValues={defaultValues}
        state={state}
        field={field}
        multiValueField={multiValueField}
        arrayField={arrayField}
        isPending={isPending}
      />
    </form>
  );
}
