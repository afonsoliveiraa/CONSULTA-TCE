import { type FunctionalComponent } from "preact";
import { SearchIcon } from "../../../components/GridIcons";

interface ContractFiltersCardProps {
  numeroContrato: string;
  mensagemConsulta: string;
  erroConsulta: string;
  carregandoConsulta: boolean;
  onNumeroContratoChange: (value: string) => void;
  onSubmit: (event: Event) => Promise<void>;
}

// Centraliza a busca principal por numero do contrato.
export const ContractFiltersCard: FunctionalComponent<ContractFiltersCardProps> = ({
  numeroContrato,
  mensagemConsulta,
  erroConsulta,
  carregandoConsulta,
  onNumeroContratoChange,
  onSubmit,
}) => (
  <article class="filters-card contracts-filters-card contracts-filters-card--standalone">
    <div class="filters-card__header">
      <strong>Filtros da consulta</strong>
    </div>

    <form class="contracts-filters-form" onSubmit={onSubmit}>
      <div class="filters-card__fields">
        <label class="filters-card__field">
          <span class="filters-card__field-label">Numero</span>
          <div class="filters-card__input-wrap">
            <span class="filters-card__input-icon" aria-hidden="true">
              <SearchIcon />
            </span>
            <input
              id="numero-contrato"
              type="text"
              value={numeroContrato}
              onInput={(event) => onNumeroContratoChange(event.currentTarget.value)}
              placeholder="Deixe em branco para trazer todos os contratos"
            />
          </div>
        </label>

        <button
          class="contracts-button contracts-button--secondary contracts-button--filter"
          type="submit"
          disabled={carregandoConsulta}
        >
          {carregandoConsulta ? "Consultando..." : "Buscar contrato"}
        </button>
      </div>
    </form>

    {mensagemConsulta ? (
      <p class="contracts-feedback contracts-feedback--success">{mensagemConsulta}</p>
    ) : null}

    {erroConsulta ? (
      <p class="contracts-feedback contracts-feedback--error">{erroConsulta}</p>
    ) : null}

    <p class="contracts-feedback contracts-feedback--neutral">
      Deixe o campo em branco para carregar todos os contratos. Use "Busque em qualquer campo"
      para refinar a grade abaixo.
    </p>
  </article>
);
