// Constantes y helpers de UI

export const SPONGE_TYPES = ["fría", "genovesa"] as const;

export const SIZE_OPTIONS: Record<"cake" | "sponge", string[]> = {
  cake: [
    "octavo",
    "cuarto_redondo",
    "cuarto_cuadrado",
    "por_dieciocho",
    "media",
    "libra",
    "libra_y_media",
    "dos_libras",
  ],
  sponge: ["media", "libra"],
};

export const FLAVOR_OPTIONS_CAKE = [
  "naranja",
  "vainilla_chips",
  "vainilla_chocolate",
  "negra",
];
