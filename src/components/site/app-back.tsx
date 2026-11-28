"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { isTabRoot } from "@/lib/navigation";

/**
 * In the installed app there is no browser back button, so detail pages get
 * one in the header. Hidden in a normal browser tab and on tab root pages.
 */
export function AppBack() {
  const pathname = usePathname();
  const router = useRouter();
  const [standalone, setStandalone] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(display-mode: standalone)");
    const nav = navigator as Navigator & { standalone?: boolean };
    const update = () => setStandalone(mq.matches || nav.standalone === true);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  if (!standalone || isTabRoot(pathname)) return null;
  return (
    <button
      type="button"
      onClick={() => (window.history.length > 1 ? router.back() : router.push("/"))}
      aria-label="Go back"
      className="-ms-2 me-1 inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-surface-2 active:scale-90 md:hidden"
    >
      <ChevronLeft className="size-6 rtl:rotate-180" />
    </button>
  );
}
