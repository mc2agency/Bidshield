// Auth shim — returns safe defaults while Clerk is disabled
// Replace with actual Clerk useAuth when re-enabling auth

export function useAuth() {
  return {
    isLoaded: true,
    isSignedIn: true,
    userId: "dev-user",
  };
}
