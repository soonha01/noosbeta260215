import { motion } from "framer-motion";

export default function FadeTransitionOverlay({ active = true }) {
  return (
    <motion.div
      aria-hidden="true"
      className="fixed inset-0 z-[90] bg-black"
      initial={{ opacity: 0 }}
      animate={{ opacity: active ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.48, ease: "easeInOut" }}
      style={{ pointerEvents: active ? "auto" : "none" }}
    />
  );
}
