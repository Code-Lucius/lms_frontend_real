import { auth } from "@/auth";
import { Parishes } from "@/components/archdiocese/Parishes";

export default async function Page() {
  const session = await auth();
  return <Parishes canManage={session?.adminType === "super"} />;
}
