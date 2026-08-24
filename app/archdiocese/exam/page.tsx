import { Exam } from "@/components/archdiocese/Exam";
import { auth } from "@/auth";

export default async function Page() {
  const session = await auth();

  return <Exam canManage={session?.adminType === "super"}/>;
}