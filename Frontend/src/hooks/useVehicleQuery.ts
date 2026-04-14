import { useState, useMemo, useCallback, useEffect } from "preact/hooks";
import { sortCollectionByField, type SortDirection } from "../lib/sort";
import { buscarVeiculos, getMunicipiosVeiculos } from "../services/vehiclesApi";
import { vehicleColumns } from "../pages/vehicles/vehicleQuery.constants";
import type { Vehicle } from "../types/vehicle";
import type { VehicleColumnId } from "../pages/vehicles/vehicleQuery.types";
import type { TceMunicipalityOption } from "../types/tce";

export function useVehicleQuery() {
  // --- Estados de Dados ---
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [municipios, setMunicipios] = useState<TceMunicipalityOption[]>([]);
  const [placaOuRenavam, setPlacaOuRenavam] = useState("");
  const [codigoMunicipio, setCodigoMunicipio] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [sortColumnId, setSortColumnId] = useState<VehicleColumnId>("placa");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // --- Estados de Colunas e Paginação ---
  const [columns, setColumns] = useState(vehicleColumns);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- Estados de UI ---
  const [carregandoConsulta, setCarregandoConsulta] = useState(false);
  const [erroConsulta, setErroConsulta] = useState<string | null>(null);
  const [mensagemConsulta, setMensagemConsulta] = useState("");

  /**
   * Carrega os municípios disponíveis para filtro ao montar o componente.
   */
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
        console.error("Erro ao carregar municípios:", err);
        setMunicipios([]);
      }
    };
    carregarMunicipios();
  }, []);

  /**
   * Filtra as colunas ativas para exibição na tabela.
   */
  const visibleColumns = useMemo(() => 
    columns.filter((col) => col.active), 
  [columns]);

  /**
   * Lógica de busca rápida local na tabela e ordenação.
   */
  const filteredVehicles = useMemo(() => {
    const searchTerm = quickSearch.toLowerCase().trim();
    const normalized = !searchTerm
      ? vehicles
      : vehicles.filter((v) =>
          Object.values(v).some((val) => 
            String(val).toLowerCase().includes(searchTerm)
          )
        );

    // Casting duplo para evitar erro de overlap do TypeScript
    return sortCollectionByField(
      normalized as unknown as Record<string, unknown>[],
      sortColumnId,
      sortDirection,
    ) as unknown as Vehicle[];
  }, [vehicles, quickSearch, sortColumnId, sortDirection]);

  /**
   * Função principal de carregamento de dados via API.
   * Agora preparada para a rota: /vehicles/placa_renavam/:numero
   */
  const carregarDados = useCallback(async (page: number) => {
    setCarregandoConsulta(true);
    setErroConsulta(null);

    try {
      // O campo placaOuRenavam será usado como o parâmetro :numero da sua rota Rails
      const response = await buscarVeiculos(placaOuRenavam, codigoMunicipio, page);

      setVehicles(response.data || []);
      setCurrentPage(response.pagination.page);
      setTotalItems(response.pagination.count);
      setTotalPages(response.pagination.last);

      setMensagemConsulta(
        placaOuRenavam || codigoMunicipio
          ? `${response.pagination.count} resultados encontrados.`
          : `Total de ${response.pagination.count} veículos carregados.`
      );
    } catch (err: any) {
      setErroConsulta(err.message || "Erro ao conectar com o servidor.");
      setVehicles([]);
      setMensagemConsulta("");
    } finally {
      setCarregandoConsulta(false);
    }
  }, [codigoMunicipio, placaOuRenavam]);

  /**
   * Handlers de interação do usuário
   */
  const handleBuscarVeiculo = async (e: Event) => {
    e.preventDefault();
    await carregarDados(1);
  };

  const handlePageChange = (page: number) => {
    carregarDados(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (columnId: VehicleColumnId) => {
    if (sortColumnId === columnId) {
      setSortDirection((curr) => (curr === "asc" ? "desc" : "asc"));
      return;
    }
    setSortColumnId(columnId);
    setSortDirection("asc");
  };

  const setColumnVisibility = (columnId: string, active: boolean) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, active } : col))
    );
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
    setPlacaOuRenavam,
    setCodigoMunicipio,
    setQuickSearch,
    setColumnVisibility,
    handleBuscarVeiculo,
    handlePageChange,
    handleSortChange,
  };
}