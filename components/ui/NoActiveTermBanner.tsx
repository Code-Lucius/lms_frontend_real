export function NoActiveTermBanner() {
  return (
    <div
      role="alert"
      style={{
        background: "var(--amber-soft, #fef3c7)",
        color: "var(--amber-ink, #92400e)",
        border: "1px solid var(--amber-ink, #92400e)",
        borderRadius: 10,
        padding: "14px 16px",
        fontSize: 13.5,
        marginBottom: 18,
      }}
    >
      There&rsquo;s no active academic term right now, so new enrolments, exercises, and exams can&rsquo;t be started. Please check back soon or contact your parish admin.
    </div>
  );
}