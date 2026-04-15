import { type FunctionalComponent } from "preact";
import { useEffect, useState } from "preact/hooks";
import { showToast } from "../../../lib/toast";
import type { TceEndpoint, TceEndpointField, TceMunicipalityOption } from "../../../types/tce";

interface TceFiltersCardProps {
  municipalities: TceMunicipalityOption[];
  endpoints: TceEndpoint[];
  selectedMunicipalityCode: string;
  selectedPath: string;
  endpointSummary: string;
  dynamicParameters: TceEndpointField[];
  formValues: Record<string, string>;
  loadingQuery: boolean;
  messageQuery: string;
  errorQuery: string;
  onMunicipalityChange: (value: string) => void;
  onPathChange: (value: string) => void;
  onFieldChange: (name: string, value: string) => void;
  onSubmit: (event: Event) => Promise<void>;
}

export const TceFiltersCard: FunctionalComponent<TceFiltersCardProps> = ({
  municipalities,
  endpoints,
  selectedMunicipalityCode,
  selectedPath,
  endpointSummary,
  dynamicParameters,
  formValues,
  loadingQuery,
  messageQuery,
  errorQuery,
  onMunicipalityChange,
  onPathChange,
  onFieldChange,
  onSubmit,
}) => {
  const [showOptionalFields, setShowOptionalFields] = useState(false);

  useEffect(() => {
    if (messageQuery) {
      showToast({ message: messageQuery, tone: "success" });
    }
  }, [messageQuery]);

  useEffect(() => {
    if (errorQuery) {
      showToast({ message: errorQuery, tone: "error" });
    }
  }, [errorQuery]);

  useEffect(() => {
    setShowOptionalFields(false);
  }, [selectedPath]);

  const visibleParameters = dynamicParameters.filter(
    (field) => !["codigo_municipio", "quantidade", "deslocamento"].includes(field.name),
  );
  const requiredParameters = visibleParameters.filter((field) => field.required);
  const optionalParameters = visibleParameters.filter((field) => !field.required);

  const renderField = (field: TceEndpointField) => {
    const isRangeDateField = supportsDateRange(field);
    const { start, end } = splitDateRangeValue(formValues[field.name] ?? "");

    return (
      <label
        key={field.name}
        class={`filters-card__field tce-field${isRangeDateField ? " tce-field--range" : ""}`}
      >
        <span class="filters-card__field-label">
          {field.label || field.name}
          {field.required ? " *" : ""}
        </span>
        {isRangeDateField ? (
          <div class="tce-date-range">
            <div class="filters-card__input-wrap">
              <input
                type="date"
                value={start}
                onInput={(event) =>
                  onFieldChange(field.name, joinDateRangeValue(event.currentTarget.value, end))
                }
                placeholder="Data inicio"
              />
            </div>
            <div class="filters-card__input-wrap">
              <input
                type="date"
                value={end}
                onInput={(event) =>
                  onFieldChange(field.name, joinDateRangeValue(start, event.currentTarget.value))
                }
                placeholder="Data fim"
              />
            </div>
          </div>
        ) : (
          <div class="filters-card__input-wrap">
            <input
              type={field.name.includes("data") ? "date" : "text"}
              value={formValues[field.name] ?? ""}
              onInput={(event) => onFieldChange(field.name, event.currentTarget.value)}
              placeholder={buildFieldPlaceholder(field)}
            />
          </div>
        )}
      </label>
    );
  };

  return (
    <form class="contracts-form" onSubmit={onSubmit}>
      <article class="filters-card contracts-filters-card contracts-filters-card--standalone tce-filters-card--compact">
        <div class="filters-card__header">
          <strong>Filtros da consulta</strong>
        </div>

        <div class="tce-query-layout">
          <div class="tce-query-layout__primary">
            <div class="filters-card__fields tce-fields-grid tce-fields-grid--primary">
              <label class="filters-card__field tce-field">
                <span class="filters-card__field-label">Codigo do municipio</span>
                <div class="filters-card__input-wrap">
                  <select
                    class="tce-select tce-select--filter"
                    value={selectedMunicipalityCode}
                    onChange={(event) => onMunicipalityChange(event.currentTarget.value)}
                  >
                    <option value="">Selecione...</option>
                    {municipalities.map((municipality) => (
                      <option key={municipality.codigo_municipio} value={municipality.codigo_municipio}>
                        {municipality.nome_municipio}
                      </option>
                    ))}
                  </select>
                </div>
              </label>

              <label class="filters-card__field tce-field">
                <span class="filters-card__field-label">Servico</span>
                <div class="filters-card__input-wrap">
                  <select
                    class="tce-select tce-select--filter"
                    value={selectedPath}
                    onChange={(event) => onPathChange(event.currentTarget.value)}
                  >
                    {endpoints.map((endpoint) => (
                      <option key={endpoint.path} value={endpoint.path}>
                        {endpoint.label}
                      </option>
                    ))}
                  </select>
                </div>
              </label>
            </div>

            <p class="contracts-card__subtitle">{endpointSummary}</p>
          </div>

          <div class="tce-query-layout__secondary">
            <div class="filters-card__fields tce-fields-grid tce-fields-grid--required tce-fields-grid--dense">
              {requiredParameters.length ? requiredParameters.map(renderField) : (
                <p class="contracts-card__subtitle">Este servico nao exige campos adicionais.</p>
              )}
            </div>

            <div class="tce-filter-action tce-filter-action--inline">
              <button
                class="contracts-button contracts-button--secondary contracts-button--filter"
                type="submit"
                disabled={loadingQuery}
              >
                {loadingQuery ? "Consultando..." : "Consultar TCE"}
              </button>
            </div>
          </div>
        </div>
      </article>

      <article class="filters-card contracts-filters-card contracts-filters-card--standalone">
        <button
          class="tce-optional-toggle"
          type="button"
          onClick={() => setShowOptionalFields((current) => !current)}
          aria-expanded={showOptionalFields}
          aria-controls="tce-optional-fields"
        >
          <span>Campos opcionais</span>
          <strong>{showOptionalFields ? "Ocultar" : "Expandir"}</strong>
        </button>

        {showOptionalFields ? (
          optionalParameters.length ? (
            <div id="tce-optional-fields" class="filters-card__fields tce-fields-grid tce-fields-grid--optional tce-fields-grid--dense">
              {optionalParameters.map(renderField)}
            </div>
          ) : (
            <p id="tce-optional-fields" class="contracts-card__subtitle">Este servico nao possui campos opcionais disponiveis.</p>
          )
        ) : null}
      </article>
    </form>
  );
};

function supportsDateRange(field: TceEndpointField) {
  const description = field.description.toLowerCase();
  return (
    field.name.includes("data") &&
    (description.includes("interval") ||
      description.includes("yyyy-mm-dd_yyyy-mm-dd") ||
      description.includes("yyyymmdd_yyyymmdd"))
  );
}

function splitDateRangeValue(value: string) {
  const [start = "", end = ""] = value.split("_", 2);
  return { start, end };
}

function joinDateRangeValue(start: string, end: string) {
  if (start && end) {
    return `${start}_${end}`;
  }

  return start || end || "";
}

function buildFieldPlaceholder(field: TceEndpointField) {
  const description = field.description?.trim();
  if (!description) {
    return `Informe ${field.label?.toLowerCase() || field.name}`;
  }

  return description.length > 90 ? `${description.slice(0, 87)}...` : description;
}
