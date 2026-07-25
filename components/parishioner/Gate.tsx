import { Arch, IconLock } from "@/components/icons";

export function Gate({ parishName }: { parishName: string }) {
  return (
    <div id="gate-bg" style={{ minHeight: "60vh" }}>
      <div className="card gate-card">
        <Arch style={{ margin: "-2px auto 6px" }} />
        <div className="icon"><IconLock width={28} height={28} /></div>
        <h1>Your parish is paused for now</h1>
        <p>{parishName}&rsquo;s subscription is currently inactive, so course content and exams are temporarily unavailable.</p>
        <p>Nothing you&rsquo;ve done is lost &mdash; your progress and results are safe and will return the moment the parish is reactivated.</p>
        <div className="contact"><b>Reach your parish admin</b>John Adeyemi &middot; admin@stpeter.org</div>
      </div>
    </div>
  );
}
