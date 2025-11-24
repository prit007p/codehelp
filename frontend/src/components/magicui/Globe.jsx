// File: src/components/magicui/Globe.jsx

import { motion } from "framer-motion"

export function Globe() {
  return (
    <div className="relative flex items-center justify-center h-screen bg-black text-white">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="w-48 h-48 rounded-full border border-cyan-400 flex items-center justify-center text-2xl font-bold"
      >
        🌍 Magic Globe
      </motion.div>
    </div>
  )
}

// Optional: Export default for easier import
export default Globe
