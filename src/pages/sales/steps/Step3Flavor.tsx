import { motion } from "framer-motion";
import { cakeFlavors, spongeTypes } from "../constants";
import { pageVariants, containerStagger, itemVariants } from "../animations";

type Props = {
  productType: string | null;
  flavor: string | null;
  onSelectFlavor: (flavor: string) => void;
  onBack: () => void;
};

export default function Step3Flavor({ productType, flavor, onSelectFlavor, onBack }: Props) {
  const isCake = productType === "cake";

  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className={isCake ? "grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto" : "grid grid-cols-2 gap-6 max-w-2xl mx-auto"}
      >
        {isCake
          ? cakeFlavors.map((f) => {
              const selected = flavor === f.id;
              return (
                <motion.button
                  key={f.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectFlavor(f.id)}
                  className={`relative rounded-2xl p-6 text-center font-semibold transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center overflow-hidden group ${
                    selected
                      ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl"
                      : "bg-white/70 backdrop-blur border-2 border-purple-200 text-gray-800 hover:border-purple-400"
                  }`}
                >
                  <div className="text-2xl mb-2">{f.icon}</div>
                  <span className="text-sm font-bold leading-tight">{f.label}</span>
                  {!selected && <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />}
                </motion.button>
              );
            })
          : spongeTypes.map((t) => {
              const selected = flavor === t.id;
              return (
                <motion.button
                  key={t.id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.05, y: -3 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onSelectFlavor(t.id)}
                  className={`relative rounded-2xl p-6 text-center font-semibold transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center overflow-hidden group ${
                    selected
                      ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-xl"
                      : "bg-white/70 backdrop-blur border-2 border-amber-200 text-gray-800 hover:border-amber-400"
                  }`}
                >
                  <div className="text-2xl mb-2">{t.icon}</div>
                  <span className="text-sm font-bold">{t.label}</span>
                  {!selected && <div className="absolute inset-0 bg-gradient-to-br from-amber-500 to-orange-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />}
                </motion.button>
              );
            })}
      </motion.div>

      <div className="mt-8 flex justify-center">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onBack}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Volver a tamaño
        </motion.button>
      </div>
    </motion.div>
  );
}