import React from 'react'
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Home = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative flex flex-col items-center justify-center min-h-[calc(100vh-3.6rem)] text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-black"
    >
      <div className="max-w-3xl mx-auto z-10">
        <motion.h1 
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-5xl md:text-7xl font-extrabold text-gray-900 dark:text-white leading-tight mb-4"
        >
          Unleash Your Coding Potential
        </motion.h1>
        <motion.p 
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8, type: "spring", stiffness: 100 }}
          className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8"
        >
          Solve challenging problems, discuss solutions, and track your progress in a vibrant coding community.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Link to="/problems">
            <Button size="lg" className="px-8 py-3 text-lg">Browse Problems</Button>
          </Link>
          <Link to="/register">
            <Button size="lg" variant="outline" className="px-8 py-3 text-lg">Join Community</Button>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default Home;