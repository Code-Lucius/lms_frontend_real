"use client";

import { IconCheck, IconAlert } from "@/components/icons";
import { useSubscription } from "@/lib/subscription";

// Self-contained (reads the subscription context directly) so it can be
// rendered once from the parish-admin layout and appear above every page,
// without needing prop drilling from a Server Component.
export function SubBar() {
  const { active } = useSubscription();
  return active ? (
    <div className="subbar ok"><IconCheck className="ic" /> Subscription active &middot; renews 31 Dec 2026 &middot; Standard tier. You can view this but only the archdiocese can change it.</div>
  ) : (
    <div className="subbar warn"><IconAlert className="ic" /> Subscription inactive &middot; parishioners are currently blocked from courses and exams. Contact the archdiocese to reactivate.</div>
  );
}
