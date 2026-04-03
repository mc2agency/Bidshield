/**
 * Returns true when the userId belongs to the demo user.
 *
 * All demo-mode checks in Next.js API routes must go through this function
 * so the behaviour is auditable and changeable from one place.
 */
export function isDemoUser(userId: string): boolean {
  return userId.startsWith("demo_");
}
