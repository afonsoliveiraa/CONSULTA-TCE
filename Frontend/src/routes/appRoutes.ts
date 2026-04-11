export type AppRouteKey = "home" | "upload" | "consulta" | "tce-api" | "not-found";

export interface AppRoute {
  key: AppRouteKey;
  title: string;
}

// Centraliza a resolucao das rotas conhecidas do frontend.
export function resolveAppRoute(pathname: string): AppRoute {
  if (pathname === "/") {
    return {
      key: "home",
      title: "Inicio",
    };
  }

  if (pathname === "/upload-de-historico") {
    return {
      key: "upload",
      title: "Upload de historico",
    };
  }

  if (pathname === "/consulta-de-contrato") {
    return {
      key: "consulta",
      title: "Consulta de contrato",
    };
  }

  if (pathname === "/api-tce") {
    return {
      key: "tce-api",
      title: "API TCE",
    };
  }

  return {
    key: "not-found",
    title: "Pagina nao encontrada",
  };
}
