import { requireAdminAccess } from "@/lib/auth/admin";
import { getMcpSettings } from "@/app/admin/queries";
import { SettingsClient } from "./SettingsClient";

export default async function AdminSettingsPage() {
  await requireAdminAccess();

  const settings = await getMcpSettings();

  return (
    <div>
      <h1
        className="mb-6"
        style={{
          fontSize: "var(--admin-headline-h6-font-size)",
          lineHeight: 1.2,
          fontFamily: "var(--admin-font-poppins)",
          fontWeight: "var(--admin-font-medium)",
          color: "var(--admin-text-primary)",
        }}
      >
        Settings
      </h1>

      <SettingsClient settings={settings} />
    </div>
  );
}
