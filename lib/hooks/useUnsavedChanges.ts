"use client";

import { useEffect, useCallback, useRef } from "react";

/**
 * Registers a `beforeunload` listener when `dirty` is true, prompting users
 * if they try to navigate away with unsaved changes.
 */
export function useUnsavedChanges(dirty: boolean) {
  const dirtyRef = useRef(dirty);
  dirtyRef.current = dirty;

  const handler = useCallback((e: BeforeUnloadEvent) => {
    if (!dirtyRef.current) return;
    e.preventDefault();
    // Legacy browsers need returnValue set
    e.returnValue = "";
  }, []);

  useEffect(() => {
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [handler]);
}
