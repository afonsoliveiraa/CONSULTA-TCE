import { useEffect, useMemo, useRef, useState } from "preact/hooks";
import { sortCollectionByField, type SortDirection } from "../lib/sort";
import { formatColumnLabel } from "../pages/tce/tcePresentation";
import { fetchTceEndpoints, fetchTceMunicipalities, queryTce } from "../services/tceApi";
import type {
  TceColumnDefinition,
  TceEndpoint,
  TceMunicipalityOption,
  TcePaginationState,
  TceQueryResult,
} from "../types/tce";

export function useTceQuery() {
  const pageSize = 25;
  const refreshTimerRef = useRef<number | null>(null);
  const lastQueryRef = useRef<{ path: string; params: Record<string, string> } | null>(null);
  const [municipalities, setMunicipalities] = useState<TceMunicipalityOption[]>([]);
  const [endpoints, setEndpoints] = useState<TceEndpoint[]>([]);
  const [selectedMunicipalityCode, setSelectedMunicipalityCode] = useState("");
  const [selectedPath, setSelectedPath] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TceQueryResult | null>(null);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [errorQuery, setErrorQuery] = useState("");
  const [messageQuery, setMessageQuery] = useState("");
  const [quickSearch, setQuickSearch] = useState("");
  const [columns, setColumns] = useState<TceColumnDefinition[]>([]);
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(null);
  const [sortColumnId, setSortColumnId] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchTceMunicipalities()
      .then(setMunicipalities)
      .catch(() => setMunicipalities([]));

    fetchTceEndpoints()
      .then((catalog) => {
        setEndpoints(catalog);
        setSelectedPath((current) => current || catalog[0]?.path || "");
      })
      .catch(() => setEndpoints([]));
  }, []);

  const selectedEndpoint = useMemo(
    () => endpoints.find((endpoint) => endpoint.path === selectedPath) ?? null,
    [endpoints, selectedPath],
  );

  const endpointSummary = selectedEndpoint?.summary ?? "";
  const dynamicParameters = selectedEndpoint?.parameters ?? [];

  useEffect(() => {
    clearPendingRefresh();
    setFormValues({});
    setSelectedMunicipalityCode("");
    setResult(null);
    setColumns([]);
    setQuickSearch("");
    setErrorQuery("");
    setMessageQuery("");
    setSortColumnId(null);
    setCurrentPage(1);
  }, [selectedPath]);

  useEffect(
    () => () => {
      clearPendingRefresh();
    },
    [],
  );

  const visibleColumns = useMemo(() => columns.filter((column) => column.active !== false), [columns]);

  const filteredItems = useMemo(() => {
    const baseItems = result?.data || [];
    const normalizedSearch = quickSearch.trim().toLowerCase();
    const searchedItems = normalizedSearch
      ? baseItems.filter((item) =>
        Object.values(item).some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch)),
      )
      : baseItems;

    if (!sortColumnId) {
      return searchedItems;
    }

    return sortCollectionByField(searchedItems, sortColumnId, sortDirection);
  }, [quickSearch, result, sortColumnId, sortDirection]);

  const pagination = useMemo<TcePaginationState>(() => {
    const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));
    const normalizedCurrentPage = Math.min(currentPage, totalPages);

    return {
      currentPage: normalizedCurrentPage,
      pageSize,
      totalPages,
    };
  }, [currentPage, filteredItems.length]);

  const pagedItems = useMemo(() => {
    const start = (pagination.currentPage - 1) * pagination.pageSize;
    return filteredItems.slice(start, start + pagination.pageSize);
  }, [filteredItems, pagination]);

  useEffect(() => {
    setCurrentPage((page) => Math.min(page, pagination.totalPages));
  }, [pagination.totalPages]);

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    setErrorQuery("");
    setMessageQuery("");
    setCurrentPage(1);

    if (requiresMunicipality(selectedEndpoint) && !selectedMunicipalityCode) {
      setResult(null);
      setColumns([]);
      setErrorQuery("Selecione um municipio para consultar este servico do TCE-CE.");
      return;
    }

    setLoadingQuery(true);

    try {
      const hiddenDefaultParams = buildHiddenDefaultParams(selectedEndpoint);
      const requestParams = {
        ...hiddenDefaultParams,
        ...formValues,
        ...(selectedMunicipalityCode ? { codigo_municipio: selectedMunicipalityCode } : {}),
      };
      const response = await queryTce(selectedPath, requestParams);
      lastQueryRef.current = { path: selectedPath, params: requestParams };

      setResult(response);

      const nextColumns = buildColumnsFromItems(response.data || []);
      setColumns(nextColumns);
      setSortColumnId(nextColumns[0]?.id ?? null);
      setSortDirection("asc");
      const totalFromMetadata = Number(response.data?.length ?? response.metadata?.total ?? response.metadata?.length ?? 0);
      setMessageQuery(
        buildQueryMessage(response, totalFromMetadata),
      );

      scheduleBackgroundRefresh(response);
    } catch (error: any) {
      clearPendingRefresh();
      setResult(null);
      setColumns([]);
      setErrorQuery(error?.response?.data?.error || error?.message || "Erro ao consultar o TCE-CE.");
      setMessageQuery("");
    } finally {
      setLoadingQuery(false);
    }
  };

  const handleSortChange = (columnId: string) => {
    if (sortColumnId === columnId) {
      setSortDirection((currentDirection) => (currentDirection === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumnId(columnId);
    setSortDirection("asc");
  };

  const setColumnVisibility = (columnId: string, checked: boolean) => {
    setColumns((current) =>
      current.map((column) => (column.id === columnId ? { ...column, active: checked } : column)),
    );
  };

  const handleColumnDrop = (targetColumnId: string) => {
    if (!draggingColumnId || draggingColumnId === targetColumnId) {
      return;
    }

    setColumns((current) => {
      const sourceIndex = current.findIndex((column) => column.id === draggingColumnId);
      const targetIndex = current.findIndex((column) => column.id === targetColumnId);

      if (sourceIndex < 0 || targetIndex < 0) {
        return current;
      }

      const reordered = [...current];
      const [removed] = reordered.splice(sourceIndex, 1);
      reordered.splice(targetIndex, 0, removed);
      return reordered;
    });

    setDraggingColumnId(null);
    setDropTargetColumnId(null);
  };

  const handleExportCsv = () => {
    if (!filteredItems.length || !visibleColumns.length) {
      return;
    }

    const columnIds = visibleColumns.map((column) => column.id);
    const csvHeader = columnIds.map(escapeCsvValue).join(";");
    const csvRows = filteredItems.map((item) =>
      columnIds.map((columnId) => escapeCsvValue(item[columnId] == null ? "" : String(item[columnId]))).join(";"),
    );

    const blob = new Blob([[csvHeader, ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedPath.replaceAll("/", "_").replace(/^_/, "") || "tce"}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return {
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
    setFieldValue: (name: string, value: string) => setFormValues((current) => ({ ...current, [name]: value })),
    setQuickSearch: (value: string) => {
      setQuickSearch(value);
      setCurrentPage(1);
    },
    setShowColumnModal,
    setDraggingColumnId,
    setDropTargetColumnId,
    setCurrentPage,
    setColumnVisibility,
    handleSubmit,
    handleSortChange,
    handleColumnDrop,
    handleExportCsv,
  };

  function scheduleBackgroundRefresh(response: TceQueryResult) {
    clearPendingRefresh();

    if (response.metadata?.complete !== false || !lastQueryRef.current) {
      return;
    }

    refreshTimerRef.current = window.setTimeout(async () => {
      const latestQuery = lastQueryRef.current;
      if (!latestQuery) {
        return;
      }

      try {
        const refreshedResponse = await queryTce(latestQuery.path, latestQuery.params);
        setResult(refreshedResponse);

        const nextColumns = buildColumnsFromItems(refreshedResponse.data || []);
        setColumns(nextColumns);
        setSortColumnId((current) => current || nextColumns[0]?.id || null);

        const totalFromMetadata = Number(
          refreshedResponse.data?.length ?? refreshedResponse.metadata?.total ?? refreshedResponse.metadata?.length ?? 0,
        );
        setMessageQuery(buildQueryMessage(refreshedResponse, totalFromMetadata));

        if (refreshedResponse.metadata?.complete === false) {
          scheduleBackgroundRefresh(refreshedResponse);
        }
      } catch {
        scheduleBackgroundRefresh(response);
      }
    }, 1500);
  }

  function clearPendingRefresh() {
    if (refreshTimerRef.current != null) {
      window.clearTimeout(refreshTimerRef.current);
      refreshTimerRef.current = null;
    }
  }
}

function buildColumnsFromItems(items: Record<string, unknown>[]): TceColumnDefinition[] {
  const columnIds = Array.from(
    items.reduce((columnSet, item) => {
      Object.keys(item).forEach((key) => columnSet.add(key));
      return columnSet;
    }, new Set<string>()),
  );

  return columnIds.map((columnId) => ({
    id: columnId,
    label: formatColumnLabel(columnId),
    active: true,
  }));
}

function escapeCsvValue(value: string) {
  return `"${value.replaceAll('"', '""')}"`;
}

function buildHiddenDefaultParams(selectedEndpoint: TceEndpoint | null) {
  const parameterNames = new Set(selectedEndpoint?.parameters.map((parameter) => parameter.name) ?? []);
  const defaults: Record<string, string> = {};

  if (parameterNames.has("quantidade")) {
    defaults.quantidade = "100";
  }

  return defaults;
}

function requiresMunicipality(selectedEndpoint: TceEndpoint | null) {
  return selectedEndpoint?.required_parameters.some((parameter) => parameter.name === "codigo_municipio") ?? false;
}

function buildQueryMessage(response: TceQueryResult, totalFromMetadata: number) {
  if (totalFromMetadata <= 0) {
    return "Nenhum registro retornado pelo TCE-CE para os parametros informados.";
  }

  if (response.metadata?.complete === false) {
    return `Carregando ${response.data.length} registros...`;
  }

  return `${totalFromMetadata} registros retornados pelo TCE-CE.`;
}
