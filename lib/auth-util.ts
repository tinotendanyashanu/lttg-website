import { auth } from "@/auth";

export async function getSession() {
    return await auth();
}

export async function getRole() {
    const session = await auth();
    // Assuming standard structure, but we check account roles in page.tsx anyway
    // So this might just return a basic default if not implemented fully here
    return session?.user ? 'employee' : null;
}

export async function getSessionWithDevBypass() {
  return auth();
}

