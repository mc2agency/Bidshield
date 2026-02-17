// Middleware disabled during rebuild — no auth enforcement
// Clerk provider still wraps the app client-side for useAuth() hooks
// but middleware does nothing at the edge layer

export default function middleware() {
  // no-op
}

export const config = {
  matcher: [],
};
