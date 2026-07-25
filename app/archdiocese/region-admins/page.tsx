import { auth } from "@/auth";
import { RegionAdmins } from "@/components/archdiocese/RegionAdmins";

export default async function Page() {
  const session = await auth();
  return <RegionAdmins canManage={session?.adminType === "super"} />;
}
