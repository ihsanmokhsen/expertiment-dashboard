import { NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { ADMIN_COOKIE_NAME, getAdminSessionToken } from "@/lib/admin-auth"
import { hashPassword, verifyPassword } from "@/lib/password"

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
})

const INITIAL_ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? "admin"
const INITIAL_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "admin123"

async function ensureInitialAdminUser() {
  const adminCount = await prisma.adminUser.count()
  if (adminCount > 0) {
    return
  }

  await prisma.adminUser.create({
    data: {
      username: INITIAL_ADMIN_USERNAME,
      passwordHash: hashPassword(INITIAL_ADMIN_PASSWORD),
    },
  })
}

export async function POST(request: Request) {
  const rawBody = await request.json().catch(() => null)
  const parsedBody = loginSchema.safeParse(rawBody)

  if (!parsedBody.success) {
    return NextResponse.json(
      { message: "Payload login tidak valid." },
      { status: 400 },
    )
  }

  const { username, password } = parsedBody.data
  try {
    await ensureInitialAdminUser()
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2021"
    ) {
      return NextResponse.json(
        { message: "Tabel admin belum dibuat. Jalankan migration database." },
        { status: 500 },
      )
    }

    return NextResponse.json(
      { message: "Gagal menyiapkan akun admin." },
      { status: 500 },
    )
  }

  const admin = await prisma.adminUser.findUnique({
    where: { username: username.trim() },
  })

  if (!admin || !verifyPassword(password.trim(), admin.passwordHash)) {
    return NextResponse.json(
      { message: "Username atau password admin salah." },
      { status: 401 },
    )
  }

  const response = NextResponse.json({ message: "Login berhasil." })
  response.cookies.set({
    name: ADMIN_COOKIE_NAME,
    value: getAdminSessionToken(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24,
  })

  return response
}
