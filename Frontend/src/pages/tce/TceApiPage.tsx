import { type FunctionalComponent } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { useTceQuery } from "../../hooks/useTceQuery";
import { TceColumnsModal } from "./components/TceColumnsModal";
import { TceFiltersCard } from "./components/TceFiltersCard";
import { TceResultsCard } from "./components/TceResultsCard";
import { TceTopbar } from "./components/TceTopbar";

export const TceApiPage: FunctionalComponent = () => {
  const resultsRef = useRef<HTMLElement | null>(null);
  const previousPageRef = useRef(1);
  const {
    municipalities,
    endpoints,
    pagination,
    selectedPath,
    setSelectedPath,
    selectedMunicipalityCode,
    setSelectedMunicipalityCode,
    endpointSummary,
    dynamicParameters,
    formValues,
    loadingQuery,
    errorQuery,
    messageQuery,
    result,
    quickSearch,
    columns,
    visibleColumns,
    filteredItems,
    pagedItems,
    showColumnModal,
    dropTargetColumnId,
    sortColumnId,
    sortDirection,
    selectedEndpoint,
    setFieldValue,
    setQuickSearch,
    setShowColumnModal,
    setDraggingColumnId,
    setDropTargetColumnId,
    setCurrentPage,
    setColumnVisibility,
    handleSubmit,
    handleSortChange,
    handleColumnDrop,
    handleExportCsv,
  } = useTceQuery();

  useEffect(() => {
    if (previousPageRef.current !== pagination.currentPage) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    previousPageRef.current = pagination.currentPage;
  }, [pagination.currentPage]);

  return (
    <>
      <TceTopbar
      />

      <TceFiltersCard
        municipalities={municipalities}
        endpoints={endpoints}
        selectedMunicipalityCode={selectedMunicipalityCode}
        selectedPath={selectedPath}
        endpointSummary={endpointSummary}
        dynamicParameters={dynamicParameters}
        formValues={formValues}
        loadingQuery={loadingQuery}
        messageQuery={messageQuery}
        errorQuery={errorQuery}
        onMunicipalityChange={setSelectedMunicipalityCode}
        onPathChange={setSelectedPath}
        onFieldChange={setFieldValue}
        onSubmit={handleSubmit}
      />

      <section ref={resultsRef}>
        <TceResultsCard
          endpointLabel={selectedEndpoint?.label ?? "Consulta"}
          endpointPath={selectedPath}
          sourceUrl={result?.source_url ?? ""}
          loadingQuery={loadingQuery}
          messageQuery={messageQuery}
          errorQuery={errorQuery}
          quickSearch={quickSearch}
          currentPage={pagination.currentPage}
          totalItems={filteredItems.length}
          totalPages={pagination.totalPages}
          visibleColumns={visibleColumns}
          pagedItems={pagedItems}
          sortColumnId={sortColumnId}
          sortDirection={sortDirection}
          dropTargetColumnId={dropTargetColumnId}
          onQuickSearchChange={setQuickSearch}
          onShowColumnModal={() => setShowColumnModal(true)}
          onPageChange={setCurrentPage}
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
      </section>

      {showColumnModal ? (
        <TceColumnsModal
          columns={columns}
          onClose={() => setShowColumnModal(false)}
          onColumnVisibilityChange={setColumnVisibility}
        />
      ) : null}
    </>
  );
};
