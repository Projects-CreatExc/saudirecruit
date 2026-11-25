"use client";

import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/button";

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <p className="eyebrow text-danger">Something went wrong</p>
      <h1 className="display-md mt-3">This page hit an unexpected error.</h1>
      <p className="mt-3 max-w-md text-body">Please try again. If it keeps happening, let us know.</p>
      <div className="mt-8 flex gap-3">
        <Button variant="dark" onClick={reset}>
          Try again
        </Button>
        <LinkButton href="/" variant="outline">
          Go home
        </LinkButton>
      </div>
    </div>
  );
}
