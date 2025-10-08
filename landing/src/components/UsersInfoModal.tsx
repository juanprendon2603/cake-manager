import { ClipboardCheck, KeyRound, Mail, Shield, User } from "lucide-react";
import { useCallback } from "react";
import BaseModal from "./BaseModal";

type ProfilesMap = Record<
  string,
  {
    displayName?: string;
    firstName?: string;
    lastName?: string;
  }
>;

export interface DemoSeed {
  admins: string[];
  allowlist: string[];
  profiles: ProfilesMap;
  initialized?: boolean;
}

interface UsersInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  demoUrl: string;
  seed: DemoSeed;
}

export default function UsersInfoModal({
  isOpen,
  onClose,
  demoUrl,
  seed,
}: UsersInfoModalProps) {
  const { admins = [], allowlist = [], profiles = {} } = seed;

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copiado al portapapeles ✅");
    } catch {
      console.warn("No se pudo copiar");
    }
  }, []);

  const openDemo = useCallback(() => {
    window.open(demoUrl, "_blank", "noopener,noreferrer");
    onClose();
  }, [demoUrl, onClose]);

  const users = allowlist.map((email) => ({
    email,
    role: admins.includes(email) ? "Admin" : "Operación",
    profile: profiles[email],
  }));

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      headerAccent="purple"
      size="lg"
      title={
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#8E2DA8]" />
          <span>Acceso al demo</span>
        </div>
      }
      description="Elige con qué usuario ingresar al demo. Puedes copiar el correo y usar la contraseña indicada."
      primaryAction={{ label: "Ir al demo", onClick: openDemo }}
      secondaryAction={{ label: "Cerrar", onClick: onClose }}
      bodyClassName="space-y-5"
      icon={<Shield className="w-5 h-5" />}
    >
      {/* Descripción */}
      <div className="rounded-2xl border border-white/60 bg-white/80 backdrop-blur p-4 text-sm text-gray-700">
        <p className="font-semibold mb-1">Tipos de usuario:</p>
        <ul className="space-y-1">
          <li>
            • <strong>Admin</strong>: configura catálogo, usuarios y reportes.
          </li>
          <li>
            • <strong>Operación</strong>: registra ventas, abonos y asistencia.
          </li>
        </ul>
      </div>

      {/* Lista de usuarios */}
      <div className="grid sm:grid-cols-2 gap-4">
        {users.map(({ email, role, profile }) => {
          const name =
            profile?.displayName ||
            [profile?.firstName, profile?.lastName].filter(Boolean).join(" ") ||
            email.split("@")[0];
          const isAdmin = role === "Admin";

          return (
            <div
              key={email}
              className="rounded-2xl border border-white/60 bg-white/90 backdrop-blur p-4 shadow"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-10 h-10 rounded-xl grid place-items-center text-white shadow
                    ${
                      isAdmin
                        ? "bg-gradient-to-br from-indigo-500 to-blue-500"
                        : "bg-gradient-to-br from-emerald-500 to-teal-500"
                    }`}
                >
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-semibold text-gray-800">{name}</div>
                  <div className="text-xs text-gray-500">{role}</div>
                </div>
              </div>

              <div className="mt-3 flex items-center gap-2 text-sm text-gray-700">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>{email}</span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-sm text-gray-700">
                <KeyRound className="w-4 h-4 text-gray-500" />
                <span className="font-mono">123456</span>
              </div>

              <button
                onClick={() => copy(email)}
                className="mt-4 inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50"
              >
                <ClipboardCheck className="w-4 h-4" />
                Copiar correo
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-xs text-gray-500 text-center">
        Todos los usuarios del demo usan la contraseña <strong>123456</strong>
      </div>
    </BaseModal>
  );
}
