import { auth } from "@/auth";
import { DeaneryAdmins } from "@/components/archdiocese/DeaneryAdmins";

export default async function Page() {
  const session = await auth();
  return <DeaneryAdmins canManage={session?.adminType === "super"} />;
}
