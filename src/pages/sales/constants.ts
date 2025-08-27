export const productTypes = [
    { id: "cake", label: "Cake", icon: "🎂", gradient: "from-pink-500 to-rose-500", bgGradient: "from-pink-50 to-rose-50" },
    { id: "sponge", label: "Sponge", icon: "🧁", gradient: "from-amber-500 to-orange-500", bgGradient: "from-amber-50 to-orange-50" },
  ] as const;
  
  export const cakeSizes = [
    "octavo",
    "cuarto_redondo",
    "cuarto_cuadrado",
    "por_dieciocho",
    "media",
    "libra",
    "libra_y_media",
    "dos_libras",
  ] as const;
  export type CakeSizeKey = typeof cakeSizes[number];
  
  export const spongeSizes = ["media", "libra"] as const;
  export type SpongeSizeKey = typeof spongeSizes[number];
  
  export const cakeFlavors = [
    { id: "naranja", label: "Naranja", icon: "🍊" },
    { id: "vainilla_chips", label: "Vainilla Chips", icon: "🍦" },
    { id: "vainilla_chocolate", label: "Vainilla Chocolate", icon: "🍫" },
    { id: "negra", label: "Negra", icon: "🖤" },
  ] as const;
  export type CakeFlavorKey = typeof cakeFlavors[number]["id"];
  
  export const spongeTypes = [
    { id: "fría", label: "Fría", icon: "❄️" },
    { id: "genovesa", label: "Genovesa", icon: "🌟" },
  ] as const;
  export type SpongeTypeKey = typeof spongeTypes[number]["id"];
  
  export const sizeEmojis: Record<CakeSizeKey, string> = {
    octavo: "🧁",
    cuarto_redondo: "🎂",
    cuarto_cuadrado: "🍰",
    por_dieciocho: "🎉",
    media: "🍰",
    libra: "🎂",
    libra_y_media: "🎂",
    dos_libras: "🎂",
  };
  
  export const defaultPrices = {
    cake: {
      octavo: { naranja: 10000, vainilla_chips: 10000, vainilla_chocolate: 10000, negra: 12000 },
      cuarto_redondo: { naranja: 15000, vainilla_chips: 15000, vainilla_chocolate: 15000, negra: 18000 },
      cuarto_cuadrado: { naranja: 18000, vainilla_chips: 18000, vainilla_chocolate: 18000, negra: 20000 },
      por_dieciocho: { naranja: 24000, vainilla_chips: 24000, vainilla_chocolate: 24000, negra: 28000 },
      media: { naranja: 30000, vainilla_chips: 30000, vainilla_chocolate: 30000, negra: 40000 },
      libra: { naranja: 40000, vainilla_chips: 40000, vainilla_chocolate: 40000, negra: 50000 },
      libra_y_media: { naranja: 60000, vainilla_chips: 60000, vainilla_chocolate: 60000, negra: 70000 },
      dos_libras: { naranja: 80000, vainilla_chips: 80000, vainilla_chocolate: 80000, negra: 90000 },
    } satisfies Record<CakeSizeKey, Record<CakeFlavorKey, number>>,
    sponge: {
      media: { fría: 35000, genovesa: 50000 },
      libra: { fría: 45000, genovesa: 70000 },
    } satisfies Record<SpongeSizeKey, Record<SpongeTypeKey, number>>,
  };
  
  export function getEmoji(size: string, productType: string | null) {
    if (productType === "cake" && size in sizeEmojis) {
      return sizeEmojis[size as CakeSizeKey];
    }
    return "🧁";
  }
  
  const normalize = (s: string) =>
    s
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") 
      .replace(/\s+/g, "_");
  
  function findKey<T extends Record<string, unknown>>(obj: T, key: string): keyof T | undefined {
    const nk = normalize(key);
    return Object.keys(obj).find((k) => normalize(k) === nk) as keyof T | undefined;
  }
  
  export function getBasePrice(
    productType: "cake" | "sponge" | null,
    size?: string | null,
    flavor?: string | null
  ): number {
    if (!productType || !size || !flavor) return 0;
  
    if (productType === "cake") {
      const cakeObj = defaultPrices.cake as Record<string, Record<string, number>>;
      const realSize = findKey(cakeObj, size);
      if (!realSize) {
        console.warn("getBasePrice: size not found for cake", { size });
        return 0;
      }
      const flavorsObj = cakeObj[realSize];
      const realFlavor = findKey(flavorsObj, flavor);
      if (!realFlavor) {
        console.warn("getBasePrice: flavor not found for cake", { flavor, realSize });
        return 0;
      }
      return flavorsObj[realFlavor] ?? 0;
    }
  
    if (productType === "sponge") {
      const spongeObj = defaultPrices.sponge as Record<string, Record<string, number>>;
      const realSize = findKey(spongeObj, size);
      if (!realSize) {
        console.warn("getBasePrice: size not found for sponge", { size });
        return 0;
      }
      const typesObj = spongeObj[realSize];
      const realType = findKey(typesObj, flavor);
      if (!realType) {
        console.warn("getBasePrice: type not found for sponge", { flavor, realSize });
        return 0;
      }
      return typesObj[realType] ?? 0;
    }
  
    return 0;
  }
  
  