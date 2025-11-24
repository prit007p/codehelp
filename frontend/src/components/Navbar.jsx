// File: src/components/ui/Navbar.jsx

import { Button } from "@/components/ui/button"
import { Menu, Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { useTheme } from "@/components/theme-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNavigate } from "react-router-dom"
import Profile from "./Profile"

function ModeToggle() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [active, setActive] = useState("Docs")
  const navItems = ["Home", "Problems",  "Chats", "Submission"]
  const navigate = useNavigate()

  // Map nav item names to their routes
  const navRoutes = {
    Home: "/",
    Problems: "/problems",
    Chats: "/Chats",
    Submission: "/submission",
    Profile :"/profile"
  }

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-sm px-6 py-3",
        scrolled ? "bg-background/90 shadow-md" : "bg-background/30",
        "dark:bg-[#000000] dark:border-[#000000]" // Custom dark mode color
      )}
    >
      <div className="max-w-screen-xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Menu className="md:hidden cursor-pointer" onClick={() => setOpen(!open)} />
          <motion.div
            whileHover={{ rotate: 90}}
            transition={{ type: "spring", stiffness: 300 }}
            className="w-5 h-5 border-[3px] border-primary rounded-sm rotate-45"
          />
        </div>

        <nav className="hidden md:flex gap-4 font-medium text-sm relative">
          {navItems.map((item) => (
            <motion.button
              key={item}
              onClick={() => {
                setActive(item)
                if (navRoutes[item]) navigate(navRoutes[item])
              }}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "relative transition-colors duration-200 px-1 text-primary"
              )}
            >
              {item}
              <AnimatePresence>
                {active === item && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute bottom-[-4px] left-0 w-full h-[2px] bg-primary rounded"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </nav>
        <div className="flex items-center gap-4 ">
          <motion.button
          whileHover={{ scale: 1.05 }}
          className="font-medium text-sm px-1 text-primary"
          onClick={()=>{
            if (navRoutes["Profile"]) navigate(navRoutes["Profile"])
          }}
          >
            Profile
          </motion.button>
          <ModeToggle />
        </div>
      </div>
    </motion.header>
  )
}


export default Navbar;