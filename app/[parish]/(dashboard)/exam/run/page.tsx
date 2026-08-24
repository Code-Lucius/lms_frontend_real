"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ExamRun } from "@/components/parishioner/ExamRun";
import { subRows } from "@/lib/data";

function ExamRunInner({ parishSlug }: { parishSlug: string }) {
  const searchParams = useSearchParams();
  const examUuid = searchParams.get("exam");
  const row = subRows.find((r) => r.slug === parishSlug);

  if (!examUuid) {
    return (
      <div className="card panel">
        <p>No exam was specified.</p>
      </div>
    );
  }

  return <ExamRun examUuid={examUuid} parishName={row ? row.p : parishSlug} parishSlug={parishSlug} />;
}

export default function Page({ params }: { params: { parish: string } }) {
  return (
    <Suspense fallback={null}>
      <ExamRunInner parishSlug={params.parish} />
    </Suspense>
  );
}