// frontend/src/hooks/useContractQuery.ts

import { useState, useMemo, useCallback, useEffect } from "preact/hooks";
import { sortCollectionByField, type SortDirection } from "../lib/sort";
import { buscarContratos } from "../services/contratosApi";
import { fetchImportedMunicipalities } from "../services/tceApi";
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

  // --- Estados de Colunas (Usando suas constantes) ---
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

  useEffect(() => {
    const carregarMunicipios = async () => {
      try {
        const response = await fetchImportedMunicipalities("contracts");
        setMunicipios(response);
      } catch {
        setMunicipios([]);
      }
    };

    carregarMunicipios();
  }, []);

  // --- Lógica de Colunas Visíveis ---
  const visibleColumns = useMemo(() => 
    columns.filter((col) => col.active), 
  [columns]);

  // --- Lógica de Filtro Local (Quick Search na Grade) ---
  const filteredContratos = useMemo(() => {
    const normalizedContracts = !quickSearch.trim()
      ? contratos
      : contratos.filter((contrato) =>
          Object.values(contrato).some((value) => String(value).toLowerCase().includes(quickSearch.toLowerCase()))
        );

    return sortCollectionByField(
      normalizedContracts as unknown as Record<string, unknown>[],
      sortColumnId,
      sortDirection,
    ) as Contrato[];
  }, [contratos, quickSearch, sortColumnId, sortDirection]);

  // --- Funções de Busca ---
  const carregarDados = useCallback(async (page: number) => {
    setCarregandoConsulta(true);
    setErroConsulta(null);

    try {
      // Ordem correta dos parâmetros conforme seu service: (numero, page)
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
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumnId(columnId);
    setSortDirection("asc");
  };

  // --- Gestão de Colunas (Drag & Drop e Visibilidade) ---
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
    console.log("Exportando contratos para CSV...");
    // Implementar lógica de download se necessário
  };

  return {
    // Dados
    contratos,
    municipios,
    filteredContratos,
    numeroContrato,
    codigoMunicipio,
    quickSearch,
    
    // Status
    carregandoConsulta,
    erroConsulta,
    mensagemConsulta,
    
    // Paginação
    currentPage,
    totalItems,
    totalPages,
    pageSize: 20,
    sortColumnId,
    sortDirection,

    // Colunas e Modal
    columns,
    visibleColumns,
    showColumnModal,
    dropTargetColumnId,
    
    // Setters
    setNumeroContrato,
    setCodigoMunicipio,
    setQuickSearch,
    setShowColumnModal,
    setDraggingColumnId,
    setDropTargetColumnId,
    setColumnVisibility,
    
    // Handlers
    handleBuscarContrato,
    handlePageChange,
    handleSortChange,
    handleColumnDrop,
    handleExportCsv,
  };
}
