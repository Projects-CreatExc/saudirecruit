import { and, eq, isNull } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole, isEmployerRole } from "@/lib/constants";
import { db } from "@/lib/db";
import { applications, companies, jobs, resumeFiles } from "@/lib/db/schema";

export const dynamic = "force-dynamic";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Serves a CV only to: its owner, admins, or an employer the candidate has applied to.
 * Everyone else gets 404 so file ids can't be probed.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = () => new Response("Not found", { status: 404 });
  if (!UUID.test(id)) return notFound();

  const user = await getSessionUser();
  if (!user) return new Response("Sign in to download this file.", { status: 401 });

  const [meta] = await db
    .select({ userId: resumeFiles.userId })
    .from(resumeFiles)
    .where(eq(resumeFiles.id, id))
    .limit(1);
  if (!meta) return notFound();

  let allowed = meta.userId === user.id || isAdminRole(user.role);
  if (!allowed && isEmployerRole(user.role)) {
    const [link] = await db
      .select({ id: applications.id })
      .from(applications)
      .innerJoin(jobs, eq(applications.jobId, jobs.id))
      .innerJoin(companies, eq(jobs.companyId, companies.id))
      .where(and(eq(applications.applicantId, meta.userId), eq(companies.ownerId, user.id), isNull(applications.deletedAt)))
      .limit(1);
    allowed = !!link;
  }
  if (!allowed) return notFound();

  const [file] = await db.select().from(resumeFiles).where(eq(resumeFiles.id, id)).limit(1);
  if (!file) return notFound();

  const ascii = file.fileName.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "");
  return new Response(new Uint8Array(file.data), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Length": String(file.data.length),
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(file.fileName)}`,
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
