/**
 * The single fixed ID that activates demo mode for Next.js API routes.
 * Only this exact value bypasses auth — a prefix-match would allow spoofing.
 */
export const DEMO_USER_ID = "demo_preview_only";

/**
 * Returns true when the userId belongs to the demo user.
 *
 * All demo-mode checks in Next.js API routes must go through this function
 * so the behaviour is auditable and changeable from one place.
 */
export function isDemoUser(userId: string): boolean {
  return userId === DEMO_USER_ID;
}
