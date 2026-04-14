import { type FunctionalComponent } from "preact";
import { useVehicleQuery } from "../../hooks/useVehicleQuery";
import { VehicleColumnsModal } from "./components/VehicleColumnsModal";
import { VehicleFiltersCard } from "./components/VehicleFiltersCard";
import { VehicleResultsCard } from "./components/VehicleResultsCard";
import { VehiclesTopbar } from "./components/VehiclesTopbar";

export const VehicleQueryPage: FunctionalComponent = () => {
  const {
    vehicles,
    filteredVehicles,
    placaOuRenavam,
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
    setPlacaOuRenavam,
    setCodigoMunicipio,
    setQuickSearch,
    setShowColumnModal,
    setDraggingColumnId,
    setDropTargetColumnId,
    setColumnVisibility,
    handleBuscarVeiculo,
    handlePageChange,
    handleSortChange,
    handleColumnDrop,
    handleExportCsv,
  } = useVehicleQuery();

  return (
    <>
      <VehiclesTopbar currentPage={currentPage} totalItems={totalItems} pageSize={pageSize} />

      <VehicleFiltersCard
        placaOuRenavam={placaOuRenavam}
        codigoMunicipio={codigoMunicipio}
        municipios={municipios}
        mensagemConsulta={mensagemConsulta}
        erroConsulta={erroConsulta ?? ""}
        carregandoConsulta={carregandoConsulta}
        onPlacaOuRenavamChange={setPlacaOuRenavam}
        onCodigoMunicipioChange={setCodigoMunicipio}
        onSubmit={handleBuscarVeiculo}
      />

      <VehicleResultsCard
        vehicles={vehicles}
        filteredVehicles={filteredVehicles}
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
        <VehicleColumnsModal
          columns={columns}
          onClose={() => setShowColumnModal(false)}
          onColumnVisibilityChange={setColumnVisibility}
        />
      ) : null}
    </>
  );
};
