"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Arch, IconLock } from "@/components/icons";

export default function SetPasswordPage({ params }: { params: { parish: string } }) {
  const router = useRouter();
  const [pw1, setPw1] = useState("");
  const [pw2, setPw2] = useState("");

  let hint = "";
  let hintOk = false;
  if (pw1 && pw1.length < 8) hint = "Password must be at least 8 characters.";
  else if (pw1 && pw2 && pw1 !== pw2) hint = "Passwords don\u2019t match yet.";
  else if (pw1 && pw2) { hint = "Looks good."; hintOk = true; }
  const valid = pw1.length >= 8 && pw1 === pw2;

  function finish(e: React.FormEvent) {
    e.preventDefault();
    if (valid) router.push("/parishioner");
  }

  return (
    <section className="screen active">
      <div id="login-bg">
        <div className="login-card">
          <Arch style={{ margin: "-2px auto 0" }} />
          <div className="crest">&#10013;</div>
          <h1 className="parish-name">Welcome, Maria</h1>
          <div className="parish-sub">Set a password to finish joining the parish</div>
          <div className="slug-chip"><IconLock width={13} height={13} /> Verified link &middot; <b>{params.parish}</b></div>
          <form onSubmit={finish} style={{ textAlign: "left" }}>
            <div className="field">
              <label>New password</label>
              <input type="password" placeholder="At least 8 characters" value={pw1} onChange={(e) => setPw1(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 8 }}>
              <label>Confirm password</label>
              <input type="password" placeholder="Re-enter your password" value={pw2} onChange={(e) => setPw2(e.target.value)} />
            </div>
            <div style={{ fontSize: 12, color: hintOk ? "var(--sage)" : "var(--muted)", marginBottom: 16, minHeight: 16 }}>{hint}</div>
            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={!valid}>Set password &amp; continue</button>
          </form>
          <div className="login-foot">Already set a password? <Link href={`/${params.parish}/login`}>Sign in instead</Link></div>
        </div>
      </div>
    </section>
  );
}
