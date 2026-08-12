// app/[parish]/parish-admin/reset-password/page.tsx
import { Suspense } from "react";
import { SetPasswordForm } from "@/components/auth/set-password-form";
import { subRows } from "@/lib/data";

export default function Page({ params }: { params: { parish: string } }) {
  const { parish } = params;
  const row = subRows.find((r) => r.slug === parish);
  const parishName = row ? row.p : parish;

  return (
    <Suspense fallback={null}>
      <SetPasswordForm
        title={parishName}
        subtitle="Set your password"
        slugLabel={`${parish} / admin`}
        endpoint={`/${parish}/parish-admin/set-password`}
        role="parish-admin"
        parishSlug={parish}
      />
    </Suspense>
  );
}