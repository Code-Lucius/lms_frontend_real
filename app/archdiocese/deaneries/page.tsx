import { auth } from "@/auth";
import { Deaneries } from "@/components/archdiocese/Deaneries";

export default async function Page() {
  const session = await auth();
  return <Deaneries canManage={session?.adminType === "super"} />;
}
