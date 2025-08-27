import { motion } from "framer-motion";
import { productTypes } from "../constants";
import { pageVariants, containerStagger, itemVariants } from "../animations";

type ProductType = "cake" | "sponge";

type Props = {
  onSelectProductType: (type: ProductType) => void;
};

export default function Step1ProductType({ onSelectProductType }: Props) {
  return (
    <motion.div variants={pageVariants} initial="initial" animate="enter" exit="exit">
      <motion.div
        variants={containerStagger}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 gap-8 max-w-2xl mx-auto"
      >
        {productTypes.map((pt) => (
          <motion.button
            key={pt.id}
            variants={itemVariants}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectProductType(pt.id as ProductType)}
            className="relative rounded-2xl p-8 text-center font-bold text-lg transition-all duration-300 overflow-hidden group"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${pt.bgGradient} opacity-50`} />
            <div className={`absolute inset-x-0 top-0 h-16 bg-gradient-to-r ${pt.gradient} opacity-20`} />
            <div className="relative z-10">
              <div className="text-4xl mb-3">{pt.icon}</div>
              <h3 className="text-xl font-extrabold text-gray-800 mb-2">{pt.label}</h3>
              <p className="text-sm text-gray-600">
                {pt.id === "cake" ? "Tortas con diferentes sabores" : "Bizcochos especiales"}
              </p>
            </div>
            <div className={`absolute inset-0 bg-gradient-to-r ${pt.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}