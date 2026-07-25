import { auth } from "@/auth";
import { Modules } from "@/components/archdiocese/Modules";

export default async function Page() {
  const session = await auth();
  return <Modules canManage={session?.adminType === "super"} />;
}