"use client"

import { Beaker, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface HeaderProps {
  isAdmin: boolean
  onLoginClick: () => void
  onLogout: () => void
}

export function Header({ isAdmin, onLoginClick, onLogout }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2.5">
          <Beaker className="h-5 w-5 text-foreground" />
          <span className="text-lg font-extrabold tracking-tight text-foreground">
            Experiment Hub
          </span>
        </div>
        {mounted && (
          <div className="flex items-center gap-2">
            {isAdmin ? (
              <Button size="sm" variant="outline" onClick={onLogout}>
                Logout Admin
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={onLoginClick}>
                Login Admin
              </Button>
            )}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              aria-label="Toggle dark mode"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
