import { type ComponentChildren, type FunctionalComponent } from "preact";

export const AppShell: FunctionalComponent<{ children: ComponentChildren }> = ({ children }) => (
  <div class="app-shell">
    <header class="hero">
      <div>
        <span class="eyebrow">ConsultaTCE</span>
        <h1>Painel de consulta integrado ao backend .NET 9</h1>
        <p>
          Interface em Preact baseada na estrutura visual do front original, reduzida aos
          componentes essenciais para consulta, filtros e leitura paginada.
        </p>
      </div>
      <a class="ghost-link" href="/swagger">
        Abrir Swagger
      </a>
    </header>
    <main class="content-grid">{children}</main>
  </div>
);
