import { useCallback, useEffect, useMemo, useState } from "preact/hooks";
import { sortCollectionByField, type SortDirection } from "../lib/sort";
import { buscarLicitacoes } from "../services/biddingsApi";
import { fetchImportedMunicipalities } from "../services/tceApi";
import { biddingColumns } from "../pages/biddings/biddingQuery.constants";
import type { Bidding } from "../types/bidding";
import type { BiddingColumnId } from "../pages/biddings/biddingQuery.types";
import type { TceMunicipalityOption } from "../types/tce";

export function useBiddingQuery() {
  const [licitacoes, setLicitacoes] = useState<Bidding[]>([]);
  const [municipios, setMunicipios] = useState<TceMunicipalityOption[]>([]);
  const [numeroProcesso, setNumeroProcesso] = useState("");
  const [codigoMunicipio, setCodigoMunicipio] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [sortColumnId, setSortColumnId] = useState<BiddingColumnId>("numero_processo");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [columns, setColumns] = useState(biddingColumns);
  const [draggingColumnId, setDraggingColumnId] = useState<BiddingColumnId | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<BiddingColumnId | null>(null);
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
        const response = await fetchImportedMunicipalities("biddings");
        setMunicipios(response);
      } catch {
        setMunicipios([]);
      }
    };

    carregarMunicipios();
  }, []);

  const visibleColumns = useMemo(() => columns.filter((column) => column.active), [columns]);

  // A busca local replica o comportamento da consulta de contratos para manter a UX consistente.
  const filteredLicitacoes = useMemo(() => {
    const normalizedSearch = quickSearch.toLowerCase();
    const normalizedItems = !quickSearch.trim()
      ? licitacoes
      : licitacoes.filter((licitacao) =>
          Object.values(licitacao).some((value) => String(value).toLowerCase().includes(normalizedSearch)),
        );

    return sortCollectionByField(
      normalizedItems as unknown as Record<string, unknown>[],
      sortColumnId,
      sortDirection,
    ) as Bidding[];
  }, [licitacoes, quickSearch, sortColumnId, sortDirection]);

  const carregarDados = useCallback(
    async (page: number) => {
      setCarregandoConsulta(true);
      setErroConsulta(null);

      try {
        const response = await buscarLicitacoes(numeroProcesso, codigoMunicipio, page);

        setLicitacoes(response.data || []);
        setCurrentPage(response.pagination.page);
        setTotalItems(response.pagination.count);
        setTotalPages(response.pagination.last);
        setMensagemConsulta(
          numeroProcesso || codigoMunicipio
            ? `${response.pagination.count} resultados encontrados.`
            : `Total de ${response.pagination.count} licitacoes carregadas.`,
        );
      } catch (error: any) {
        setErroConsulta(error.message || "Erro ao conectar com o servidor.");
        setLicitacoes([]);
      } finally {
        setCarregandoConsulta(false);
      }
    },
    [codigoMunicipio, numeroProcesso],
  );

  const handleBuscarLicitacao = async (event: Event) => {
    event.preventDefault();
    await carregarDados(1);
  };

  const handlePageChange = (page: number) => {
    carregarDados(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSortChange = (columnId: BiddingColumnId) => {
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

  const handleColumnDrop = (targetColumnId: BiddingColumnId) => {
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
    console.log("Exportando licitacoes para CSV...");
  };

  return {
    licitacoes,
    municipios,
    filteredLicitacoes,
    numeroProcesso,
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
  };
}
