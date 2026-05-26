// File: src/components/magicui/Globe.jsx

import { motion } from "framer-motion"

export function Globe() {
  return (
    <div className="relative flex min-h-[16rem] w-full items-center justify-center rounded-lg bg-black text-white sm:min-h-[22rem] md:min-h-[28rem]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
        className="flex h-40 w-40 items-center justify-center rounded-full border border-cyan-400 text-xl font-bold sm:h-48 sm:w-48 sm:text-2xl"
      >
        🌍 Magic Globe
      </motion.div>
    </div>
  )
}

// Optional: Export default for easier import
export default Globe
