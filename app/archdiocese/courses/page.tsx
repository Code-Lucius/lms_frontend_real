import { auth } from "@/auth";
import { Courses } from "@/components/archdiocese/Courses";

export default async function Page() {
  const session = await auth();
  return <Courses canManage={session?.adminType === "super"} />;
}
