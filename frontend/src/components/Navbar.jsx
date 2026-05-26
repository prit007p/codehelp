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
import { useLocation } from "react-router-dom"
import { Show, SignInButton, SignUpButton, UserButton } from "@clerk/react"

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
  const navItems = ["Home", "Problems",  "Chats", "Submission"]
  const navigate = useNavigate()
  const location = useLocation()

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

  const isActive = (item) => {
    const route = navRoutes[item];
    if (!route) return false;
    if (route === "/") return location.pathname === "/";
    return location.pathname.toLowerCase().startsWith(route.toLowerCase());
  }

  const goTo = (item) => {
    if (navRoutes[item]) {
      navigate(navRoutes[item]);
      setOpen(false);
    }
  }

  return (
    <motion.header
      initial={{ y: -50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={cn(
        "sticky top-0 z-50 w-full border-b backdrop-blur-sm px-3 py-3 sm:px-5 lg:px-6",
        scrolled ? "bg-background/90 shadow-md" : "bg-background/30",
        "dark:bg-[#000000] dark:border-[#000000]" // Custom dark mode color
      )}
    >
      <div className="max-w-screen-xl mx-auto flex min-h-10 items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Toggle navigation"
            onClick={() => setOpen(!open)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <motion.div
            whileHover={{ rotate: 90}}
            transition={{ type: "spring", stiffness: 300 }}
            className="h-5 w-5 shrink-0 rotate-45 rounded-sm border-[3px] border-primary"
          />
          <button
            type="button"
            onClick={() => goTo("Home")}
            className="hidden truncate text-sm font-bold text-primary sm:block"
          >
            CodeHelp
          </button>
        </div>

        <nav className="hidden md:flex gap-4 font-medium text-sm relative">
          {navItems.map((item) => (
            <motion.button
              key={item}
              onClick={() => goTo(item)}
              whileHover={{ scale: 1.05 }}
              className={cn(
                "relative transition-colors duration-200 px-1 text-primary"
              )}
            >
              {item}
              <AnimatePresence>
                {isActive(item) && (
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
        <div className="flex min-w-0 items-center justify-end gap-2 sm:gap-3">
          <Show when="signed-in">
            <motion.button
            whileHover={{ scale: 1.05 }}
            className="hidden px-1 text-sm font-medium text-primary sm:inline-flex"
            onClick={() => goTo("Profile")}
            >
              Profile
            </motion.button>
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <Button variant="ghost" size="sm" className="px-2 sm:px-3">Login</Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <Button size="sm" className="px-2 sm:px-3">Register</Button>
            </SignUpButton>
          </Show>
          <ModeToggle />
        </div>
      </div>
      <AnimatePresence>
        {open && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mx-auto mt-3 max-w-screen-xl overflow-hidden rounded-lg border border-border bg-background/95 shadow-sm md:hidden"
          >
            <div className="grid gap-1 p-2">
              {[...navItems, "Profile"].map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => goTo(item)}
                  className={cn(
                    "rounded-md px-3 py-2 text-left text-sm font-medium transition-colors",
                    isActive(item) ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent"
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  )
}


export default Navbar;
