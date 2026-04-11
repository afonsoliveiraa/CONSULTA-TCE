import { type FunctionalComponent } from "preact";
import { useContractQuery } from "../../hooks/useContractQuery";
import { ContractColumnsModal } from "./components/ContractColumnsModal";
import { ContractFiltersCard } from "./components/ContractFiltersCard";
import { ContractResultsCard } from "./components/ContractResultsCard";
import { ContractsTopbar } from "./components/ContractsTopbar";

// Pagina da consulta de contratos orquestrando os componentes da feature.
export const ContractQueryPage: FunctionalComponent = () => {
  const {
    numeroContrato,
    contratos,
    filteredContratos,
    mensagemConsulta,
    erroConsulta,
    carregandoConsulta,
    currentPage,
    pageSize,
    totalItems,
    totalPages,
    showColumnModal,
    columns,
    visibleColumns,
    dropTargetColumnId,
    quickSearch,
    setNumeroContrato,
    setQuickSearch,
    setShowColumnModal,
    setDraggingColumnId,
    setDropTargetColumnId,
    setColumnVisibility,
    handleColumnDrop,
    handleBuscarContrato,
    handlePageChange,
    handleExportCsv,
  } = useContractQuery();

  return (
    <>
      <ContractsTopbar currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} />
      <ContractFiltersCard
        numeroContrato={numeroContrato}
        mensagemConsulta={mensagemConsulta}
        erroConsulta={erroConsulta ?? ""}        
        carregandoConsulta={carregandoConsulta}
        onNumeroContratoChange={setNumeroContrato}
        onSubmit={handleBuscarContrato}
      />
      <ContractResultsCard
        contratos={contratos}
        filteredContratos={filteredContratos}
        carregandoConsulta={carregandoConsulta}
        quickSearch={quickSearch}
        currentPage={currentPage}
        totalItems={totalItems}
        totalPages={totalPages}
        visibleColumns={visibleColumns}
        dropTargetColumnId={dropTargetColumnId}
        onQuickSearchChange={setQuickSearch}
        onShowColumnModal={setShowColumnModal}
        onPageChange={handlePageChange}
        onDragStart={setDraggingColumnId}
        onDragOver={(event, columnId) => {
          event.preventDefault();
          setDropTargetColumnId(columnId);
        }}
        onDragLeave={(columnId) => {
          if (dropTargetColumnId === columnId) {
            setDropTargetColumnId(null);
          }
        }}
        onDrop={handleColumnDrop}
        onDragEnd={() => {
          setDraggingColumnId(null);
          setDropTargetColumnId(null);
        }}
        onExportCsv={handleExportCsv}
      />

      {showColumnModal ? (
        <ContractColumnsModal
          columns={columns}
          onClose={() => setShowColumnModal(false)}
          onColumnVisibilityChange={setColumnVisibility}
        />
      ) : null}
    </>
  );
};
