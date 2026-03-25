/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { db } from "../db";
import { users } from "@/app/(Schema)/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "placeholder_public_key",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "placeholder_private_key",
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/placeholder",
});

export async function updateProfile(userId: string, data: { name: string, email: string, hourlyRate: string, logoUrl?: string, logoFileId?: string, oldLogoFileId?: string }) {
  try {
    // If a new logo is uploaded and there's an old one, delete the old one
    if (data.logoFileId && data.oldLogoFileId && data.oldLogoFileId !== data.logoFileId) {
      try {
        await imagekit.deleteFile(data.oldLogoFileId);
      } catch (err) {
        console.error("Failed to delete old logo from ImageKit:", err);
      }
    }

    const updatePayload: any = {
      name: data.name,
      email: data.email,
      hourlyRate: data.hourlyRate,
    };

    if (data.logoUrl) updatePayload.logoUrl = data.logoUrl;
    if (data.logoFileId) updatePayload.logoFileId = data.logoFileId;

    await db.update(users).set(updatePayload).where(eq(users.id, userId));

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error("Profile update error:", error);
    return { error: "Failed to update profile." };
  }
}
