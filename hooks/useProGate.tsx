"use client";

import React, { useState, useCallback } from "react";
import ProGateModal from "@/components/ProGateModal";

interface UseProGateReturn {
  proGateModal: React.ReactNode;
  guardedFetch: (url: string, init?: RequestInit) => Promise<Response | null>;
}

/**
 * useProGate — wraps fetch calls to AI endpoints and intercepts 403 responses
 * by surfacing the ProGateModal paywall.
 *
 * Usage:
 *   const { proGateModal, guardedFetch } = useProGate();
 *
 *   // In a handler:
 *   const res = await guardedFetch("/api/bidshield/analyze-labor", { method: "POST", ... });
 *   if (!res) return; // paywall shown — bail out
 *
 *   // In JSX:
 *   {proGateModal}
 */
export function useProGate(): UseProGateReturn {
  const [isOpen, setIsOpen] = useState(false);

  const guardedFetch = useCallback(
    async (url: string, init?: RequestInit): Promise<Response | null> => {
      const response = await fetch(url, init);
      if (response.status === 403) {
        setIsOpen(true);
        return null;
      }
      return response;
    },
    []
  );

  const proGateModal = (
    <ProGateModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
  );

  return { proGateModal, guardedFetch };
}
// Fri Apr 17 21:09:13 UTC 2026
