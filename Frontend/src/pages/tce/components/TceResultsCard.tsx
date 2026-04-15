import { type FunctionalComponent } from "preact";
import { ColumnsIcon, DownloadIcon, SearchIcon, SortIcon } from "../../../components/GridIcons";
import type { SortDirection } from "../../../lib/sort";
import type { TceColumnDefinition } from "../../../types/tce";
import { formatTceValue } from "../tcePresentation";

interface TceResultsCardProps {
  endpointLabel: string;
  endpointPath: string;
  sourceUrl: string;
  loadingQuery: boolean;
  messageQuery: string;
  errorQuery: string;
  quickSearch: string;
  totalItems: number;
  visibleColumns: TceColumnDefinition[];
  filteredItems: Record<string, unknown>[];
  sortColumnId: string | null;
  sortDirection: SortDirection;
  dropTargetColumnId: string | null;
  onQuickSearchChange: (value: string) => void;
  onShowColumnModal: () => void;
  onSortChange: (columnId: string) => void;
  onDragStart: (columnId: string | null) => void;
  onDragOver: (event: DragEvent, columnId: string) => void;
  onDragLeave: (columnId: string) => void;
  onDrop: (columnId: string) => void;
  onDragEnd: () => void;
  onExportCsv: () => void;
}

export const TceResultsCard: FunctionalComponent<TceResultsCardProps> = ({
  endpointLabel,
  endpointPath,
  sourceUrl,
  loadingQuery,
  messageQuery,
  errorQuery,
  quickSearch,
  totalItems,
  visibleColumns,
  filteredItems,
  sortColumnId,
  sortDirection,
  dropTargetColumnId,
  onQuickSearchChange,
  onShowColumnModal,
  onSortChange,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onExportCsv,
}) => (
  <article class="contracts-results contracts-results--consulta">
    <div class="contracts-results__header">
      <div>
        <strong>Resultados da consulta</strong>
      </div>
    </div>

    <div>
      {messageQuery ? <p class="contracts-feedback contracts-feedback--neutral">{messageQuery}</p> : null}
      {errorQuery ? <p class="contracts-feedback contracts-feedback--error">{errorQuery}</p> : null}
    </div>

    <div class="grid-demo__toolbar contracts-results__toolbar">
      <div class="grid-demo__toolbar-buttons">
        <button class="grid-demo__text-button" type="button" onClick={onShowColumnModal}>
          <span class="grid-demo__toolbar-icon contracts-results__action-icon" aria-hidden="true">
            <ColumnsIcon />
          </span>
          Colunas
        </button>
        <button class="grid-demo__text-button" type="button" onClick={onExportCsv} disabled={!totalItems}>
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
              onInput={(event) => onQuickSearchChange(event.currentTarget.value)}
              placeholder="Busque em qualquer campo"
              disabled={!totalItems}
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
            {visibleColumns.length ? (
              visibleColumns.map((column) => (
                <th
                  key={column.id}
                  class={`grid-demo__head-cell${dropTargetColumnId === column.id ? " is-drop-target" : ""}`}
                  draggable
                  onDragStart={() => onDragStart(column.id)}
                  onDragOver={(event) => onDragOver(event, column.id)}
                  onDragLeave={() => onDragLeave(column.id)}
                  onDrop={() => onDrop(column.id)}
                  onDragEnd={onDragEnd}
                >
                  <button
                    class={`grid-demo__sort-button${sortColumnId === column.id ? " grid-demo__sort-button--active" : ""}`}
                    type="button"
                    onClick={() => onSortChange(column.id)}
                  >
                    <span>{column.label}</span>
                    <SortIcon active={sortColumnId === column.id} direction={sortDirection} />
                  </button>
                </th>
              ))
            ) : (
              <th>Sem colunas</th>
            )}
          </tr>
        </thead>
        <tbody>
          {loadingQuery ? (
            <tr>
              <td class="contracts-table__empty-cell" colSpan={Math.max(visibleColumns.length, 1)}>
                Carregando dados...
              </td>
            </tr>
          ) : filteredItems.length ? (
            filteredItems.map((item, rowIndex) => (
              <tr key={`${rowIndex}-${String(item[visibleColumns[0]?.id ?? "row"] ?? rowIndex)}`}>
                {visibleColumns.map((column) => (
                  <td key={column.id}>{formatTceValue(column.id, item[column.id] == null ? "" : String(item[column.id]))}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td class="contracts-table__empty-cell" colSpan={Math.max(visibleColumns.length, 1)}>
                {errorQuery
                  ? "Nao foi possivel carregar os dados."
                  : "Nenhum registro foi encontrado para os filtros aplicados."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    <div class="grid-demo__toolbar contracts-results__toolbar contracts-results__toolbar--pagination">
      <div class="grid-demo__toolbar-buttons" />
      <div class="grid-demo__toolbar-actions">
        <span>
          Registros exibidos <strong>{filteredItems.length}</strong> de <strong>{totalItems}</strong>
        </span>
      </div>
    </div>
  </article>
);
