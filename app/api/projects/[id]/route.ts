import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { isAdminRequest } from "@/lib/admin-auth"

const updateProjectSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  status: z.enum(["Experiment", "Beta", "Production"]),
  platform: z.enum(["v0", "Base44", "Lovable", "Custom"]),
  url: z.string().url(),
  iconName: z.string().min(1),
})

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(
      { message: "Akses ditolak. Login admin diperlukan." },
      { status: 401 },
    )
  }

  const { id } = await params
  const rawBody = await request.json().catch(() => null)
  const parsedBody = updateProjectSchema.safeParse(rawBody)

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: "Data project tidak valid." },
      { status: 400 },
    )
  }

  try {
    const project = await prisma.project.update({
      where: { id },
      data: parsedBody.data,
    })
    return NextResponse.json({ project })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Project tidak ditemukan." },
        { status: 404 },
      )
    }

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
      { message: "Gagal memperbarui project." },
      { status: 500 },
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  if (!isAdminRequest(request)) {
    return NextResponse.json(
      { message: "Akses ditolak. Login admin diperlukan." },
      { status: 401 },
    )
  }

  const { id } = await params

  try {
    await prisma.project.delete({ where: { id } })
    return NextResponse.json({ message: "Project berhasil dihapus." })
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { message: "Project tidak ditemukan." },
        { status: 404 },
      )
    }

    return NextResponse.json(
      { message: "Gagal menghapus project." },
      { status: 500 },
    )
  }
}
