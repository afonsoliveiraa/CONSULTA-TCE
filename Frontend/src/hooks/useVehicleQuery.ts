import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { sortCollectionByField, type SortDirection } from "../lib/sort";
import { buscarVeiculos, getMunicipiosVeiculos } from "../services/vehiclesApi";
import { vehicleColumns } from "../pages/vehicles/vehicleQuery.constants";
import type { VehicleColumnId } from "../pages/vehicles/vehicleQuery.types";
import type { Vehicle } from "../types/vehicle";
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
        const codigos = await getMunicipiosVeiculos();
        const opcoes: TceMunicipalityOption[] = codigos.map((codigo) => ({
          label: String(codigo),
          value: String(codigo),
          code: String(codigo),
          name: String(codigo),
        }));

        setMunicipios(opcoes);
      } catch (err) {
        console.error("Erro ao carregar municipios:", err);
        setMunicipios([]);
      }
    };

    carregarMunicipios();
  }, []);

  const visibleColumns = useMemo(() => columns.filter((column) => column.active), [columns]);

  const filteredVehicles = useMemo(() => {
    const searchTerm = quickSearch.toLowerCase().trim();
    const normalizedVehicles = !searchTerm
      ? vehicles
      : vehicles.filter((vehicle) =>
          Object.values(vehicle).some((value) => String(value).toLowerCase().includes(searchTerm)),
        );

    return sortCollectionByField(
      normalizedVehicles as unknown as Record<string, unknown>[],
      sortColumnId,
      sortDirection,
    ) as unknown as Vehicle[];
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
      } catch (err: any) {
        setErroConsulta(err.message || "Erro ao conectar com o servidor.");
        setVehicles([]);
        setMensagemConsulta("");
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

  const setColumnVisibility = (columnId: string, active: boolean) => {
    setColumns((currentColumns) =>
      currentColumns.map((column) => (column.id === columnId ? { ...column, active } : column)),
    );
  };

  const handleColumnDrop = (targetColumnId: VehicleColumnId) => {
    if (!draggingColumnId || draggingColumnId === targetColumnId) {
      return;
    }

    setColumns((currentColumns) => {
      const nextColumns = [...currentColumns];
      const draggedIndex = nextColumns.findIndex((column) => column.id === draggingColumnId);
      const targetIndex = nextColumns.findIndex((column) => column.id === targetColumnId);

      if (draggedIndex === -1 || targetIndex === -1) {
        return currentColumns;
      }

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
