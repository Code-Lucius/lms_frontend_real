import { auth } from "@/auth";
import { Exercises } from "@/components/archdiocese/Exercise";

export default async function Page() {
  const session = await auth();
  return <Exercises canManage={session?.adminType === "super"} />;
}