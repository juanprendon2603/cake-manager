// landing/src/components/DemoModalProvider.tsx
import { ReactNode, useMemo, useState } from "react";
import UsersInfoModal, { DemoSeed } from "./UsersInfoModal";
import { DemoModalCtx } from "./demoModalContext";

const seed: DemoSeed = {
  admins: ["admin@admin.com"],
  allowlist: ["admin@admin.com", "usuario@usuario.com"],
  profiles: {
    "admin@admin.com": { displayName: "Admin Prueba", firstName: "Admin", lastName: "Prueba" },
    "usuario@usuario.com": { displayName: "Usuario Prueba", firstName: "Usuario", lastName: "Prueba" },
  },
  initialized: true,
};

export default function DemoModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);

  const api = useMemo(() => ({
    openDemo: () => setOpen(true),
    closeDemo: () => setOpen(false),
  }), []);

  return (
    <DemoModalCtx.Provider value={api}>
      {children}
      <UsersInfoModal
        isOpen={open}
        onClose={() => setOpen(false)}
        demoUrl="https://inmanager-b5f4c.web.app"
        seed={seed}
      />
    </DemoModalCtx.Provider>
  );
}
