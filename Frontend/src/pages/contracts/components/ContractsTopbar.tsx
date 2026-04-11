import { type FunctionalComponent } from "preact";

interface ContractsTopbarProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
}

const highlights = (currentPage: number, totalItems: number, pageSize: number) =>
  [
    `Pagina atual: ${currentPage}`,
    `Total de registros: ${totalItems}`,
    `Tamanho da pagina: ${pageSize}`,
  ] as const;

// Exibe o breadcrumb da pagina e os blocos visuais de contexto.
export const ContractsTopbar: FunctionalComponent<ContractsTopbarProps> = ({
  currentPage,
  totalItems,
  pageSize,
}) => (
  <div class="contracts-topbar">
    <div class="contracts-breadcrumbs">
      <span>Processos</span>
      <span>&rsaquo;</span>
      <strong>Contratos</strong>
    </div>

    <div class="contracts-steps" aria-label="Resumo da consulta">
      {highlights(currentPage, totalItems, pageSize).map((highlight) => (
        <div key={highlight} class="contracts-step">
          <span aria-hidden="true">&#10003;</span>
          <strong>{highlight}</strong>
        </div>
      ))}
    </div>
  </div>
);
