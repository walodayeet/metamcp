import { createFrontendRouter } from "./routers/frontend/index.js";
import { router } from "./trpc.js";

export const createAppRouter = (implementations: {
  frontend: Parameters<typeof createFrontendRouter>[0];
}) => {
  const frontendRouters = createFrontendRouter(implementations.frontend);

  return router({
    frontend: router({
      mcpServers: frontendRouters.mcpServers,
      namespaces: frontendRouters.namespaces,
      endpoints: frontendRouters.endpoints,
      oauth: frontendRouters.oauth,
      tools: frontendRouters.tools,
      apiKeys: frontendRouters.apiKeys,
      config: frontendRouters.config,
      logs: frontendRouters.logs,
    }),
  });
};

export type AppRouter = ReturnType<typeof createAppRouter>;

// Export types for the router
export type { BaseContext } from "./trpc.js";
export { createFrontendRouter } from "./routers/frontend/index.js";
