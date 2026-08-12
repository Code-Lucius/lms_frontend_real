import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { subRows } from "@/lib/data";

export default function LoginPage({ params }: { params: { parish: string } }) {
  const { parish } = params;
  const row = subRows.find((r) => r.slug === parish);
  const parishName = row ? row.p : "Parish of St. Peter";

  return (
    <LoginForm
      title={parishName}
      subtitle="Archdiocese Learning Management System"
      slugLabel={parish}
      endpoint={`/${parish}/parish-admin/login`}
      role="parish-admin"
      parishSlug={parish}
      footer={
        <div className="login-foot">
          New here? Your parish admin sends a verification link to{" "}
          <Link href={`/${parish}/parish-admin/set-password`}>set your password</Link>.
        </div>
      }
    />
  );
}
