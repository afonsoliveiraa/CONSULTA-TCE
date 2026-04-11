import { type FunctionalComponent } from "preact";
import { MainLayout } from "./components";
import { ContractQueryPage, HomePage, NotFoundPage, TceApiPage, UploadHistoryPage } from "./pages";
import { resolveAppRoute } from "./routes/appRoutes";

export const App: FunctionalComponent = () => {
  // Usa o modulo de rotas para manter a resolucao das paginas em um unico lugar.
  const currentPage = resolveAppRoute(window.location.pathname);

  return (
    <MainLayout pageTitle={currentPage.title}>
      <section
        class={`contracts-page${currentPage.key === "consulta" || currentPage.key === "tce-api" ? " contracts-page--consulta" : ""}`}
      >
        {currentPage.key === "home" ? <HomePage /> : null}
        {currentPage.key === "upload" ? <UploadHistoryPage /> : null}
        {currentPage.key === "consulta" ? <ContractQueryPage /> : null}
        {currentPage.key === "tce-api" ? <TceApiPage /> : null}
        {currentPage.key === "not-found" ? <NotFoundPage /> : null}
      </section>
    </MainLayout>
  );
};
