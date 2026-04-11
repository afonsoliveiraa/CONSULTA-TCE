import { useEffect, useMemo, useState } from "preact/hooks";
import { fetchTceEndpoints, fetchTceMunicipalities, queryTce } from "../services/tceApi";
import type {
  TceColumnDefinition,
  TceEndpoint,
  TceEndpointField,
  TceMunicipalityOption,
  TceQueryResult,
} from "../types/tce";
import { formatColumnLabel, formatTceValue } from "../pages/tce/tcePresentation";

// Encapsula todo o comportamento da pagina "API TCE".
export function useTceQuery() {
  const [endpoints, setEndpoints] = useState<TceEndpoint[]>([]);
  const [municipalities, setMunicipalities] = useState<TceMunicipalityOption[]>([]);
  const [selectedEndpointKey, setSelectedEndpointKey] = useState("contrato");
  const [selectedMunicipalityCode, setSelectedMunicipalityCode] = useState("");
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<TceQueryResult | null>(null);
  const [quickSearch, setQuickSearch] = useState("");
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [loadingQuery, setLoadingQuery] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columns, setColumns] = useState<TceColumnDefinition[]>([]);
  const [draggingColumnId, setDraggingColumnId] = useState<string | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadInitialData() {
      setLoadingCatalog(true);
      setErrorMessage("");

      try {
        const [loadedEndpoints, loadedMunicipalities] = await Promise.all([
          fetchTceEndpoints(),
          fetchTceMunicipalities(),
        ]);

        if (!active) {
          return;
        }

        setEndpoints(loadedEndpoints);
        setMunicipalities(loadedMunicipalities);

        if (!loadedEndpoints.some((endpoint) => endpoint.key === "contrato") && loadedEndpoints[0]) {
          setSelectedEndpointKey(loadedEndpoints[0].key);
        }
      } catch (error) {
        if (!active) {
          return;
        }

        setErrorMessage(
          error instanceof Error ? error.message : "Nao foi possivel carregar o catalogo da API TCE.",
        );
      } finally {
        if (active) {
          setLoadingCatalog(false);
        }
      }
    }

    void loadInitialData();

    return () => {
      active = false;
    };
  }, []);

  const activeEndpoint = useMemo(
    () => endpoints.find((endpoint) => endpoint.key === selectedEndpointKey) ?? null,
    [endpoints, selectedEndpointKey],
  );

  const selectedMunicipality = useMemo(
    () => municipalities.find((municipality) => municipality.code === selectedMunicipalityCode) ?? null,
    [municipalities, selectedMunicipalityCode],
  );

  const requiredFields = useMemo<TceEndpointField[]>(
    () => activeEndpoint?.requiredFields ?? [],
    [activeEndpoint],
  );

  const optionalFields = useMemo<TceEndpointField[]>(
    () => activeEndpoint?.optionalFields ?? [],
    [activeEndpoint],
  );

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.active !== false),
    [columns],
  );

  const filteredItems = useMemo(() => {
    if (!result) {
      return [];
    }

    const normalizedQuickSearch = quickSearch.trim().toLowerCase();
    if (!normalizedQuickSearch) {
      return result.items;
    }

    return result.items.filter((item) =>
      result.columns.some((column) =>
        formatTceValue(column, item[column]).toLowerCase().includes(normalizedQuickSearch),
      ),
    );
  }, [quickSearch, result]);

  useEffect(() => {
    if (!result) {
      setColumns([]);
      return;
    }

    setColumns((current) => {
      if (current.length === 0) {
        return result.columns.map((column) => ({
          id: column,
          label: formatColumnLabel(column),
          active: true,
        }));
      }

      const currentMap = new Map(current.map((column) => [column.id, column]));
      const nextColumns = result.columns.map((column) => {
        const existingColumn = currentMap.get(column);
        return {
          id: column,
          label: formatColumnLabel(column),
          active: existingColumn?.active ?? true,
        };
      });

      const orderedExistingColumns = current
        .map((column) => nextColumns.find((candidate) => candidate.id === column.id))
        .filter((column): column is TceColumnDefinition => column !== undefined);

      const newColumns = nextColumns.filter(
        (column) => !orderedExistingColumns.some((existingColumn) => existingColumn.id === column.id),
      );

      return [...orderedExistingColumns, ...newColumns];
    });
  }, [result]);

  const setFieldValue = (fieldName: string, fieldValue: string) => {
    setFormValues((current) => ({
      ...current,
      [fieldName]: fieldValue,
    }));
  };

  const setColumnVisibility = (columnId: string, checked: boolean) => {
    setColumns((current) =>
      current.map((column) =>
        column.id === columnId
          ? {
              ...column,
              active: checked,
            }
          : column,
      ),
    );
  };

  const handleColumnDrop = (targetId: string) => {
    if (!draggingColumnId || draggingColumnId === targetId) {
      setDraggingColumnId(null);
      setDropTargetColumnId(null);
      return;
    }

    setColumns((current) => {
      const sourceIndex = current.findIndex((column) => column.id === draggingColumnId);
      const targetIndex = current.findIndex((column) => column.id === targetId);

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

  const handleEndpointChange = (endpointKey: string) => {
    setSelectedEndpointKey(endpointKey);
    setFormValues({});
    setResult(null);
    setColumns([]);
    setSuccessMessage("");
    setErrorMessage("");
    setQuickSearch("");
  };

  const buildQueryParameters = () => {
    const normalizedParameters = { ...formValues };
    const dateFields = [...requiredFields, ...optionalFields];

    for (const field of dateFields) {
      if (field.type !== "date") {
        continue;
      }

      const startKey = `${field.name}_inicio`;
      const endKey = `${field.name}_fim`;
      const startDate = normalizedParameters[startKey]?.trim() ?? "";
      const endDate = normalizedParameters[endKey]?.trim() ?? "";

      delete normalizedParameters[startKey];
      delete normalizedParameters[endKey];

      if (startDate && endDate) {
        normalizedParameters[field.name] = `${startDate}_${endDate}`;
      } else if (startDate) {
        normalizedParameters[field.name] = startDate;
      } else if (endDate) {
        normalizedParameters[field.name] = endDate;
      }
    }

    return normalizedParameters;
  };

  const executeQuery = async (page: number) => {
    if (!activeEndpoint) {
      setErrorMessage("Selecione um assunto para consultar.");
      return;
    }

    if (!selectedMunicipality) {
      setErrorMessage("Selecione um municipio para realizar a consulta.");
      return;
    }

    setLoadingQuery(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const queryResult = await queryTce({
        municipalityCode: selectedMunicipality.code,
        municipalityName: selectedMunicipality.name,
        endpointKey: activeEndpoint.key,
        parameters: buildQueryParameters(),
        page,
        pageSize: 20,
      });

      setResult(queryResult);
      setSuccessMessage(
        queryResult.pagination.totalItems === 1
          ? "1 registro carregado para a grade."
          : `${queryResult.pagination.totalItems} registros mapeados para a consulta.`,
      );
    } catch (error) {
      setResult(null);
      setColumns([]);
      setErrorMessage(error instanceof Error ? error.message : "Falha ao consultar a API TCE.");
    } finally {
      setLoadingQuery(false);
    }
  };

  const handleSubmit = async (event: Event) => {
    event.preventDefault();
    await executeQuery(1);
  };

  const handlePageChange = async (nextPage: number) => {
    if (!result) {
      return;
    }

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    await executeQuery(nextPage);
  };

  const handleExportCsv = () => {
    if (!result || filteredItems.length === 0) {
      return;
    }

    const csvHeader = visibleColumns.map((column) => column.label).join(";");
    const csvRows = filteredItems.map((item) =>
      visibleColumns
        .map((column) => `"${formatTceValue(column.id, item[column.id]).replaceAll("\"", "\"\"")}"`)
        .join(";"),
    );

    const blob = new Blob([[csvHeader, ...csvRows].join("\n")], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `api-tce-${selectedEndpointKey || "consulta"}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return {
    endpoints,
    municipalities,
    activeEndpoint,
    selectedMunicipality,
    selectedEndpointKey,
    selectedMunicipalityCode,
    requiredFields,
    optionalFields,
    formValues,
    result,
    filteredItems,
    quickSearch,
    loadingCatalog,
    loadingQuery,
    errorMessage,
    successMessage,
    showColumnModal,
    columns,
    visibleColumns,
    dropTargetColumnId,
    setSelectedMunicipalityCode,
    setQuickSearch,
    setFieldValue,
    setShowColumnModal,
    setDraggingColumnId,
    setDropTargetColumnId,
    setColumnVisibility,
    handleEndpointChange,
    handleColumnDrop,
    handleSubmit,
    handlePageChange,
    handleExportCsv,
  };
}
