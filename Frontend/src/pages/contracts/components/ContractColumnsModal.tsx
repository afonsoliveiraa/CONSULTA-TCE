import { type FunctionalComponent } from "preact";
import type { ContratoColumnDefinition, ContratoColumnId } from "../contractQuery.types";

interface ContractColumnsModalProps {
  columns: ContratoColumnDefinition[];
  onClose: () => void;
  onColumnVisibilityChange: (columnId: ContratoColumnId, checked: boolean) => void;
}

// Modal isolado para configuracao das colunas visiveis da grade.
export const ContractColumnsModal: FunctionalComponent<ContractColumnsModalProps> = ({
  columns,
  onClose,
  onColumnVisibilityChange,
}) => (
  <div class="grid-demo__modal-backdrop" role="presentation" onClick={onClose}>
    <div
      class="grid-demo__modal"
      role="dialog"
      aria-modal="true"
      aria-label="Selecionar colunas"
      onClick={(event) => event.stopPropagation()}
    >
      <div class="grid-demo__modal-header">
        <strong>Selecionar colunas</strong>
        <button class="grid-demo__modal-close" type="button" onClick={onClose}>
          x
        </button>
      </div>

      <div class="grid-demo__modal-body">
        {columns.map((column) => (
          <label key={column.id} class="grid-demo__modal-option">
            <input
              type="checkbox"
              checked={column.active !== false}
              onChange={(event) =>
                onColumnVisibilityChange(column.id, (event.currentTarget as HTMLInputElement).checked)
              }
            />
            <span>{column.label}</span>
          </label>
        ))}
      </div>

      <div class="grid-demo__modal-hint">Arraste os titulos da tabela para reordenar as colunas.</div>

      <div class="grid-demo__modal-footer">
        <button class="grid-demo__modal-button grid-demo__modal-button--ghost" type="button" onClick={onClose}>
          Fechar
        </button>
        <button class="grid-demo__modal-button grid-demo__modal-button--primary" type="button" onClick={onClose}>
          Aplicar
        </button>
      </div>
    </div>
  </div>
);
