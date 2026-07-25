import { auth } from "@/auth";
import { Admins } from "@/components/archdiocese/Admins";

export default async function Page() {
  const session = await auth();
  return <Admins canManage={session?.adminType === "super"} />;
}
