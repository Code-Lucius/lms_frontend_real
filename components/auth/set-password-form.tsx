// "use client";

// import { useState, useTransition } from "react";
// import { useSearchParams } from "next/navigation";
// import { Arch } from "@/components/icons";
// import { setPassword } from "@/app/actions/set-password";
// import type { Role } from "@/types/next-auth";

// interface SetPasswordFormProps {
//   title: string;
//   subtitle: string;
//   slugLabel: string;
//   endpoint: string;
//   role: Role;
//   parishSlug?: string;
//   footer?: React.ReactNode;
// }

// export function SetPasswordForm({ title, subtitle, slugLabel, endpoint, role, parishSlug, footer }: SetPasswordFormProps) {
//   const searchParams = useSearchParams();
//   const token = searchParams.get("token") ?? "";
//   const signature = searchParams.get("signature") ?? "";
//   const linkInvalid = !token || !signature;

//   const [password, setPasswordValue] = useState("");
//   const [passwordConfirmation, setPasswordConfirmation] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
//   const [isPending, startTransition] = useTransition();

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     setError(null);
//     setFieldErrors({});

//     if (password !== passwordConfirmation) {
//       setError("Passwords don't match.");
//       return;
//     }

//     startTransition(async () => {
//       const result = await setPassword({ endpoint, token, signature, password, passwordConfirmation, role, parishSlug });
//       // On success, setPassword() redirects server-side and never returns here.
//       if (result && !result.success) {
//         setError(result.message ?? "Something went wrong. Please try again.");
//         setFieldErrors(result.fieldErrors ?? {});
//       }
//     });
//   }

//   if (linkInvalid) {
//     return (
//       <section className="screen active">
//         <div id="login-bg">
//           <div className="login-card">
//             <Arch style={{ margin: "-2px auto 0" }} />
//             <div className="crest">&#10013;</div>
//             <h1 className="parish-name">{title}</h1>
//             <p style={{ fontSize: 13.5, color: "#b91c1c", marginTop: 12 }}>
//               This link is missing required information and can&rsquo;t be used. Please use the link from your invitation email directly, or contact your admin for a new one.
//             </p>
//           </div>
//         </div>
//       </section>
//     );
//   }

//   return (
//     <section className="screen active">
//       <div id="login-bg">
//         <div className="login-card">
//           <Arch style={{ margin: "-2px auto 0" }} />
//           <div className="crest">&#10013;</div>
//           <h1 className="parish-name">{title}</h1>
//           <div className="parish-sub">{subtitle}</div>
//           <div className="slug-chip">
//             &#128205; yourdomain.org / <b>{slugLabel}</b> / set password
//           </div>

//           <form onSubmit={handleSubmit}>
//             <div className="field" style={{ marginBottom: 10 }}>
//               <label htmlFor="password">New password</label>
//               <input
//                 id="password"
//                 type="password"
//                 autoComplete="new-password"
//                 value={password}
//                 onChange={(e) => setPasswordValue(e.target.value)}
//                 disabled={isPending}
//                 required
//                 minLength={8}
//               />
//               {fieldErrors.password && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.password[0]}</div>}
//             </div>
//             <div className="field" style={{ marginBottom: 10 }}>
//               <label htmlFor="password_confirmation">Confirm password</label>
//               <input
//                 id="password_confirmation"
//                 type="password"
//                 autoComplete="new-password"
//                 value={passwordConfirmation}
//                 onChange={(e) => setPasswordConfirmation(e.target.value)}
//                 disabled={isPending}
//                 required
//                 minLength={8}
//               />
//             </div>

//             {error && (
//               <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 14 }}>
//                 {error}
//               </div>
//             )}

//             <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isPending}>
//               {isPending ? "Setting password\u2026" : "Set password & continue"}
//             </button>
//           </form>

//           {footer}
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import { useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { Arch } from "@/components/icons";
import { setPassword } from "@/app/actions/set-password";
import type { Role } from "@/types/next-auth";

interface SetPasswordFormProps {
  title: string;
  subtitle: string;
  slugLabel: string;
  endpoint: string;
  role: Role;
  parishSlug?: string;
  footer?: React.ReactNode;
  requiredParams?: string[]; // query params to read from the URL and require present
  pathParam?: string; // key name to send the path value under
  pathParamValue?: string; // the actual value, e.g. params.code from a dynamic route segment
  queryParams?: string[];
  bodyParams?: string[];
}

export function SetPasswordForm({
  title,
  subtitle,
  slugLabel,
  endpoint,
  role,
  parishSlug,
  footer,
  requiredParams = ["token", "signature"],
  pathParam,
  pathParamValue,
  queryParams,
  bodyParams,
}: SetPasswordFormProps) {
  const searchParams = useSearchParams();

  const linkParams: Record<string, string> = {};
  for (const key of requiredParams) {
    linkParams[key] = searchParams.get(key) ?? "";
  }
  if (pathParam && pathParamValue) {
    linkParams[pathParam] = pathParamValue;
  }

  const linkInvalid =
    requiredParams.some((key) => !linkParams[key]) || (!!pathParam && !pathParamValue);

  const [password, setPasswordValue] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setFieldErrors({});

    if (password !== passwordConfirmation) {
      setError("Passwords don't match.");
      return;
    }

    startTransition(async () => {
      const result = await setPassword({
        endpoint,
        linkParams,
        pathParam,
        queryParams,
        bodyParams,
        password,
        passwordConfirmation,
        role,
        parishSlug,
      });
      if (result && !result.success) {
        setError(result.message ?? "Something went wrong. Please try again.");
        setFieldErrors(result.fieldErrors ?? {});
      }
    });
  }

  if (linkInvalid) {
    return (
      <section className="screen active">
        <div id="login-bg">
          <div className="login-card">
            <Arch style={{ margin: "-2px auto 0" }} />
            <div className="crest">&#10013;</div>
            <h1 className="parish-name">{title}</h1>
            <p style={{ fontSize: 13.5, color: "#b91c1c", marginTop: 12 }}>
              This link is missing required information and can&rsquo;t be used. Please use the link from your invitation email directly, or contact your admin for a new one.
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="screen active">
      <div id="login-bg">
        <div className="login-card">
          <Arch style={{ margin: "-2px auto 0" }} />
          <div className="crest">&#10013;</div>
          <h1 className="parish-name">{title}</h1>
          <div className="parish-sub">{subtitle}</div>
          <div className="slug-chip">
            &#128205; yourdomain.org / <b>{slugLabel}</b> / set password
          </div>

          <form onSubmit={handleSubmit}>
            <div className="field" style={{ marginBottom: 10 }}>
              <label htmlFor="password">New password</label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPasswordValue(e.target.value)}
                disabled={isPending}
                required
                minLength={8}
              />
              {fieldErrors.password && <div style={{ color: "#b91c1c", fontSize: 12 }}>{fieldErrors.password[0]}</div>}
            </div>
            <div className="field" style={{ marginBottom: 10 }}>
              <label htmlFor="password_confirmation">Confirm password</label>
              <input
                id="password_confirmation"
                type="password"
                autoComplete="new-password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                disabled={isPending}
                required
                minLength={8}
              />
            </div>

            {error && (
              <div role="alert" style={{ color: "#b91c1c", fontSize: 12.5, marginBottom: 14 }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={isPending}>
              {isPending ? "Setting password\u2026" : "Set password & continue"}
            </button>
          </form>

          {footer}
        </div>
      </div>
    </section>
  );
}