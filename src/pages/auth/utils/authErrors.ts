// FILE: src/features/auth/utils/authErrors.ts
export function getErrorCode(e: unknown): string | undefined {
  return typeof e === "object" && e && "code" in e
    ? String((e as { code?: unknown }).code)
    : undefined;
}

export function fbErrorToMessage(code?: string) {
  switch (code) {
    case "auth/invalid-email":
      return "Correo inválido.";
    case "auth/user-disabled":
      return "Usuario deshabilitado.";
    case "auth/user-not-found":
      return "No existe una cuenta con ese correo.";
    case "auth/wrong-password":
      return "Contraseña incorrecta.";
    case "auth/too-many-requests":
      return "Demasiados intentos. Intenta más tarde.";
    case "auth/email-already-in-use":
      return "Ese correo ya está registrado.";
    case "auth/weak-password":
      return "La contraseña es muy débil.";
    default:
      return "Algo salió mal. Intenta de nuevo.";
  }
}

export const toLowerTrim = (v: unknown) => String(v).toLowerCase().trim();
export const normalizeList = (arr: unknown[]): string[] => arr.map(toLowerTrim);
