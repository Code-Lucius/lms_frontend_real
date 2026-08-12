import { Suspense } from "react";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SetPasswordForm
        title="Deanery Admin"
        subtitle="Set your password"
        slugLabel="Deanery"
        endpoint="/deanery-admin/reset-password" // TODO: confirm actual Laravel route
        role="deanery-admin"
      />
    </Suspense>
  );
}