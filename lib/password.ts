import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto"

const SCRYPT_KEY_LENGTH = 64

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex")
  const derived = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex")
  return `${salt}:${derived}`
}

export function verifyPassword(password: string, storedHash: string) {
  const [salt, saved] = storedHash.split(":")
  if (!salt || !saved) {
    return false
  }

  const computed = scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString("hex")
  const savedBuffer = Buffer.from(saved, "hex")
  const computedBuffer = Buffer.from(computed, "hex")

  if (savedBuffer.length !== computedBuffer.length) {
    return false
  }

  return timingSafeEqual(savedBuffer, computedBuffer)
}
