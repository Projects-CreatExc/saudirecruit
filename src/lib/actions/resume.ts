"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/session";
import { isSeekerRole } from "@/lib/constants";
import { db } from "@/lib/db";
import { applications, jobSeekerProfiles, resumeFiles } from "@/lib/db/schema";
import { checkResume, cleanFileName, resumeIdFromPath, resumePath } from "@/lib/resume";
import type { FormState } from "./auth";

/** Delete a stored CV unless an application still references it. */
async function dropIfUnused(fileId: string | null, userId: string) {
  if (!fileId) return;
  const [used] = await db
    .select({ id: applications.id })
    .from(applications)
    .where(eq(applications.resumeUrl, resumePath(fileId)))
    .limit(1);
  if (!used) await db.delete(resumeFiles).where(and(eq(resumeFiles.id, fileId), eq(resumeFiles.userId, userId)));
}

export async function uploadResumeAction(_: FormState, formData: FormData): Promise<FormState> {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/settings");
  if (!isSeekerRole(user.role)) return { error: "Only job seeker accounts can upload a CV." };

  const file = formData.get("cv");
  if (!(file instanceof File) || file.size === 0) return { error: "Choose a file to upload." };

  const bytes = Buffer.from(await file.arrayBuffer());
  const checked = checkResume(file.name, bytes);
  if ("error" in checked) return { error: checked.error };

  try {
    const [profile] = await db
      .select({ resumeUrl: jobSeekerProfiles.resumeUrl })
      .from(jobSeekerProfiles)
      .where(eq(jobSeekerProfiles.userId, user.id))
      .limit(1);

    const [saved] = await db
      .insert(resumeFiles)
      .values({ userId: user.id, fileName: cleanFileName(file.name), mimeType: checked.mime, sizeBytes: bytes.length, data: bytes })
      .returning({ id: resumeFiles.id });

    const now = new Date();
    await db
      .insert(jobSeekerProfiles)
      .values({ userId: user.id, resumeUrl: resumePath(saved.id), resumeUpdatedAt: now })
      .onConflictDoUpdate({
        target: jobSeekerProfiles.userId,
        set: { resumeUrl: resumePath(saved.id), resumeUpdatedAt: now, updatedAt: now },
      });

    // Pending applications pick up the new CV; decided ones keep the version they were reviewed with.
    await db
      .update(applications)
      .set({ resumeUrl: resumePath(saved.id), updatedAt: now })
      .where(and(eq(applications.applicantId, user.id), eq(applications.status, "applied")));

    const previous = resumeIdFromPath(profile?.resumeUrl);
    if (previous && previous !== saved.id) await dropIfUnused(previous, user.id);
  } catch (err) {
    console.error("[resume upload]", err);
    return { error: "We couldn't save your CV. Please try again." };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  return { success: "Your CV has been uploaded." };
}

export async function removeResumeAction() {
  const user = await getSessionUser();
  if (!user) redirect("/login?callbackUrl=/settings");
  const [profile] = await db
    .select({ resumeUrl: jobSeekerProfiles.resumeUrl })
    .from(jobSeekerProfiles)
    .where(eq(jobSeekerProfiles.userId, user.id))
    .limit(1);
  const id = resumeIdFromPath(profile?.resumeUrl);
  await db
    .update(jobSeekerProfiles)
    .set({ resumeUrl: null, resumeUpdatedAt: null, updatedAt: new Date() })
    .where(eq(jobSeekerProfiles.userId, user.id));
  // Applications still under review lose the CV too; reviewed ones keep their copy.
  if (id) {
    await db
      .update(applications)
      .set({ resumeUrl: null })
      .where(and(eq(applications.applicantId, user.id), eq(applications.status, "applied"), eq(applications.resumeUrl, resumePath(id))));
    await dropIfUnused(id, user.id);
  }
  revalidatePath("/settings");
  revalidatePath("/dashboard");
}
