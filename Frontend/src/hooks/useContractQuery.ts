// frontend/src/hooks/useContractQuery.ts

import { useState, useMemo, useCallback, useEffect } from "preact/hooks";
import { sortCollectionByField, type SortDirection } from "../lib/sort";
import { buscarContratos, getMunicipiosImportados } from "../services/contratosApi";
import { contratoColumns } from "../pages/contracts/contractQuery.constants";
import type { Contrato } from "../types/contrato";
import type { ContratoColumnId } from "../pages/contracts/contractQuery.types";
import type { TceMunicipalityOption } from "../types/tce";

export function useContractQuery() {
  // --- Estados de Dados ---
  const [contratos, setContratos] = useState<Contrato[]>([]);
  const [municipios, setMunicipios] = useState<TceMunicipalityOption[]>([]);
  const [numeroContrato, setNumeroContrato] = useState("");
  const [codigoMunicipio, setCodigoMunicipio] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [sortColumnId, setSortColumnId] = useState<ContratoColumnId>("numero_contrato");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  // --- Estados de Colunas ---
  const [columns, setColumns] = useState(contratoColumns);
  const [draggingColumnId, setDraggingColumnId] = useState<ContratoColumnId | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<ContratoColumnId | null>(null);

  // --- Estados de Paginação ---
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // --- Estados de UI ---
  const [carregandoConsulta, setCarregandoConsulta] = useState(false);
  const [erroConsulta, setErroConsulta] = useState<string | null>(null);
  const [mensagemConsulta, setMensagemConsulta] = useState("");
  const [showColumnModal, setShowColumnModal] = useState(false);

  // --- Efeito para carregar municípios (Filtros) ---
  useEffect(() => {
    const carregarMunicipios = async () => {
      try {
        const codigos = await getMunicipiosImportados();
        
        // Mapeia garantindo a presença de 'code' e 'name' exigidos pela interface
        const opcoes: TceMunicipalityOption[] = codigos.map((codigo) => ({
          label: codigo,
          value: codigo,
          code: codigo, // Propriedade exigida pelo tipo TceMunicipalityOption
          name: codigo, // Propriedade exigida pelo tipo TceMunicipalityOption
        }));

        setMunicipios(opcoes);
      } catch (err) {
        console.error("Erro ao carregar municípios:", err);
        setMunicipios([]);
      }
    };

    carregarMunicipios();
  }, []);

  // --- Lógica de Colunas Visíveis ---
  const visibleColumns = useMemo(() => 
    columns.filter((col) => col.active), 
  [columns]);

  // --- Lógica de Filtro Local e Ordenação ---
  const filteredContratos = useMemo(() => {
    const normalizedContracts = !quickSearch.trim()
      ? contratos
      : contratos.filter((contrato) =>
          Object.values(contrato).some((value) => 
            String(value).toLowerCase().includes(quickSearch.toLowerCase())
          )
        );

    // Casting duplo (as unknown as...) para contornar a rigidez do TS na ordenação
    return sortCollectionByField(
      normalizedContracts as unknown as Record<string, unknown>[],
      sortColumnId,
      sortDirection,
    ) as unknown as Contrato[];
  }, [contratos, quickSearch, sortColumnId, sortDirection]);

  // --- Funções de Busca API ---
  const carregarDados = useCallback(async (page: number) => {
    setCarregandoConsulta(true);
    setErroConsulta(null);

    try {
      const response = await buscarContratos(numeroContrato, codigoMunicipio, page);

      setContratos(response.data || []);
      setCurrentPage(response.pagination.page);
      setTotalItems(response.pagination.count);
      setTotalPages(response.pagination.last);

      setMensagemConsulta(
        numeroContrato || codigoMunicipio
          ? `${response.pagination.count} resultados encontrados.`
          : `Total de ${response.pagination.count} contratos carregados.`
      );
    } catch (err: any) {
      setErroConsulta(err.message || "Erro ao conectar com o servidor.");
      setContratos([]);
    } finally {
      setCarregandoConsulta(false);
    }
  }, [codigoMunicipio, numeroContrato]);

  const handleBuscarContrato = async (e: Event) => {
    e.preventDefault();
    await carregarDados(1);
  };

  const handlePageChange = (page: number) => {
    carregarDados(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (columnId: ContratoColumnId) => {
    if (sortColumnId === columnId) {
      setSortDirection((curr) => (curr === "asc" ? "desc" : "asc"));
      return;
    }
    setSortColumnId(columnId);
    setSortDirection("asc");
  };

  // --- Gestão de Colunas (Drag & Drop) ---
  const setColumnVisibility = (columnId: string) => {
    setColumns((prev) =>
      prev.map((col) => (col.id === columnId ? { ...col, active: !col.active } : col))
    );
  };

  const handleColumnDrop = (targetColumnId: ContratoColumnId) => {
    if (!draggingColumnId || draggingColumnId === targetColumnId) return;

    setColumns((prev) => {
      const newColumns = [...prev];
      const draggedIdx = newColumns.findIndex((c) => c.id === draggingColumnId);
      const targetIdx = newColumns.findIndex((c) => c.id === targetColumnId);

      const [removed] = newColumns.splice(draggedIdx, 1);
      newColumns.splice(targetIdx, 0, removed);

      return newColumns;
    });
    setDraggingColumnId(null);
    setDropTargetColumnId(null);
  };

  const handleExportCsv = () => {
    console.log("Exportando...");
  };

  return {
    contratos,
    municipios,
    filteredContratos,
    numeroContrato,
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
    setNumeroContrato,
    setCodigoMunicipio,
    setQuickSearch,
    setShowColumnModal,
    setDraggingColumnId,
    setDropTargetColumnId,
    setColumnVisibility,
    handleBuscarContrato,
    handlePageChange,
    handleSortChange,
    handleColumnDrop,
    handleExportCsv,
  };
}