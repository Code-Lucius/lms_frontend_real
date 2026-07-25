import { auth } from "@/auth";
import { Topics } from "@/components/archdiocese/Topics";

export default async function Page() {
  const session = await auth();
  return <Topics canManage={session?.adminType === "super"} />;
}