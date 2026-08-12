// import { Suspense } from "react";
// import { SetPasswordForm } from "@/components/auth/set-password-form";

// export default function Page({ params }: { params: { parish: string } }) {
//   return (
//     <Suspense fallback={null}>
//       <SetPasswordForm
//         title="Parishioner"
//         subtitle="Set your password"
//         slugLabel="Parish"
//         endpoint="/reset-password"
//         role="parishioner"
//         parishSlug={params.parish}
//         requiredParams={["parish_code", "expires", "signature"]}
//         pathParam="parish_code"
//         queryParams={["expires", "signature"]}
//         bodyParams={[]}
//       />
//     </Suspense>
//   );
// }

import { Suspense } from "react";
import { SetPasswordForm } from "@/components/auth/set-password-form";

export default function Page({ params }: { params: { parish: string; code: string } }) {
  return (
    <Suspense fallback={null}>
      <SetPasswordForm
        title="Parishioner"
        subtitle="Set your password"
        slugLabel="Parish"
        endpoint={`/${params.parish}/reset-password`}
        role="parishioner"
        parishSlug={params.parish}
        pathParamValue={params.code}
        pathParam="parish_code"
        requiredParams={["expires", "signature"]}
        queryParams={["expires", "signature"]}
        bodyParams={[]}
      />
    </Suspense>
  );
}