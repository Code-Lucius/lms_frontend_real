import { auth } from "@/auth";
import { TermPanel } from "@/components/archdiocese/Term";

export default async function Page() {
  const session = await auth();
  return <TermPanel canManage={session?.adminType === "super"} />;
}