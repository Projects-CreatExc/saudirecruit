export const RESUME_MAX_BYTES = 2 * 1024 * 1024; // 2 MB
export const RESUME_ACCEPT = ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const TYPES = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
} as const;

/** Path stored in profiles/applications; served by /api/cv/[id] with permission checks. */
export const resumePath = (id: string) => `/api/cv/${id}`;
export const resumeIdFromPath = (path?: string | null) => path?.match(/^\/api\/cv\/([0-9a-f-]{36})$/i)?.[1] ?? null;

export function formatBytes(n: number) {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.round(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

/**
 * Validates by extension AND file signature, so a renamed .exe can't pass as a PDF.
 * Returns the canonical MIME type or an error message.
 */
export function checkResume(name: string, bytes: Buffer): { mime: string } | { error: string } {
  if (bytes.length === 0) return { error: "The file is empty." };
  if (bytes.length > RESUME_MAX_BYTES) return { error: `Your CV must be ${formatBytes(RESUME_MAX_BYTES)} or smaller.` };
  const ext = name.toLowerCase().split(".").pop() as keyof typeof TYPES | undefined;
  if (!ext || !(ext in TYPES)) return { error: "Upload a PDF or Word file (.pdf, .doc or .docx)." };

  const head = bytes.subarray(0, 8);
  const isPdf = head.subarray(0, 5).toString("latin1") === "%PDF-";
  const isZip = head[0] === 0x50 && head[1] === 0x4b && head[2] === 0x03 && head[3] === 0x04; // .docx
  const isOle = head.toString("hex") === "d0cf11e0a1b11ae1"; // legacy .doc

  const ok = (ext === "pdf" && isPdf) || (ext === "docx" && isZip) || (ext === "doc" && isOle);
  if (!ok) return { error: "This file doesn't look like a valid PDF or Word document." };
  return { mime: TYPES[ext] };
}

/** Keep names readable but safe for headers and file systems. */
export function cleanFileName(name: string) {
  const base = name.split(/[\\/]/).pop() ?? "cv";
  return base.replace(/[^\w.\- ()]+/g, "_").replace(/\s+/g, " ").trim().slice(0, 120) || "cv";
}
