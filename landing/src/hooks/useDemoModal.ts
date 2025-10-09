// landing/src/components/useDemoModal.ts
import { useContext } from "react";
import { DemoModalCtx } from "../components/demoModalContext";

export function useDemoModal() {
  const ctx = useContext(DemoModalCtx);
  if (!ctx) throw new Error("useDemoModal debe usarse dentro de <DemoModalProvider>");
  return ctx;
}
