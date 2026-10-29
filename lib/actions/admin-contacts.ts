"use server";
import { auth } from "@/auth";
import { isValidObjectId } from "mongoose";
import { revalidatePath } from "next/cache";
import dbConnect from "@/lib/mongodb";
import Contact from "@/models/Contact";
export async function updateContactStatus(
  _previous: { error: string; success: boolean },
  form: FormData,
) {
  const session = await auth();
  if (!session?.user || session.user.role !== "admin")
    return { error: "Admin access required.", success: false };
  const id = String(form.get("id") || "");
  const status = String(form.get("status") || "");
  if (
    !isValidObjectId(id) ||
    !["new", "contacted", "qualified", "proposal", "won", "closed"].includes(
      status,
    )
  )
    return { error: "Invalid inquiry or status.", success: false };
  try {
    await dbConnect();
    const contact = await Contact.findByIdAndUpdate(
      id,
      { $set: { status } },
      { runValidators: true },
    );
    if (!contact) return { error: "Inquiry not found.", success: false };
    revalidatePath("/admin/contacts");
    revalidatePath(`/admin/contacts/${id}`);
    return { error: "", success: true };
  } catch {
    return { error: "The status could not be saved.", success: false };
  }
}
