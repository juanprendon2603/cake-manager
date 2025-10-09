// landing/src/components/demoModalContext.ts
import { createContext } from "react";

export type DemoModalApi = { openDemo: () => void; closeDemo: () => void };
export const DemoModalCtx = createContext<DemoModalApi | null>(null);
