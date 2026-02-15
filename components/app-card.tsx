"use client"

import {
  ArrowUpRight,
  Box,
  Briefcase,
  Building2,
  ClipboardCheck,
  Cog,
  Database,
  FileText,
  Globe,
  GraduationCap,
  HeartPulse,
  Landmark,
  LayoutGrid,
  MonitorSmartphone,
  Package,
  Rocket,
  School,
  ShieldCheck,
  Users,
  Eye,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import type { App } from "@/data/apps"

const iconMap: Record<string, LucideIcon> = {
  Box,
  Briefcase,
  Building2,
  ClipboardCheck,
  Cog,
  Database,
  Eye,
  FileText,
  Globe,
  GraduationCap,
  HeartPulse,
  Landmark,
  LayoutGrid,
  MonitorSmartphone,
  Package,
  Rocket,
  School,
  ShieldCheck,
  Users,
}

const statusStyles: Record<string, string> = {
  Production:
    "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400",
  Beta: "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-400",
  Experiment:
    "bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-400",
}

const platformStyles: Record<string, string> = {
  v0: "bg-foreground text-background",
  Base44: "bg-secondary text-secondary-foreground",
  Lovable: "bg-secondary text-secondary-foreground",
  Custom: "bg-secondary text-secondary-foreground",
}

interface AppCardProps {
  app: App
  index: number
}

export function AppCard({ app, index }: AppCardProps) {
  const Icon = iconMap[app.iconName] || Box

  return (
    <div
      className="group flex flex-col rounded-2xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
      style={{
        animationName: "fade-in-up",
        animationDuration: "0.5s",
        animationTimingFunction: "ease-out",
        animationFillMode: "both",
        animationDelay: `${index * 80}ms`,
      }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[app.status] || ""}`}
          >
            {app.status}
          </span>
        </div>
      </div>

      <h3 className="mb-1.5 text-lg font-bold text-foreground">
        {app.name}
      </h3>
      <p className="mb-5 text-sm font-medium leading-relaxed text-muted-foreground">
        {app.description}
      </p>

      <div className="mt-auto flex items-center justify-between">
        <span
          className={`inline-flex items-center rounded-md px-2.5 py-1 text-xs font-bold ${platformStyles[app.platform] || ""}`}
        >
          {app.platform}
        </span>
        <a
          href={app.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-bold text-background transition-opacity hover:opacity-80"
        >
          Launch
          <ArrowUpRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
