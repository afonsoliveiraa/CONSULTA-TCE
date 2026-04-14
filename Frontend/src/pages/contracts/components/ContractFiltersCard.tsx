import { type FunctionalComponent } from "preact";
import { useEffect } from "preact/hooks";
import { SearchIcon } from "../../../components/GridIcons";
import { showToast } from "../../../lib/toast";
import type { TceMunicipalityOption } from "../../../types/tce";

interface ContractFiltersCardProps {
  numeroContrato: string;
  codigoMunicipio: string;
  municipios: TceMunicipalityOption[];
  mensagemConsulta: string;
  erroConsulta: string;
  carregandoConsulta: boolean;
  onNumeroContratoChange: (value: string) => void;
  onCodigoMunicipioChange: (value: string) => void;
  onSubmit: (event: Event) => Promise<void>;
}

// Centraliza a busca principal por numero do contrato.
export const ContractFiltersCard: FunctionalComponent<ContractFiltersCardProps> = ({
  numeroContrato,
  codigoMunicipio,
  municipios,
  mensagemConsulta,
  erroConsulta,
  carregandoConsulta,
  onNumeroContratoChange,
  onCodigoMunicipioChange,
  onSubmit,
}) => {
  useEffect(() => {
    if (mensagemConsulta) {
      showToast({ message: mensagemConsulta, tone: "success" });
    }
  }, [mensagemConsulta]);

  useEffect(() => {
    if (erroConsulta) {
      showToast({ message: erroConsulta, tone: "error" });
    }
  }, [erroConsulta]);

  return (
    <article class="filters-card contracts-filters-card contracts-filters-card--standalone">
      <div class="filters-card__header">
        <strong>Filtros da consulta</strong>
      </div>

      <form class="contracts-filters-form" onSubmit={onSubmit}>
        <div class="filters-card__fields">
          <label class="filters-card__field">
            <span class="filters-card__field-label">Codigo do municipio</span>
            <div class="filters-card__input-wrap">
              <select
                id="codigo-municipio-contrato"
                value={codigoMunicipio}
                onChange={(event) => onCodigoMunicipioChange(event.currentTarget.value)}
                class="tce-select tce-select--filter"
              >
                <option value="">Todos os municipios importados</option>
                {municipios.map((municipio) => (
                  <option key={municipio.code} value={municipio.code}>
                    {municipio.name} ({municipio.code})
                  </option>
                ))}
              </select>
            </div>
          </label>

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
    </article>
  );
};
