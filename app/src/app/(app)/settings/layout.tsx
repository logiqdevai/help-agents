import { PageHeader } from "@/components/ui/page-header";
import { SettingsNav } from "@/views/settings/components/settings-nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-6">
      <PageHeader
        title="Settings"
        description="Manage your company account, team and how agents are allowed to call."
      />
      <SettingsNav />
      {children}
    </div>
  );
}
