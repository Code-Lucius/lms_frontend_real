import { auth } from "@/auth";
import { Regions } from "@/components/archdiocese/Regions";

export default async function Page() {
  const session = await auth();
  return <Regions canManage={session?.adminType === "super"} />;
}
