import { eq } from "drizzle-orm";
import { getSessionUser } from "@/lib/auth/session";
import { isAdminRole } from "@/lib/constants";
import { db } from "@/lib/db";
import { attachments } from "@/lib/db/schema";

export const dynamic = "force-dynamic";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Files sent through public request forms. Admins only; everyone else gets 404. */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const notFound = () => new Response("Not found", { status: 404 });
  if (!UUID.test(id)) return notFound();
  const user = await getSessionUser();
  if (!user) return new Response("Sign in to download this file.", { status: 401 });
  if (!isAdminRole(user.role)) return notFound();

  const [file] = await db.select().from(attachments).where(eq(attachments.id, id)).limit(1);
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
