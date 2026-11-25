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
        شماره‌های عمومی، ایمیل، متن معرفی فوتر و شبکه‌های اجتماعی، به همراه آدرس، کد پستی، تلفن و
        نقشهٔ هر شعبه. اطلاعات شعبه‌ها در صفحه تماس، فوتر و پنجره تماس نمایش داده می‌شوند؛ فیلدهای
        خالی پنهان می‌مانند (متن خالی فوتر به متن پیش‌فرض برمی‌گردد).
      </p>
      {saved === "1" ? (
        <p className="bg-pishnam-gold-500/15 text-pishnam-gold-600 mt-4 max-w-2xl rounded-md px-3 py-2 text-sm">
          اطلاعات تماس ذخیره شد.
        </p>
      ) : null}
      <div className="mt-6">
        <ContactSettingsForm
          key={settings ? new Date(settings.updatedAt).toISOString() : "empty"}
          action={updateContactSettings}
          defaultValues={
            settings
              ? {
                  phones: settings.phones,
                  email: settings.email,
                  footerTaglineFa: settings.footerTaglineFa,
                  footerTaglineEn: settings.footerTaglineEn,
                  addresses: settings.addresses.map((address) => ({
                    addressFa: address.addressFa,
                    addressEn: address.addressEn,
                    postalCode: address.postalCode,
                    phones: address.phones,
                    mapEmbedUrl: address.mapEmbedUrl,
                  })),
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
