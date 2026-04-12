import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { sortCollectionByField, type SortDirection } from "../lib/sort";
import { buscarVeiculos } from "../services/vehiclesApi";
import { fetchImportedMunicipalities } from "../services/tceApi";
import { vehicleColumns } from "../pages/vehicles/vehicleQuery.constants";
import type { Vehicle } from "../types/vehicle";
import type { VehicleColumnId } from "../pages/vehicles/vehicleQuery.types";
import type { TceMunicipalityOption } from "../types/tce";

export function useVehicleQuery() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [municipios, setMunicipios] = useState<TceMunicipalityOption[]>([]);
  const [placaOuRenavam, setPlacaOuRenavam] = useState("");
  const [codigoMunicipio, setCodigoMunicipio] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [sortColumnId, setSortColumnId] = useState<VehicleColumnId>("placa");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [columns, setColumns] = useState(vehicleColumns);
  const [draggingColumnId, setDraggingColumnId] = useState<VehicleColumnId | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<VehicleColumnId | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [carregandoConsulta, setCarregandoConsulta] = useState(false);
  const [erroConsulta, setErroConsulta] = useState<string | null>(null);
  const [mensagemConsulta, setMensagemConsulta] = useState("");
  const [showColumnModal, setShowColumnModal] = useState(false);

  useEffect(() => {
    const carregarMunicipios = async () => {
      try {
        const response = await fetchImportedMunicipalities("vehicles");
        setMunicipios(response);
      } catch {
        setMunicipios([]);
      }
    };

    carregarMunicipios();
  }, []);

  const visibleColumns = useMemo(() => columns.filter((column) => column.active), [columns]);

  const filteredVehicles = useMemo(() => {
    const normalizedSearch = quickSearch.toLowerCase();
    const normalizedItems = !quickSearch.trim()
      ? vehicles
      : vehicles.filter((vehicle) =>
          Object.values(vehicle).some((value) => String(value).toLowerCase().includes(normalizedSearch)),
        );

    return sortCollectionByField(
      normalizedItems as unknown as Record<string, unknown>[],
      sortColumnId,
      sortDirection,
    ) as Vehicle[];
  }, [vehicles, quickSearch, sortColumnId, sortDirection]);

  const carregarDados = useCallback(
    async (page: number) => {
      setCarregandoConsulta(true);
      setErroConsulta(null);

      try {
        const response = await buscarVeiculos(placaOuRenavam, codigoMunicipio, page);

        setVehicles(response.data || []);
        setCurrentPage(response.pagination.page);
        setTotalItems(response.pagination.count);
        setTotalPages(response.pagination.last);
        setMensagemConsulta(
          placaOuRenavam || codigoMunicipio
            ? `${response.pagination.count} resultados encontrados.`
            : `Total de ${response.pagination.count} veiculos carregados.`,
        );
      } catch (error: any) {
        setErroConsulta(error.message || "Erro ao conectar com o servidor.");
        setVehicles([]);
      } finally {
        setCarregandoConsulta(false);
      }
    },
    [codigoMunicipio, placaOuRenavam],
  );

  const handleBuscarVeiculo = async (event: Event) => {
    event.preventDefault();
    await carregarDados(1);
  };

  const handlePageChange = (page: number) => {
    carregarDados(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (columnId: VehicleColumnId) => {
    if (sortColumnId === columnId) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumnId(columnId);
    setSortDirection("asc");
  };

  const setColumnVisibility = (columnId: string, checked: boolean) => {
    setColumns((current) => current.map((column) => (column.id === columnId ? { ...column, active: checked } : column)));
  };

  const handleColumnDrop = (targetColumnId: VehicleColumnId) => {
    if (!draggingColumnId || draggingColumnId === targetColumnId) return;

    setColumns((current) => {
      const nextColumns = [...current];
      const draggedIndex = nextColumns.findIndex((column) => column.id === draggingColumnId);
      const targetIndex = nextColumns.findIndex((column) => column.id === targetColumnId);
      const [removedColumn] = nextColumns.splice(draggedIndex, 1);

      nextColumns.splice(targetIndex, 0, removedColumn);
      return nextColumns;
    });

    setDraggingColumnId(null);
    setDropTargetColumnId(null);
  };

  const handleExportCsv = () => {
    console.log("Exportando veiculos para CSV...");
  };

  return {
    vehicles,
    municipios,
    filteredVehicles,
    placaOuRenavam,
    codigoMunicipio,
    quickSearch,
    carregandoConsulta,
    erroConsulta,
    mensagemConsulta,
    currentPage,
    totalItems,
    totalPages,
    pageSize: 20,
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
  };
}
