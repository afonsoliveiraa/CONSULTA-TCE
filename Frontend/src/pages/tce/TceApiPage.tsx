import { type FunctionalComponent } from "preact";
import { useTceQuery } from "../../hooks/useTceQuery";
import { TceColumnsModal } from "./components/TceColumnsModal";
import { TceFiltersCard } from "./components/TceFiltersCard";
import { TceResultsCard } from "./components/TceResultsCard";
import { TceTopbar } from "./components/TceTopbar";

export const TceApiPage: FunctionalComponent = () => {
  const {
    municipalities,
    endpoints,
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
    setColumnVisibility,
    handleSubmit,
    handleSortChange,
    handleColumnDrop,
    handleExportCsv,
  } = useTceQuery();

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

      <TceResultsCard
        endpointLabel={selectedEndpoint?.label ?? "Consulta"}
        endpointPath={selectedPath}
        sourceUrl={result?.source_url ?? ""}
        loadingQuery={loadingQuery}
        messageQuery={messageQuery}
        errorQuery={errorQuery}
        quickSearch={quickSearch}
        totalItems={Number(result?.metadata?.total ?? result?.metadata?.length ?? result?.data.length ?? 0)}
        visibleColumns={visibleColumns}
        filteredItems={filteredItems}
        sortColumnId={sortColumnId}
        sortDirection={sortDirection}
        dropTargetColumnId={dropTargetColumnId}
        onQuickSearchChange={setQuickSearch}
        onShowColumnModal={() => setShowColumnModal(true)}
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
        <TceColumnsModal
          columns={columns}
          onClose={() => setShowColumnModal(false)}
          onColumnVisibilityChange={setColumnVisibility}
        />
      ) : null}
    </>
  );
};
