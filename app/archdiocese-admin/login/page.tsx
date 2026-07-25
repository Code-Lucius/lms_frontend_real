import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
  return (
    <LoginForm
      title="Archdiocese"
      subtitle="Archdiocese Learning Management System"
      slugLabel="Archdiocese"
      endpoint="/archdiocese-admin/login"
      role="system-admin"
    />
  );
}
