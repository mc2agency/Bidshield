/**
 * Shared Anthropic client singleton — single point of configuration.
 * Import `anthropic` from this module in all API routes instead of
 * creating a new Anthropic() instance per file.
 */
import Anthropic from "@anthropic-ai/sdk";

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});
