import { type FunctionalComponent } from "preact";
import { MainLayout, ToastViewport } from "./components";
// Adicione a AnalysisNEPage no import das páginas
import { 
  BiddingQueryPage, 
  ContractQueryPage, 
  HomePage, 
  NotFoundPage, 
  TceApiPage, 
  UploadHistoryPage, 
  VehicleQueryPage,
  AnalysisNEPage 
} from "./pages";
import { resolveAppRoute } from "./routes/appRoutes";

export const App: FunctionalComponent = () => {
  // Usa o modulo de rotas para manter a resolucao das paginas em um unico lugar.
  const currentPage = resolveAppRoute(window.location.pathname);

  return (
    <MainLayout pageTitle={currentPage.title}>
      <section
        class={`contracts-page${
          currentPage.key === "consulta" ||
          currentPage.key === "consulta-licitacao" ||
          currentPage.key === "consulta-veiculo" ||
          currentPage.key === "tce-api" ||
          currentPage.key === "analyses-ne" // Adicionado aqui para aplicar o estilo de consulta
            ? " contracts-page--consulta"
            : ""
        }`}
      >
        {currentPage.key === "home" ? <HomePage /> : null}
        {currentPage.key === "upload" ? <UploadHistoryPage /> : null}
        {currentPage.key === "consulta" ? <ContractQueryPage /> : null}
        {currentPage.key === "consulta-licitacao" ? <BiddingQueryPage /> : null}
        {currentPage.key === "consulta-veiculo" ? <VehicleQueryPage /> : null}
        {currentPage.key === "tce-api" ? <TceApiPage /> : null}
        
        {/* Nova rota adicionada aqui */}
        {currentPage.key === "analyses-ne" ? <AnalysisNEPage /> : null}
        
        {currentPage.key === "not-found" ? <NotFoundPage /> : null}
      </section>
      <ToastViewport />
    </MainLayout>
  );
};