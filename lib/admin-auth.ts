import type { NextRequest } from "next/server"

export const ADMIN_COOKIE_NAME = "experiment_hub_admin"

const ADMIN_SESSION_TOKEN =
  process.env.ADMIN_SESSION_TOKEN ?? "local-dev-admin-session-token"

export function getAdminSessionToken() {
  return ADMIN_SESSION_TOKEN
}

export function isAdminRequest(request: NextRequest) {
  const session = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  return session === ADMIN_SESSION_TOKEN
}
