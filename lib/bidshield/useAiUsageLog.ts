/**
 * L-16: Client-side hook for logging AI usage after each API call.
 * Import and call `logAiCall()` in any component that calls an AI endpoint.
 */
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useCallback } from "react";

interface AiCallResult {
  endpoint: string;
  success: boolean;
  durationMs?: number;
  errorMessage?: string;
  projectId?: string;
}

export function useAiUsageLog(userId: string | null | undefined) {
  const logUsage = useMutation(api.bidshield.logAiUsage);

  const logAiCall = useCallback(
    async (result: AiCallResult) => {
      if (!userId) return;
      try {
        await logUsage({
          userId,
          endpoint: result.endpoint,
          success: result.success,
          durationMs: result.durationMs,
          errorMessage: result.errorMessage,
          projectId: result.projectId,
        });
      } catch {
        // Non-critical — don't break the UI if logging fails
      }
    },
    [userId, logUsage]
  );

  return logAiCall;
}
