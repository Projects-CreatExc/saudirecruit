"use client";

import { useCallback, useEffect, useState } from "react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: "accepted" | "dismissed" }> };

declare global {
  interface Window {
    __srInstall?: InstallEvent | null;
    __srInstalled?: boolean;
  }
}

export type InstallState = {
  /** Android/desktop Chromium: the native install dialog is available. */
  canPrompt: boolean;
  /** iPhone/iPad: installation is manual (Share > Add to Home Screen). */
  isIOS: boolean;
  /** Already running as an installed app. */
  installed: boolean;
  ready: boolean;
};

function detect(): InstallState {
  const nav = navigator as Navigator & { standalone?: boolean };
  const isIOS = /iPhone|iPad|iPod/i.test(nav.userAgent) || (nav.userAgent.includes("Macintosh") && nav.maxTouchPoints > 1);
  const installed = !!window.__srInstalled || window.matchMedia("(display-mode: standalone)").matches || nav.standalone === true;
  return { canPrompt: !!window.__srInstall && !installed, isIOS, installed, ready: true };
}

export function useInstall() {
  const [state, setState] = useState<InstallState>({ canPrompt: false, isIOS: false, installed: false, ready: false });

  useEffect(() => {
    const update = () => setState(detect());
    update();
    window.addEventListener("sr-install", update);
    const mq = window.matchMedia("(display-mode: standalone)");
    mq.addEventListener("change", update);
    return () => {
      window.removeEventListener("sr-install", update);
      mq.removeEventListener("change", update);
    };
  }, []);

  /** Opens the native dialog. Returns true if the user accepted. */
  const prompt = useCallback(async () => {
    const e = window.__srInstall;
    if (!e) return false;
    await e.prompt();
    const { outcome } = await e.userChoice;
    window.__srInstall = null; // the event can only be used once
    if (outcome === "accepted") window.__srInstalled = true;
    setState(detect());
    return outcome === "accepted";
  }, []);

  /** Something useful to offer on this device. */
  const available = state.ready && !state.installed && (state.canPrompt || state.isIOS);
  return { ...state, available, prompt };
}
