import { auth } from "@/auth";
import { Materials } from "@/components/archdiocese/Material";

export default async function Page() {
  const session = await auth();
  return <Materials canManage={session?.adminType === "super"} />;
}