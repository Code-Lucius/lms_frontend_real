import { LoginForm } from "@/components/auth/login-form";
import { subRows } from "@/lib/data";

export default function Page({ params }: { params: { parish: string } }) {
  const { parish } = params;
  const row = subRows.find((r) => r.slug === parish);
  const parishName = row ? row.p : "Your parish";

  return (
    <LoginForm
      title={`${parishName} \u2014 Admin`}
      subtitle="Archdiocese Learning Management System"
      slugLabel={`${parish} / admin`}
      endpoint={`/${parish}/parish-admin/login`}
      role="parish-admin"
      parishSlug={parish}
    />
  );
}
