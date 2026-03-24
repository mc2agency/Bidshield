/**
 * Returns true when the userId belongs to the demo user.
 * Demo users bypass Clerk auth and subscription checks so that
 * unauthenticated visitors can explore the product.
 *
 * All demo checks must go through this function so the behaviour
 * is easy to audit and change from a single place.
 */
export function isDemoUser(userId: string): boolean {
  return userId.startsWith("demo_");
}
