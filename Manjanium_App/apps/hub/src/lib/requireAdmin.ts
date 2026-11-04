// Shared admin guard for Next.js server components and API routes
// Uses Clerk backend SDK to verify the session and the allow‑list.
import { auth, currentUser } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

/**
 * Throws a NextResponse.notFound() if the request is not from an admin.
 * On success returns the Clerk user object.
 */
export async function requireAdmin() {
  // Load allow‑list – server‑only env var, never exposed to the client
  const allowlistRaw = process.env.ADMIN_EMAILS ?? "";
  const allowlist = allowlistRaw
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  // If the allow‑list is empty we deny everything (but do not crash)
  if (allowlist.length === 0) {
    return notFound();
  }

  const { userId, getToken } = auth();
  const token = await getToken({
    template: "default",
  });

  // No token or no userId -> signed out
  if (!token || !userId) {
    return notFound();
  }

  const clerkUser = await currentUser();
  if (!clerkUser) {
    return notFound();
  }

  // Verify primary email is verified
  const primaryEmail = clerkUser.emailAddresses?.find((e: any) => e.id === clerkUser.primaryEmailAddressId);
  if (!primaryEmail || !primaryEmail.verification || primaryEmail.verification.status !== "verified") {
    return notFound();
  }

  const emailNorm = primaryEmail.emailAddress.trim().toLowerCase();
  if (!allowlist.includes(emailNorm)) {
    return notFound();
  }

  // All good – return the user (can be used downstream)
  return clerkUser;
}

function notFound() {
  // 404 with no‑store and robots header as required
  const resp = NextResponse.next();
  resp.headers.set("Cache-Control", "no-store");
  resp.headers.set("X-Robots-Tag", "noindex, nofollow");
  // Throwing a 404 response terminates the request in Next.js
  throw new Response(null, { status: 404, headers: resp.headers });
}

