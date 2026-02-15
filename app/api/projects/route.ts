import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { isAdminRequest } from "@/lib/admin-auth"
import { apps } from "@/data/apps"

const projectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["Experiment", "Beta", "Production"]),
  platform: z.enum(["v0", "Base44", "Lovable", "Custom"]),
  url: z.string().url(),
  iconName: z.string().min(1).default("Box"),
})

async function seedDefaultsIfEmpty() {
  const total = await prisma.project.count()
  if (total > 0) {
    return
  }

  await prisma.project.createMany({
    data: apps.map((app) => ({
      name: app.name,
      description: app.description,
      status: app.status,
      platform: app.platform,
      url: app.url,
      iconName: app.iconName || "Box",
    })),
  })
}

export async function GET() {
  await seedDefaultsIfEmpty()
  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: "desc" },
  })

  return NextResponse.json({ projects })
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(
      { message: "Akses ditolak. Login admin diperlukan." },
      { status: 401 },
    )
  }

  const rawBody = await request.json().catch(() => null)
  const parsedBody = projectSchema.safeParse(rawBody)

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: "Data project tidak valid." },
      { status: 400 },
    )
  }

  try {
    const project = await prisma.project.create({
      data: parsedBody.data,
    })
    return NextResponse.json({ project }, { status: 201 })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { message: "URL project sudah digunakan." },
        { status: 409 },
      )
    }

    return NextResponse.json(
      { message: "Gagal menyimpan project." },
      { status: 500 },
    )
  }
}
