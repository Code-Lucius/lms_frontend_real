"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type SubCtx = { active: boolean; setActive: (v: boolean) => void };
const Ctx = createContext<SubCtx>({ active: true, setActive: () => {} });

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(true);
  return <Ctx.Provider value={{ active, setActive }}>{children}</Ctx.Provider>;
}

export function useSubscription() {
  return useContext(Ctx);
}
