import { type FunctionalComponent } from "preact";
import { useBiddingQuery } from "../../hooks/useBiddingQuery";
import { BiddingColumnsModal } from "./components/BiddingColumnsModal";
import { BiddingFiltersCard } from "./components/BiddingFiltersCard";
import { BiddingResultsCard } from "./components/BiddingResultsCard";
import { BiddingsTopbar } from "./components/BiddingsTopbar";

// Replica o fluxo de contratos, mas apontando para a consulta de licitacoes.
export const BiddingQueryPage: FunctionalComponent = () => {
  const {
    licitacoes,
    filteredLicitacoes,
    numeroProcesso,
    codigoMunicipio,
    municipios,
    quickSearch,
    carregandoConsulta,
    erroConsulta,
    mensagemConsulta,
    currentPage,
    totalItems,
    totalPages,
    pageSize,
    sortColumnId,
    sortDirection,
    columns,
    visibleColumns,
    showColumnModal,
    dropTargetColumnId,
    setNumeroProcesso,
    setCodigoMunicipio,
    setQuickSearch,
    setShowColumnModal,
    setDraggingColumnId,
    setDropTargetColumnId,
    setColumnVisibility,
    handleBuscarLicitacao,
    handlePageChange,
    handleSortChange,
    handleColumnDrop,
    handleExportCsv,
  } = useBiddingQuery();

  return (
    <>
      <BiddingsTopbar />

      <BiddingFiltersCard
        numeroProcesso={numeroProcesso}
        codigoMunicipio={codigoMunicipio}
        municipios={municipios}
        mensagemConsulta={mensagemConsulta}
        erroConsulta={erroConsulta ?? ""}
        carregandoConsulta={carregandoConsulta}
        onNumeroProcessoChange={setNumeroProcesso}
        onCodigoMunicipioChange={setCodigoMunicipio}
        onSubmit={handleBuscarLicitacao}
      />

      <BiddingResultsCard
        licitacoes={licitacoes}
        filteredLicitacoes={filteredLicitacoes}
        carregandoConsulta={carregandoConsulta}
        quickSearch={quickSearch}
        currentPage={currentPage}
        totalItems={totalItems}
        totalPages={totalPages}
        sortColumnId={sortColumnId}
        sortDirection={sortDirection}
        visibleColumns={visibleColumns}
        dropTargetColumnId={dropTargetColumnId}
        onQuickSearchChange={setQuickSearch}
        onShowColumnModal={setShowColumnModal}
        onPageChange={handlePageChange}
        onSortChange={handleSortChange}
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
        <BiddingColumnsModal
          columns={columns}
          onClose={() => setShowColumnModal(false)}
          onColumnVisibilityChange={setColumnVisibility}
        />
      ) : null}
    </>
  );
};
