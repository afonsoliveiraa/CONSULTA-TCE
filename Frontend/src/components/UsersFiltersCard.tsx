import { type FunctionalComponent } from "preact";
import { SearchIcon } from "./GridIcons";

export const UsersFiltersCard: FunctionalComponent = () => {
  return (
    <article class="filters-card">
      <div class="filters-card__header">
        <strong>Filtros</strong>
        <button class="filters-card__toggle" type="button" aria-label="Expandir filtros">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M7 10l5 5 5-5z" fill="currentColor" />
          </svg>
        </button>
      </div>

      <div class="filters-card__fields">
        <label class="filters-card__field">
          <span class="filters-card__field-label">Nome</span>
          <div class="filters-card__input-wrap">
            <span class="filters-card__input-icon" aria-hidden="true">
              <SearchIcon />
            </span>
            <input type="text" value="" placeholder="Digite o nome do usuário..." />
          </div>
        </label>

        <label class="filters-card__field">
          <span class="filters-card__field-label">Login</span>
          <div class="filters-card__input-wrap">
            <span class="filters-card__input-icon" aria-hidden="true">
              <SearchIcon />
            </span>
            <input type="text" value="" placeholder="Digite o login do usuário..." />
          </div>
        </label>
      </div>
    </article>
  );
};
