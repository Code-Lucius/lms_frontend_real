import { auth } from "@/auth";
import { Questions } from "@/components/archdiocese/Questions";

export default async function Page() {
  const session = await auth();
  return <Questions canManage={session?.adminType === "super"} />;
}
