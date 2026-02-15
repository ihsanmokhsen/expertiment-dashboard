export type AppStatus = "Experiment" | "Beta" | "Production"
export type AppPlatform = "v0" | "Base44" | "Lovable" | "Custom"

export interface App {
  id?: string
  name: string
  description: string
  status: AppStatus
  platform: AppPlatform
  url: string
  iconName: string
}

export const apps: App[] = [
  {
    name: "Absen Pagi",
    description: "Sistem absensi Apel Pagi BPAD",
    status: "Production",
    platform: "v0",
    url: "https://absensi-apelpagi.netlify.app/",
    iconName: "ClipboardCheck",
  },
  {
    name: "Sidak&Absen Apel Pagi",
    description: "Monitoring dan sidak kehadiran apel pagi dan Istirahat Siang",
    status: "Production",
    platform: "Base44",
    url: "https://apel-pagi-ntt.base44.app",
    iconName: "Eye",
  },
  {
    name: "MagangHub",
    description: "Platform manajemen dan pendampingan peserta magang",
    status: "Beta",
    platform: "Lovable",
    url: "https://bpad-magang-buddy.lovable.app",
    iconName: "GraduationCap",
  },
]
