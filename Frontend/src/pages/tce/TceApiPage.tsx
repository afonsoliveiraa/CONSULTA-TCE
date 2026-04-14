import { type FunctionalComponent } from "preact";
import { useTceQuery } from "../../hooks/useTceQuery";

export const TceApiPage: FunctionalComponent = () => {
  const {
    municipalities, categories, filteredEndpoints,
    selectedCategory, setSelectedCategory,
    selectedPath, setSelectedPath,
    selectedMunicipalityCode, setSelectedMunicipalityCode,
    endpointSummary, dynamicParameters, formValues,
    loadingQuery, setFieldValue, handleSubmit
  } = useTceQuery();

  const renderField = (f: any) => (
    <label key={f.name} class="filters-card__field tce-field">
      <span class="filters-card__field-label">{f.label || f.name}</span>
      <div class="filters-card__input-wrap">
        <input 
          type={f.name.includes("data") ? "date" : "text"} 
          value={formValues[f.name] ?? ""} 
          onInput={(e) => setFieldValue(f.name, e.currentTarget.value)} 
          placeholder={f.description}
        />
      </div>
    </label>
  );

  return (
    <form onSubmit={handleSubmit} class="contracts-filters-form">
      <article class="filters-card">
        <div class="filters-card__header">
          <strong>Parâmetros de Consulta</strong>
          <p style={{ fontSize: '11px', opacity: 0.7 }}>{endpointSummary}</p>
        </div>

        <div class="filters-card__fields tce-fields-grid">
          {/* 1. Município */}
          <label class="filters-card__field tce-field">
            <span class="filters-card__field-label">Município</span>
            <div class="filters-card__input-wrap">
              <select value={selectedMunicipalityCode} onChange={e => setSelectedMunicipalityCode(e.currentTarget.value)}>
                <option value="">Selecione...</option>
                {municipalities.map(m => (
                  <option key={m.codigo_municipio} value={m.codigo_municipio}>{m.nome_municipio}</option>
                ))}
              </select>
            </div>
          </label>

          {/* 2. Assunto (Categoria/Tag) */}
          <label class="filters-card__field tce-field">
            <span class="filters-card__field-label">Assunto</span>
            <div class="filters-card__input-wrap">
              <select value={selectedCategory} onChange={e => setSelectedCategory(e.currentTarget.value)}>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>
          </label>

          {/* 3. Endpoint (O serviço dentro do assunto) */}
          <label class="filters-card__field tce-field">
            <span class="filters-card__field-label">Serviço</span>
            <div class="filters-card__input-wrap">
              <select value={selectedPath} onChange={e => setSelectedPath(e.currentTarget.value)}>
                {filteredEndpoints.map(ep => (
                  <option key={ep.path} value={ep.path}>{ep.label}</option>
                ))}
              </select>
            </div>
          </label>
        </div>

        <div class="filters-card__fields tce-fields-grid" style={{ marginTop: '1.5rem', borderTop: '1px solid #eee', paddingTop: '1.5rem' }}>
          {/* Campos dinâmicos do endpoint selecionado */}
          {dynamicParameters.map(renderField)}
          
          <div class="tce-action-container">
            <button class="contracts-button" type="submit" disabled={loadingQuery}>
              {loadingQuery ? "Consultando..." : "Consultar"}
            </button>
          </div>
        </div>
      </article>
    </form>
  );
};