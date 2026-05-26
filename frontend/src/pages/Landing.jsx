// File: src/pages/Landing.jsx

import { Button } from "@/components/ui/button"
import Globe from "@/components/magicui/Globe"

export default function Landing() {
  return (
    <div className="grid min-h-screen grid-cols-1 place-items-center gap-8 bg-background px-4 py-20 text-foreground md:grid-cols-2 md:px-8">
      <div className="max-w-xl space-y-6 p-0 sm:p-6 md:p-10">
        <h1 className="text-3xl font-bold leading-tight sm:text-4xl">Welcome to Magic + ShadCN UI</h1>
        <p className="text-lg text-muted-foreground">
          This app uses both Magic UI for animation and ShadCN for clean components.
        </p>
        <Button>Get Started</Button>
      </div>
      <Globe />
    </div>
  )
}
