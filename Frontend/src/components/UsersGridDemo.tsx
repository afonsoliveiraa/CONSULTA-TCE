import { type FunctionalComponent } from "preact";
import { useMemo, useState } from "preact/hooks";
import { ColumnsIcon, DownloadIcon, SearchIcon, SortIcon } from "./GridIcons";

type ColumnId = "name" | "email" | "status" | "role";

interface ColumnDefinition {
  id: ColumnId;
  label: string;
  active?: boolean;
}

const sampleUsers = [
  { name: "Ana Souza", email: "ana.souza@consulta.tcm.br", status: "Ativo", role: "Admin" },
  { name: "Bruno Lima", email: "bruno.lima@consulta.tcm.br", status: "Inativo", role: "Analista" },
  { name: "Camila Braga", email: "camila.braga@consulta.tcm.br", status: "Ativo", role: "Gestor" },
  { name: "Diego Santos", email: "diego.santos@consulta.tcm.br", status: "Pendente", role: "Analista" },
] as const;

export const UsersGridDemo: FunctionalComponent = () => {
  const [showColumnModal, setShowColumnModal] = useState(false);
  const [columns, setColumns] = useState<ColumnDefinition[]>([
    { id: "name", label: "Nome", active: true },
    { id: "email", label: "E-mail" },
    { id: "status", label: "Status" },
    { id: "role", label: "Funcao" },
  ]);
  const [draggingColumnId, setDraggingColumnId] = useState<ColumnId | null>(null);
  const [dropTargetColumnId, setDropTargetColumnId] = useState<ColumnId | null>(null);

  const visibleColumns = useMemo(
    () => columns.filter((column) => column.id === "name" || column.active !== false),
    [columns]
  );

  const setColumnVisibility = (columnId: ColumnId, checked: boolean) => {
    setColumns((current) =>
      current.map((column) =>
        column.id === columnId
          ? {
              ...column,
              active: columnId === "name" ? true : checked,
            }
          : column
      )
    );
  };

  const renderCell = (user: (typeof sampleUsers)[number], columnId: ColumnId) => {
    if (columnId === "status") {
      return (
        <span
          class={`grid-demo__status${
            user.status === "Ativo" ? " is-active" : user.status === "Pendente" ? " is-pending" : " is-inactive"
          }`}
        >
          {user.status}
        </span>
      );
    }

    return user[columnId];
  };

  const handleColumnDrop = (targetId: ColumnId) => {
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

  return (
    <>
      <article class="subject-card">
        <div class="grid-demo">
          <div class="grid-demo__toolbar">
            <div class="grid-demo__toolbar-buttons">
              <button class="grid-demo__text-button" type="button" onClick={() => setShowColumnModal(true)}>
                <span class="grid-demo__toolbar-icon" aria-hidden="true">
                  <ColumnsIcon />
                </span>
                Colunas
              </button>
              <button class="grid-demo__text-button" type="button">
                <span class="grid-demo__toolbar-icon" aria-hidden="true">
                  <DownloadIcon />
                </span>
                Exportar
              </button>
            </div>

            <div class="grid-demo__toolbar-actions">
              <label class="grid-demo__search">
                <span>Busca rapida</span>
                <div class="grid-demo__search-field">
                  <input type="text" value="" placeholder="Digite aqui" />
                  <span class="grid-demo__search-icon" aria-hidden="true">
                    <SearchIcon />
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div class="grid-demo__frame">
            <table class="grid-demo__table">
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
                      <button
                        class={`grid-demo__sort-button${column.active ? " grid-demo__sort-button--active" : ""}`}
                        type="button"
                      >
                        <span>{column.label}</span>
                        <SortIcon active={column.active} />
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sampleUsers.map((user) => (
                  <tr>
                    {visibleColumns.map((column) => (
                      <td key={column.id}>{renderCell(user, column.id)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div class="grid-demo__footer">
            <div class="grid-demo__rows-per-page">
              <span>Itens por pagina:</span>
              <strong>4</strong>
            </div>

            <div class="grid-demo__pagination">
              <span class="grid-demo__footer-summary">1-4 de 4</span>
              <button class="grid-demo__nav-button" type="button" aria-label="Pagina anterior">‹</button>
              <button class="grid-demo__nav-button" type="button" aria-label="Proxima pagina">›</button>
            </div>
          </div>
        </div>
      </article>

      {showColumnModal ? (
        <div class="grid-demo__modal-backdrop" role="presentation" onClick={() => setShowColumnModal(false)}>
          <div
            class="grid-demo__modal"
            role="dialog"
            aria-modal="true"
            aria-label="Selecionar colunas"
            onClick={(event) => event.stopPropagation()}
          >
            <div class="grid-demo__modal-header">
              <strong>Selecionar colunas</strong>
              <button class="grid-demo__modal-close" type="button" onClick={() => setShowColumnModal(false)}>✕</button>
            </div>

            <div class="grid-demo__modal-body">
              {columns.map((column) => (
                <label key={column.id} class="grid-demo__modal-option">
                  <input
                    type="checkbox"
                    checked={column.id === "name" ? true : column.active !== false}
                    disabled={column.id === "name"}
                    onChange={(event) =>
                      setColumnVisibility(column.id, (event.currentTarget as HTMLInputElement).checked)
                    }
                  />
                  <span>{column.label}</span>
                </label>
              ))}
            </div>

            <div class="grid-demo__modal-hint">Arraste os títulos da tabela para reordenar as colunas.</div>

            <div class="grid-demo__modal-footer">
              <button class="grid-demo__modal-button grid-demo__modal-button--ghost" type="button" onClick={() => setShowColumnModal(false)}>
                Fechar
              </button>
              <button class="grid-demo__modal-button grid-demo__modal-button--primary" type="button" onClick={() => setShowColumnModal(false)}>
                Aplicar
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};
