// File: src/pages/Landing.jsx

import { Button } from "@/components/ui/button"
import Globe from "@/components/magicui/Globe"

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground grid grid-cols-1 md:grid-cols-2 place-items-center">
      <div className="p-10 space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Magic + ShadCN UI</h1>
        <p className="text-lg text-muted-foreground">
          This app uses both Magic UI for animation and ShadCN for clean components.
        </p>
        <Button>Get Started</Button>
      </div>
      <Globe />
    </div>
  )
}
