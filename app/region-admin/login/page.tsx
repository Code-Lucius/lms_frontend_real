import { LoginForm } from "@/components/auth/login-form";

export default function Page() {
  return (
    <LoginForm
      title="Region Admin"
      subtitle="Archdiocese Learning Management System"
      slugLabel="Region"
      endpoint="/region-admin/login"
      role="region-admin"
    />
  );
}
