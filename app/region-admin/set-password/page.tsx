import { Suspense } from "react";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SetPasswordForm
        title="Region Admin"
        subtitle="Set your password"
        slugLabel="Region"
        endpoint="/region-admin/reset-password"
        role="region-admin"
      />
    </Suspense>
  );
}