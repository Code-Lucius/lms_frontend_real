import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
  return (
    <LoginForm
      title="Deanery Admin"
      subtitle="Archdiocese Learning Management System"
      slugLabel="Deanery"
      endpoint="/deanery-admin/login"
      role="deanery-admin"
    />
  );
}
