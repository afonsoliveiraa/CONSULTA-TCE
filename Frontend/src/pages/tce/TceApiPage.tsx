import { type FunctionalComponent, Fragment } from "preact";
import { ColumnsIcon, DownloadIcon, SearchIcon, SortIcon } from "../../components/GridIcons";
import { useTceQuery } from "../../hooks/useTceQuery";
import { TceColumnsModal } from "./components/TceColumnsModal";
import { formatEndpointName, formatTceValue } from "./tcePresentation";

// Materializa a tela da API TCE no mesmo fluxo visual da consulta de contratos.
export const TceApiPage: FunctionalComponent = () => {
  const {
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
  } = useTceQuery();

  const renderField = (fieldName: string, fieldLabel: string, hint?: string, type = "text") => (
    <label key={fieldName} class="filters-card__field tce-field">
      <span class="filters-card__field-label">{fieldLabel}</span>
      <div class="filters-card__input-wrap">
        <span class="filters-card__input-icon" aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          type={type}
          value={formValues[fieldName] ?? ""}
          onInput={(event) => setFieldValue(fieldName, event.currentTarget.value)}
          placeholder={type === "date" ? undefined : `Preencha ${fieldLabel.toLowerCase()}`}
        />
      </div>
      {hint ? <small class="tce-field__hint">{hint}</small> : null}
    </label>
  );

  const renderEndpointField = (field: {
    name: string;
    label: string;
    description?: string;
    type: string;
  }) => {
    if (field.type === "date") {
      return (
        <Fragment key={field.name}>
          {renderField(
            `${field.name}_inicio`,
            `${field.label} inicial`,
            `Informe a data inicial para ${field.label.toLowerCase()}.`,
            "date",
          )}
          {renderField(
            `${field.name}_fim`,
            `${field.label} final`,
            "Se preencher as duas datas, a busca sera enviada como intervalo.",
            "date",
          )}
        </Fragment>
      );
    }

    return renderField(
      field.name,
      field.label,
      field.description,
      field.type === "number" ? "number" : "text",
    );
  };

  return (
    <>
      <div class="contracts-topbar">
        <div class="contracts-breadcrumbs">
          <span>Consultas</span>
          <span>&rsaquo;</span>
          <strong>API TCE</strong>
        </div>

        <div class="contracts-steps" aria-label="Etapas">
          <div class="contracts-step">
            <span aria-hidden="true">&#10003;</span>
            <strong>{selectedMunicipality?.name ?? "Municipio"}</strong>
          </div>
          <div class="contracts-step">
            <span aria-hidden="true">&#10003;</span>
            <strong>{activeEndpoint?.category ?? "Assunto"}</strong>
          </div>
          <div class="contracts-step">
            <span aria-hidden="true">&#10003;</span>
            <strong>{result ? `${result.pagination.totalItems} registros` : "Consulta"}</strong>
          </div>
        </div>
      </div>

      <form class="contracts-filters-form" onSubmit={handleSubmit}>
        <article class="filters-card contracts-filters-card contracts-filters-card--standalone">
          <div class="filters-card__header">
            <strong>Campos obrigatorios da consulta</strong>
          </div>

          <div class="filters-card__fields tce-fields-grid">
            <label class="filters-card__field tce-field">
              <span class="filters-card__field-label">Municipio</span>
              <div class="filters-card__input-wrap">
                <select
                  class="tce-select tce-select--filter"
                  value={selectedMunicipalityCode}
                  onChange={(event) => setSelectedMunicipalityCode(event.currentTarget.value)}
                  disabled={loadingCatalog}
                >
                  <option value="">Selecione um municipio</option>
                  {municipalities.map((municipality) => (
                    <option key={municipality.code} value={municipality.code}>
                      {municipality.name} ({municipality.code})
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label class="filters-card__field tce-field">
              <span class="filters-card__field-label">Assunto</span>
              <div class="filters-card__input-wrap">
                <select
                  class="tce-select tce-select--filter"
                  value={selectedEndpointKey}
                  onChange={(event) => handleEndpointChange(event.currentTarget.value)}
                  disabled={loadingCatalog || endpoints.length === 0}
                >
                  {endpoints.map((endpoint) => (
                    <option key={endpoint.key} value={endpoint.key}>
                      {formatEndpointName(endpoint)}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            {requiredFields.map((field) => renderEndpointField(field))}
          </div>
        </article>

        <article class="filters-card contracts-filters-card contracts-filters-card--standalone">
          <div class="filters-card__header">
            <strong>Campos opcionais da consulta</strong>
          </div>

          <div class="filters-card__fields tce-fields-grid tce-fields-grid--with-action">
            {optionalFields.length > 0 ? (
              optionalFields.map((field) => renderEndpointField(field))
            ) : (
              <p class="contracts-feedback contracts-feedback--neutral">
                Este assunto nao possui campos opcionais adicionais.
              </p>
            )}

            <div class="tce-filter-action">
              <button
                class="contracts-button contracts-button--secondary contracts-button--filter"
                type="submit"
                disabled={loadingCatalog || loadingQuery}
              >
                {loadingQuery ? "Buscando..." : "Buscar dados"}
              </button>
            </div>
          </div>

          {successMessage ? <p class="contracts-feedback contracts-feedback--success">{successMessage}</p> : null}
          {errorMessage ? <p class="contracts-feedback contracts-feedback--error">{errorMessage}</p> : null}

          <p class="contracts-feedback contracts-feedback--neutral">
            {selectedMunicipality && activeEndpoint
              ? `${selectedMunicipality.name} • ${formatEndpointName(activeEndpoint)}. Use a busca rapida da grade para refinar os resultados.`
              : "Selecione municipio, assunto e os campos necessarios para carregar os dados na grade abaixo."}
          </p>
        </article>
      </form>

      <article class="contracts-results contracts-results--consulta">
        <div class="grid-demo__toolbar contracts-results__toolbar">
          <div class="grid-demo__toolbar-buttons">
            <button class="grid-demo__text-button" type="button" onClick={() => setShowColumnModal(true)}>
              <span class="grid-demo__toolbar-icon contracts-results__action-icon" aria-hidden="true">
                <ColumnsIcon />
              </span>
              Colunas
            </button>

            <button class="grid-demo__text-button" type="button" onClick={handleExportCsv}>
              <span class="grid-demo__toolbar-icon contracts-results__action-icon" aria-hidden="true">
                <DownloadIcon />
              </span>
              Exportar
            </button>
          </div>

          <div class="grid-demo__toolbar-actions">
            <label class="grid-demo__search grid-demo__search--compact">
              <div class="grid-demo__search-field">
                <input
                  type="text"
                  value={quickSearch}
                  onInput={(event) => setQuickSearch(event.currentTarget.value)}
                  placeholder="Busque em qualquer campo"
                  disabled={!result}
                />
                <span class="grid-demo__search-icon" aria-hidden="true">
                  <SearchIcon />
                </span>
              </div>
            </label>
          </div>
        </div>

        <div class="contracts-table-wrap">
          <table class="contracts-table">
            <thead>
              <tr>
                {visibleColumns.map((column) => (
                  <th
                    key={column.id}
                    class={`grid-demo__head-cell${dropTargetColumnId === column.id ? " is-drop-target" : ""}`}
                    draggable
                    onDragStart={() => setDraggingColumnId(column.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      setDropTargetColumnId(column.id);
                    }}
                    onDragLeave={() => {
                      if (dropTargetColumnId === column.id) {
                        setDropTargetColumnId(null);
                      }
                    }}
                    onDrop={() => handleColumnDrop(column.id)}
                    onDragEnd={() => {
                      setDraggingColumnId(null);
                      setDropTargetColumnId(null);
                    }}
                  >
                    <button class="grid-demo__sort-button grid-demo__sort-button--active" type="button">
                      <span>{column.label}</span>
                      <SortIcon active />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result && filteredItems.length > 0 ? (
                filteredItems.map((item, rowIndex) => (
                  <tr key={`${rowIndex}-${result.endpointKey}`}>
                    {visibleColumns.map((column) => (
                      <td key={column.id}>{formatTceValue(column.id, item[column.id])}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td class="contracts-table__empty-cell" colSpan={Math.max(visibleColumns.length, 1)}>
                    {!result
                      ? "Preencha os filtros e clique em buscar para carregar os dados na grade."
                      : "Nenhum registro corresponde aos filtros aplicados."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {result ? (
          <div class="grid-demo__toolbar contracts-results__toolbar contracts-results__toolbar--pagination">
            <div class="grid-demo__toolbar-buttons">
              <button
                class="grid-demo__text-button"
                type="button"
                disabled={loadingQuery || result.pagination.page <= 1}
                onClick={() => handlePageChange(result.pagination.page - 1)}
              >
                Anterior
              </button>

              <button
                class="grid-demo__text-button"
                type="button"
                disabled={
                  loadingQuery ||
                  (!result.pagination.hasMorePages &&
                    result.pagination.totalPages > 0 &&
                    result.pagination.page >= result.pagination.totalPages)
                }
                onClick={() => handlePageChange(result.pagination.page + 1)}
              >
                Proxima
              </button>
            </div>

            <div class="grid-demo__toolbar-actions">
              <span>
                Pagina {result.pagination.page} de {Math.max(result.pagination.totalPages, 1)} •{" "}
                {result.pagination.totalItems} registros
              </span>
            </div>
          </div>
        ) : null}
      </article>

      {showColumnModal ? (
        <TceColumnsModal
          columns={columns}
          onClose={() => setShowColumnModal(false)}
          onColumnVisibilityChange={setColumnVisibility}
        />
      ) : null}
    </>
  );
};
