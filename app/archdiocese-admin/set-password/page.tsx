import { Suspense } from "react";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SetPasswordForm
        title="Archdiocese"
        subtitle="Set your password"
        slugLabel="Archdiocese"
        endpoint="/archdiocese-admin/reset-password"
        role="system-admin"
      />
    </Suspense>
  );
}