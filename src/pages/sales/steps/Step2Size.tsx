import { motion } from "framer-motion";
import { cakeSizes, spongeSizes, getEmoji } from "../constants";
import { pageVariants, containerStagger, itemVariants } from "../animations";

type Props = {
  productType: string | null;
  size: string | null;
  onSelectSize: (size: string) => void;
  onBack: () => void;
};

export default function Step2Size({ productType, size, onSelectSize, onBack }: Props) {
  const sizes = productType === "cake" ? cakeSizes : spongeSizes;
  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 max-w-4xl mx-auto"
      >
        {sizes.map((s) => {
          const selected = size === s;
          const emoji = getEmoji(s, productType);
          return (
            <motion.button
              key={s}
              variants={itemVariants}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onSelectSize(s)}
              className={`relative rounded-2xl p-6 text-center font-semibold transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center overflow-hidden group ${
                selected
                  ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-xl"
                  : "bg-white/70 backdrop-blur border-2 border-purple-200 text-gray-800 hover:border-purple-400"
              }`}
            >
              <div className="text-2xl mb-2">{emoji}</div>
              <span className="text-sm font-bold capitalize leading-tight">{s.replace(/_/g, " ")}</span>
              {!selected && (
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 opacity-0 group-hover:opacity-10 transition-opacity duration-300" />
              )}
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
          Volver a tipo de producto
        </motion.button>
      </div>
    </motion.div>
  );
}