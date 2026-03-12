// Export tRPC setup
export {
  protectedProcedure,
  publicProcedure,
  router,
  baseProcedure,
  createTRPCRouter,
} from "./trpc.js";
export type { BaseContext } from "./trpc.js";

// Export router creators
export { createAppRouter, createFrontendRouter } from "./router.js";
export { createMcpServersRouter } from "./routers/frontend/index.js";

// Export all zod types for convenience
export * from "@repo/zod-types";
