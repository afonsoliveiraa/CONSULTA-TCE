import { type FunctionalComponent } from "preact";
import { ColumnsIcon, DownloadIcon, SearchIcon, SortIcon } from "../../../components/GridIcons";
import type { SortDirection } from "../../../lib/sort";
import type { Bidding } from "../../../types/bidding";
import type { BiddingColumnDefinition, BiddingColumnId } from "../biddingQuery.types";
import { formatBiddingValue } from "../biddingQuery.utils";

interface BiddingResultsCardProps {
  licitacoes: Bidding[];
  filteredLicitacoes: Bidding[];
  carregandoConsulta: boolean;
  quickSearch: string;
  currentPage: number;
  totalItems: number;
  totalPages: number;
  sortColumnId: BiddingColumnId;
  sortDirection: SortDirection;
  visibleColumns: BiddingColumnDefinition[];
  dropTargetColumnId: BiddingColumnId | null;
  onQuickSearchChange: (value: string) => void;
  onShowColumnModal: (value: boolean) => void;
  onPageChange: (page: number) => void;
  onSortChange: (columnId: BiddingColumnId) => void;
  onDragStart: (columnId: BiddingColumnId) => void;
  onDragOver: (event: DragEvent, columnId: BiddingColumnId) => void;
  onDragLeave: (columnId: BiddingColumnId) => void;
  onDrop: (columnId: BiddingColumnId) => void;
  onDragEnd: () => void;
  onExportCsv: () => void;
}

export const BiddingResultsCard: FunctionalComponent<BiddingResultsCardProps> = ({
  licitacoes = [],
  filteredLicitacoes = [],
  carregandoConsulta,
  quickSearch,
  currentPage,
  totalItems,
  totalPages,
  sortColumnId,
  sortDirection,
  visibleColumns = [],
  dropTargetColumnId,
  onQuickSearchChange,
  onShowColumnModal,
  onPageChange,
  onSortChange,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onExportCsv,
}) => (
  <article class="contracts-results contracts-results--consulta">
    <div class="grid-demo__toolbar contracts-results__toolbar">
      <div class="grid-demo__toolbar-buttons">
        <button class="grid-demo__text-button" type="button" onClick={() => onShowColumnModal(true)}>
          <span class="grid-demo__toolbar-icon contracts-results__action-icon" aria-hidden="true">
            <ColumnsIcon />
          </span>
          Colunas
        </button>

        <button class="grid-demo__text-button" type="button" onClick={onExportCsv}>
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
                  <SortIcon
                    active={sortColumnId === column.id}
                    direction={sortColumnId === column.id ? sortDirection : "asc"}
                  />
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filteredLicitacoes.length > 0 ? (
            filteredLicitacoes.map((licitacao) => (
              <tr key={licitacao.id}>
                {visibleColumns.map((column) => (
                  <td key={column.id}>{formatBiddingValue(licitacao, column.id)}</td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td class="contracts-table__empty-cell" colSpan={visibleColumns.length || 1}>
                {carregandoConsulta
                  ? "Carregando dados..."
                  : licitacoes.length === 0
                    ? "Pesquise um numero de processo para carregar os dados na grade."
                    : "Nenhuma licitacao corresponde aos filtros aplicados."}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>

    {licitacoes.length > 0 ? (
      <div class="grid-demo__toolbar contracts-results__toolbar contracts-results__toolbar--pagination">
        <div class="grid-demo__toolbar-buttons">
          <button
            class="grid-demo__text-button"
            type="button"
            disabled={carregandoConsulta || currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            Anterior
          </button>

          <button
            class="grid-demo__text-button"
            type="button"
            disabled={carregandoConsulta || currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Proxima
          </button>
        </div>

        <div class="grid-demo__toolbar-actions">
          <span>
            Pagina <strong>{currentPage}</strong> de <strong>{Math.max(totalPages, 1)}</strong> • {totalItems} registros
          </span>
        </div>
      </div>
    ) : null}
  </article>
);
