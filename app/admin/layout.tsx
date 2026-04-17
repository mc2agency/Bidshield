import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";

export const dynamic = "force-dynamic";

async function getAdminUser(clerkId: string) {
  const url = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!url) return null;
  try {
    const convex = new ConvexHttpClient(url);
    return await convex.query(api.users.getCurrentUser, { clerkId });
  } catch {
    return null;
  }
}

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = await auth();

  // Not logged in — redirect to sign-in
  if (!userId) {
    redirect("/sign-in");
  }

  // Verify admin role server-side before rendering anything
  const user = await getAdminUser(userId);
  if (!user || user.role !== "admin") {
    redirect("/");
  }

  return <>{children}</>;
}
