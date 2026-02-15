"use client"

import { type FormEvent, useEffect, useState } from "react"
import { Header } from "@/components/header"
import { AppCard } from "@/components/app-card"
import { apps, type AppPlatform, type AppStatus } from "@/data/apps"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"

type Project = {
  id: string
  name: string
  description: string
  status: AppStatus
  platform: AppPlatform
  url: string
  iconName: string
}

const statusOptions: AppStatus[] = ["Experiment", "Beta", "Production"]
const platformOptions: AppPlatform[] = ["v0", "Base44", "Lovable", "Custom"]
const iconOptions = [
  "Box",
  "Briefcase",
  "Building2",
  "ClipboardCheck",
  "Cog",
  "Database",
  "Eye",
  "FileText",
  "Globe",
  "GraduationCap",
  "HeartPulse",
  "Landmark",
  "LayoutGrid",
  "MonitorSmartphone",
  "Package",
  "Rocket",
  "School",
  "ShieldCheck",
  "Users",
]

type ProjectForm = {
  name: string
  description: string
  status: AppStatus
  platform: AppPlatform
  url: string
  iconName: string
}

const defaultProjectForm: ProjectForm = {
  name: "",
  description: "",
  status: "Experiment",
  platform: "Custom",
  url: "",
  iconName: "Box",
}

export default function Home() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [showLoginForm, setShowLoginForm] = useState(false)
  const [loginUsername, setLoginUsername] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState("")

  const [projectForm, setProjectForm] = useState<ProjectForm>(defaultProjectForm)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null)

  const [projectsError, setProjectsError] = useState("")
  const [projectError, setProjectError] = useState("")
  const [projectSuccess, setProjectSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function loadProjects() {
    try {
      setProjectsError("")
      const response = await fetch("/api/projects", { cache: "no-store" })
      if (!response.ok) {
        throw new Error("Gagal memuat project")
      }

      const data = (await response.json()) as { projects: Project[] }
      setProjects(data.projects)
    } catch {
      setProjectsError("Project dari database gagal dimuat, menampilkan data default.")
      const fallbackProjects: Project[] = apps.map((app, index) => ({
        id: `fallback-${index}`,
        name: app.name,
        description: app.description,
        status: app.status,
        platform: app.platform,
        url: app.url,
        iconName: app.iconName,
      }))
      setProjects(fallbackProjects)
    }
  }

  async function loadAdminSession() {
    try {
      const response = await fetch("/api/admin/session", { cache: "no-store" })
      if (!response.ok) {
        setIsAdmin(false)
        return
      }

      const data = (await response.json()) as { authenticated: boolean }
      setIsAdmin(data.authenticated)
    } catch {
      setIsAdmin(false)
    }
  }

  useEffect(() => {
    void loadProjects()
    void loadAdminSession()
  }, [])

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setLoginError("")

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: loginUsername.trim(),
        password: loginPassword.trim(),
      }),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ message: "Login gagal." }))) as {
        message?: string
      }
      setLoginError(data.message ?? "Login gagal.")
      return
    }

    setIsAdmin(true)
    setShowLoginForm(false)
    setLoginPassword("")
    setLoginUsername("")
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" })
    setIsAdmin(false)
    setShowLoginForm(false)
    setLoginError("")
    setProjectError("")
    setProjectSuccess("")
    setEditingProjectId(null)
    setProjectForm(defaultProjectForm)
  }

  function startEditProject(project: Project) {
    setEditingProjectId(project.id)
    setProjectForm({
      name: project.name,
      description: project.description,
      status: project.status,
      platform: project.platform,
      url: project.url,
      iconName: project.iconName,
    })
    setProjectError("")
    setProjectSuccess("")
  }

  function cancelEditProject() {
    setEditingProjectId(null)
    setProjectForm(defaultProjectForm)
    setProjectError("")
    setProjectSuccess("")
  }

  async function handleSaveProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProjectError("")
    setProjectSuccess("")
    setIsSubmitting(true)

    const payload: ProjectForm = {
      ...projectForm,
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      url: projectForm.url.trim(),
      iconName: projectForm.iconName.trim() || "Box",
    }

    if (!payload.name || !payload.description || !payload.url) {
      setProjectError("Nama, deskripsi, dan URL project wajib diisi.")
      setIsSubmitting(false)
      return
    }

    try {
      new URL(payload.url)
    } catch {
      setProjectError("URL project tidak valid.")
      setIsSubmitting(false)
      return
    }

    const isEditMode = Boolean(editingProjectId)
    const endpoint = isEditMode ? `/api/projects/${editingProjectId}` : "/api/projects"
    const method = isEditMode ? "PATCH" : "POST"

    const response = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ message: "Operasi gagal." }))) as {
        message?: string
      }
      setProjectError(data.message ?? "Operasi gagal.")
      setIsSubmitting(false)
      return
    }

    await loadProjects()
    setProjectForm(defaultProjectForm)
    setEditingProjectId(null)
    setProjectSuccess(
      isEditMode ? "Project berhasil diperbarui." : "Project baru berhasil ditambahkan.",
    )
    setIsSubmitting(false)
  }

  async function handleDeleteProject(projectId: string) {
    setProjectError("")
    setProjectSuccess("")
    setIsSubmitting(true)

    const response = await fetch(`/api/projects/${projectId}`, {
      method: "DELETE",
    })

    if (!response.ok) {
      const data = (await response.json().catch(() => ({ message: "Hapus project gagal." }))) as {
        message?: string
      }
      setProjectError(data.message ?? "Hapus project gagal.")
      setIsSubmitting(false)
      return
    }

    if (editingProjectId === projectId) {
      cancelEditProject()
    }

    await loadProjects()
    setProjectSuccess("Project berhasil dihapus.")
    setIsSubmitting(false)
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header
        isAdmin={isAdmin}
        onLoginClick={() => {
          setShowLoginForm((prevState) => !prevState)
          setLoginError("")
        }}
        onLogout={handleLogout}
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-16">
        <div className="mb-12">
          <h1 className="text-balance text-4xl font-extrabold tracking-tight text-foreground">
            Experiments
          </h1>
          <p className="mt-3 text-base font-medium leading-relaxed text-muted-foreground">
            Launch and manage digital builds.
          </p>
        </div>

        {showLoginForm && !isAdmin && (
          <section className="mb-10 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground">Login Admin</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Login admin diperlukan untuk tambah, update, dan hapus project.
            </p>
            <form onSubmit={handleLogin} className="mt-5 grid gap-4 md:max-w-md">
              <div className="grid gap-2">
                <Label htmlFor="admin-username">Username</Label>
                <Input
                  id="admin-username"
                  value={loginUsername}
                  onChange={(event) => setLoginUsername(event.target.value)}
                  placeholder="Masukkan username admin"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="admin-password">Password</Label>
                <Input
                  id="admin-password"
                  type="password"
                  value={loginPassword}
                  onChange={(event) => setLoginPassword(event.target.value)}
                  placeholder="Masukkan password admin"
                  required
                />
              </div>
              {loginError && (
                <p className="text-sm font-medium text-destructive">{loginError}</p>
              )}
              <Button type="submit" className="w-fit">
                Login
              </Button>
            </form>
          </section>
        )}

        {isAdmin && (
          <section className="mb-10 rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-bold text-foreground">
              {editingProjectId ? "Edit Project" : "Tambah Project Baru"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Data akan disimpan di PostgreSQL melalui API Prisma.
            </p>

            <form onSubmit={handleSaveProject} className="mt-5 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="project-name">Nama Project</Label>
                <Input
                  id="project-name"
                  value={projectForm.name}
                  onChange={(event) =>
                    setProjectForm((prevForm) => ({
                      ...prevForm,
                      name: event.target.value,
                    }))
                  }
                  placeholder="Contoh: Sistem Arsip Digital"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="project-description">Deskripsi</Label>
                <Textarea
                  id="project-description"
                  value={projectForm.description}
                  onChange={(event) =>
                    setProjectForm((prevForm) => ({
                      ...prevForm,
                      description: event.target.value,
                    }))
                  }
                  placeholder="Jelaskan fungsi utama project"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="project-status">Status</Label>
                  <select
                    id="project-status"
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={projectForm.status}
                    onChange={(event) =>
                      setProjectForm((prevForm) => ({
                        ...prevForm,
                        status: event.target.value as AppStatus,
                      }))
                    }
                  >
                    {statusOptions.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="project-platform">Platform</Label>
                  <select
                    id="project-platform"
                    className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={projectForm.platform}
                    onChange={(event) =>
                      setProjectForm((prevForm) => ({
                        ...prevForm,
                        platform: event.target.value as AppPlatform,
                      }))
                    }
                  >
                    {platformOptions.map((platform) => (
                      <option key={platform} value={platform}>
                        {platform}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="project-url">URL Project</Label>
                <Input
                  id="project-url"
                  type="url"
                  value={projectForm.url}
                  onChange={(event) =>
                    setProjectForm((prevForm) => ({
                      ...prevForm,
                      url: event.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="project-icon">Pilih Icon</Label>
                <Input
                  id="project-icon"
                  value={projectForm.iconName}
                  readOnly
                  className="bg-muted/40"
                />
                <ScrollArea className="h-44 rounded-md border border-input bg-background">
                  <div className="grid grid-cols-2 gap-2 p-3 md:grid-cols-3">
                    {iconOptions.map((iconName) => (
                      <button
                        key={iconName}
                        type="button"
                        onClick={() =>
                          setProjectForm((prevForm) => ({
                            ...prevForm,
                            iconName,
                          }))
                        }
                        className={`rounded-md border px-3 py-2 text-left text-sm font-medium transition-colors ${
                          projectForm.iconName === iconName
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-card hover:bg-accent"
                        }`}
                      >
                        {iconName}
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              {projectError && (
                <p className="text-sm font-medium text-destructive">{projectError}</p>
              )}
              {projectSuccess && (
                <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  {projectSuccess}
                </p>
              )}

              <div className="flex flex-wrap gap-2">
                <Button type="submit" className="w-fit" disabled={isSubmitting}>
                  {editingProjectId ? "Update Project" : "Simpan Project"}
                </Button>
                {editingProjectId && (
                  <Button
                    type="button"
                    variant="outline"
                    className="w-fit"
                    onClick={cancelEditProject}
                    disabled={isSubmitting}
                  >
                    Batal Edit
                  </Button>
                )}
              </div>
            </form>

            {projects.length > 0 && (
              <div className="mt-8 space-y-3">
                <h3 className="text-base font-bold text-foreground">Kelola Project</h3>
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="flex flex-col gap-3 rounded-xl border border-border p-4 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <p className="font-semibold text-foreground">{project.name}</p>
                      <p className="text-sm text-muted-foreground">{project.url}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() => startEditProject(project)}
                        disabled={isSubmitting}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="destructive"
                        onClick={() => void handleDeleteProject(project.id)}
                        disabled={isSubmitting}
                      >
                        Hapus
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {projectsError && (
          <p className="mb-4 text-sm font-medium text-destructive">{projectsError}</p>
        )}

        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((app, index) => (
            <AppCard key={app.id} app={app} index={index} />
          ))}
        </div>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm font-semibold text-muted-foreground">
        Minimal Digital Workspace
      </footer>
    </div>
  )
}
