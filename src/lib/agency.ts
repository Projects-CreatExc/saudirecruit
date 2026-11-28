import { createHash } from "node:crypto";
import { cache } from "react";
import { and, count, eq, gt } from "drizzle-orm";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { attachments, inquiries, siteSettings } from "@/lib/db/schema";
import { checkResume, cleanFileName } from "@/lib/resume";

/** Store an uploaded PDF/Word file (max 2 MB, signature-checked). */
export async function saveAttachment(file: File): Promise<{ id: string } | { error: string }> {
  const bytes = Buffer.from(await file.arrayBuffer());
  const checked = checkResume(file.name, bytes);
  if ("error" in checked) return { error: checked.error };
  const [row] = await db
    .insert(attachments)
    .values({ fileName: cleanFileName(file.name), mimeType: checked.mime, sizeBytes: bytes.length, data: bytes })
    .returning({ id: attachments.id });
  return { id: row.id };
}

export const fileFrom = (fd: FormData, key: string) => {
  const f = fd.get(key);
  return f instanceof File && f.size > 0 ? f : null;
};

/** Hash of the visitor's IP (never stored in plain text), used only for rate limiting. */
export async function visitorHash() {
  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? h.get("x-real-ip") ?? "unknown").split(",")[0].trim();
  return createHash("sha256").update(`${ip}:${process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "sr"}`).digest("hex");
}

const LIMIT_PER_HOUR = 6;
export async function overRateLimit(ipHash: string) {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const [{ n }] = await db
    .select({ n: count() })
    .from(inquiries)
    .where(and(eq(inquiries.ipHash, ipHash), gt(inquiries.createdAt, since)));
  return Number(n) >= LIMIT_PER_HOUR;
}

/* ---------- Site settings ---------- */

export type SiteSettings = { whatsapp: string; contactEmail: string; contactPhone: string };
const DEFAULTS: SiteSettings = { whatsapp: "", contactEmail: "", contactPhone: "" };

export const getSettings = cache(async (): Promise<SiteSettings> => {
  try {
    const rows = await db.select().from(siteSettings);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));
    return { ...DEFAULTS, ...map } as SiteSettings;
  } catch {
    return DEFAULTS; // table not created yet: features degrade gracefully
  }
});

/** wa.me link; digits only, international format (e.g. 9665XXXXXXXX). */
export function whatsappLink(number: string, text: string) {
  const digits = number.replace(/\D/g, "");
  if (digits.length < 8) return null;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}
