import { getContactSettings } from "@/lib/contact-settings";
import { ContactSettingsForm } from "@/components/admin/contact-settings-form";
import { updateContactSettings } from "./actions";

export default async function AdminContactPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ saved }, settings] = await Promise.all([searchParams, getContactSettings()]);

  return (
    <div>
      <h1 className="text-text-primary text-2xl font-bold">تماس با ما</h1>
      <p className="text-text-secondary mt-2 max-w-2xl text-sm">
        شماره‌ها، ایمیل، آدرس، نقشهٔ گوگل و لینک شبکه‌های اجتماعی که در صفحه تماس نمایش داده
        می‌شوند. فیلدهای خالی در سایت نشان داده نمی‌شوند.
      </p>
      {saved === "1" ? (
        <p className="bg-pishnam-gold-500/15 text-pishnam-gold-600 mt-4 max-w-2xl rounded-md px-3 py-2 text-sm">
          اطلاعات تماس ذخیره شد.
        </p>
      ) : null}
      <div className="mt-6">
        <ContactSettingsForm
          key={settings?.updatedAt.toISOString() ?? "empty"}
          action={updateContactSettings}
          defaultValues={
            settings
              ? {
                  phones: settings.phones,
                  email: settings.email,
                  addressFa: settings.addressFa,
                  addressEn: settings.addressEn,
                  mapEmbedUrl: settings.mapEmbedUrl,
                  telegramUrl: settings.telegramUrl,
                  baleUrl: settings.baleUrl,
                  youtubeUrl: settings.youtubeUrl,
                  aparatUrl: settings.aparatUrl,
                  instagramUrl: settings.instagramUrl,
                }
              : undefined
          }
        />
      </div>
    </div>
  );
}
