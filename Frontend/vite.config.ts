import { defineConfig, loadEnv } from "vite";
import preact from "@preact/preset-vite";
import { resolve } from "node:path";

export default defineConfig(({ mode }) => {
  // Mantem o Vite ancorado na pasta Frontend mesmo quando a IDE inicia o processo
  // com outro working directory. Isso evita servir o index publicado de wwwroot.
  const frontendRoot = __dirname;
  const env = loadEnv(mode, frontendRoot, "");

  const frontendPort = Number(env.FRONTEND_PORT || "5173");
  const backendUrl =
    env.BACKEND_URL ||
    env.BACKEND_HTTPS_URL ||
    "https://localhost:7113";

  return {
    root: frontendRoot,
    envDir: frontendRoot,
    appType: "spa",
    plugins: [
      preact(),
      {
        name: "frontend-spa-fallback",
        configureServer(server) {
          server.middlewares.use((request, _response, next) => {
            const requestPath = request.url?.split("?")[0] ?? "/";
            const isAssetRequest =
              requestPath.startsWith("/@vite") ||
              requestPath.startsWith("/src/") ||
              requestPath.startsWith("/node_modules/") ||
              requestPath.startsWith("/assets/") ||
              requestPath.includes(".");

            const isBackendRoute =
              requestPath.startsWith("/api/") ||
              requestPath === "/api" ||
              requestPath.startsWith("/swagger");

            if (!isAssetRequest && !isBackendRoute) {
              request.url = "/";
            }

            next();
          });
        },
      },
    ],
    build: {
      outDir: resolve(frontendRoot, "../ConsultaTCE/wwwroot"),
      emptyOutDir: true,
    },
    server: {
      host: "localhost",
      port: frontendPort,
      strictPort: true,
      open: false,
      proxy: {
        "/api": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
        "/swagger": {
          target: backendUrl,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  };
});
