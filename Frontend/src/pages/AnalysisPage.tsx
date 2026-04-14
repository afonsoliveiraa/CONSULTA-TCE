import { type FunctionalComponent } from "preact";
import { useMemo, useRef, useState } from "preact/hooks";
import { DownloadIcon } from "../components/GridIcons";
import { analisarArquivoNE } from "../services/analysesApi";

type AnalysisStep = 1 | 2 | 3;

interface AnalysisContract {
  numero_contrato?: string | null;
  cpf_gestor?: string | null;
  data_assinatura?: string | null;
}

interface AnalysisRowData {
  numero_contrato?: string | null;
  cpf_gestor_contrato?: string | null;
  data_assinatura_contrato?: string | null;
  cod_municipio?: string | null;
}

interface AnalysisResult {
  line_number: number;
  data?: AnalysisRowData;
  contracts?: AnalysisContract[];
}

interface AnalysisPagination {
  count: number;
  page: number;
  last: number;
}

const formatDate = (value?: string | null) => {
  if (!value) {
    return "-";
  }

  const normalized = value.includes("T") ? value.split("T")[0] : value;
  const parts = normalized.split("-");

  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }

  return value;
};

const formatFileSize = (file: File | null) => {
  if (!file) {
    return "Nenhum arquivo carregado";
  }

  const sizeInKb = file.size / 1024;

  if (sizeInKb < 1024) {
    return `${sizeInKb.toFixed(1)} KB`;
  }

  return `${(sizeInKb / 1024).toFixed(2)} MB`;
};

const escapeCsvValue = (value: string) => `"${value.replaceAll('"', '""')}"`;

export const AnalysisNEPage: FunctionalComponent = () => {
  const stepItems: Array<{ id: AnalysisStep; label: string }> = [
    { id: 1, label: "Linhas" },
    { id: 2, label: "Arquivo" },
    { id: 3, label: "Resultado" },
  ];

  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState<AnalysisStep>(1);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [linhasInput, setLinhasInput] = useState("");
  const [resultados, setResultados] = useState<AnalysisResult[]>([]);
  const [meta, setMeta] = useState<AnalysisPagination | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [arrastandoArquivo, setArrastandoArquivo] = useState(false);

  const parseLinhas = (texto: string) => {
    const numeros = new Set<number>();

    texto.split(/[,; ]+/).forEach((parte) => {
      if (parte.includes("-")) {
        const [inicio, fim] = parte.split("-").map(Number);

        if (!Number.isNaN(inicio) && !Number.isNaN(fim)) {
          for (let valor = Math.min(inicio, fim); valor <= Math.max(inicio, fim); valor += 1) {
            if (valor > 0) {
              numeros.add(valor);
            }
          }
        }

        return;
      }

      const numero = Number(parte);

      if (!Number.isNaN(numero) && numero > 0) {
        numeros.add(numero);
      }
    });

    return Array.from(numeros).sort((a, b) => a - b);
  };

  const linhasNormalizadas = useMemo(() => parseLinhas(linhasInput), [linhasInput]);
  const linhasPreview = linhasNormalizadas.slice(0, 12);

  const executarAnalise = async (page = 1) => {
    if (!arquivo || linhasNormalizadas.length === 0) {
      return;
    }

    setCarregando(true);
    setErro("");

    try {
      const response = await analisarArquivoNE(arquivo, linhasNormalizadas, page);
      setResultados(response.data?.data || []);
      setMeta(response.data?.pagination || null);
      setStep(3);
    } catch {
      setErro("Falha ao processar a analise do arquivo.");
    } finally {
      setCarregando(false);
    }
  };

  const compararValores = (valorArquivo: unknown, valorSistema: unknown, tipo: "cpf" | "data" | "texto") => {
    const arquivoNormalizado = valorArquivo?.toString().trim() || "";
    const sistemaNormalizado = valorSistema?.toString().trim() || "";

    if (tipo === "cpf") {
      return arquivoNormalizado.replace(/\D/g, "") === sistemaNormalizado.replace(/\D/g, "");
    }

    if (tipo === "data") {
      return arquivoNormalizado.split("T")[0] === sistemaNormalizado.split("T")[0];
    }

    return arquivoNormalizado === sistemaNormalizado;
  };

  const handleFileSelection = (selectedFile: File | null) => {
    setArquivo(selectedFile);
    setErro("");
  };

  const resetAnalysis = () => {
    setStep(1);
    setArquivo(null);
    setResultados([]);
    setMeta(null);
    setErro("");
  };

  const resultadosComContrato = resultados.filter((resultado) => (resultado.contracts?.length || 0) > 0).length;
  const resultadosSemContrato = resultados.length - resultadosComContrato;

  const getStepState = (stepId: AnalysisStep) => {
    if (step === 3) {
      return "is-completed";
    }

    if (stepId < step) {
      return "is-completed";
    }

    return "is-pending";
  };

  const canNavigateToStep = (stepId: AnalysisStep) => {
    if (stepId === 1) {
      return true;
    }

    if (stepId === 2) {
      return linhasNormalizadas.length > 0 || step >= 2;
    }

    return resultados.length > 0 || step >= 3;
  };

  const handleExportCsv = () => {
    if (!resultados.length) {
      return;
    }

    const csvHeader = [
      "linha",
      "municipio",
      "status_contrato",
      "numero_contrato_arquivo",
      "numero_contrato_sistema",
      "numero_contrato_divergente",
      "cpf_gestor_arquivo",
      "cpf_gestor_sistema",
      "cpf_gestor_divergente",
      "data_assinatura_arquivo",
      "data_assinatura_sistema",
      "data_assinatura_divergente",
    ].map(escapeCsvValue).join(";");

    const csvRows = resultados.map((resultado) => {
      const contratoBase = resultado.contracts?.[0] || {};
      const semContrato = (resultado.contracts?.length || 0) === 0;

      return [
        String(resultado.line_number),
        resultado.data?.cod_municipio || "",
        semContrato ? "Sem contrato" : "Contrato localizado",
        resultado.data?.numero_contrato || "",
        contratoBase.numero_contrato || "",
        compararValores(resultado.data?.numero_contrato, contratoBase.numero_contrato, "texto") ? "Nao" : "Sim",
        resultado.data?.cpf_gestor_contrato || "",
        contratoBase.cpf_gestor || "",
        compararValores(resultado.data?.cpf_gestor_contrato, contratoBase.cpf_gestor, "cpf") ? "Nao" : "Sim",
        formatDate(resultado.data?.data_assinatura_contrato),
        formatDate(contratoBase.data_assinatura),
        compararValores(resultado.data?.data_assinatura_contrato, contratoBase.data_assinatura, "data") ? "Nao" : "Sim",
      ].map((value) => escapeCsvValue(String(value))).join(";");
    });

    const blob = new Blob([[csvHeader, ...csvRows].join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `analise_divergencias_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const renderComparisonField = (
    label: string,
    valorArquivo: unknown,
    valorSistema: unknown,
    tipo: "cpf" | "data" | "texto" = "texto",
  ) => {
    const divergente = !compararValores(valorArquivo, valorSistema, tipo);
    const valorArquivoFormatado =
      tipo === "data" ? formatDate(valorArquivo as string | null | undefined) : (valorArquivo as string) || "-";
    const valorSistemaFormatado =
      tipo === "data" ? formatDate(valorSistema as string | null | undefined) : (valorSistema as string) || "-";

    return (
      <div class={`analysis-compare-card${divergente ? " is-divergent" : ""}`}>
        <div class="analysis-compare-card__label">{label}</div>
        <div class="analysis-compare-card__values">
          <div>
            <span>Arquivo</span>
            <strong>{valorArquivoFormatado}</strong>
          </div>
          <div>
            <span>Sistema</span>
            <strong>{valorSistemaFormatado}</strong>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div class="contracts-upload-shell analysis-page">
      <div class="contracts-topbar analysis-header-row">
        <div class="contracts-breadcrumbs">
          <span>Processos</span>
          <span>/</span>
          <strong>Analise de divergencias</strong>
        </div>

        <div class="contracts-steps analysis-steps">
          {stepItems.map((item) => (
            <button
              key={item.id}
              type="button"
              class={`contracts-step ${getStepState(item.id)}`}
              disabled={!canNavigateToStep(item.id)}
              aria-current={step === item.id ? "step" : undefined}
              onClick={() => {
                if (canNavigateToStep(item.id)) {
                  setStep(item.id);
                }
              }}
            >
              <span>{item.id}</span>
              <strong>{item.label}</strong>
            </button>
          ))}
        </div>
      </div>

      <div class="contracts-grid contracts-grid--single">
        <article class="contracts-card">
          {step === 3 ? (
            <div class="analysis-results-toolbar analysis-results-toolbar--top">
              <div class="analysis-results-toolbar__copy">
                <h2>Resultado da analise</h2>
                <p>Expanda cada linha para ver os campos comparados entre arquivo e sistema.</p>
              </div>
              <div class="grid-demo__toolbar contracts-results__toolbar">
                <div class="grid-demo__toolbar-buttons">
                  <button class="grid-demo__text-button" type="button" onClick={handleExportCsv}>
                    <span class="grid-demo__toolbar-icon contracts-results__action-icon" aria-hidden="true">
                      <DownloadIcon />
                    </span>
                    Exportar CSV
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {step !== 3 ? (
            <div class="contracts-card__header">
              <div>
                <h2>{step === 1 ? "Defina as linhas com erro" : "Anexe o arquivo para validacao"}</h2>
                <p class="contracts-card__subtitle">
                  {step === 1
                    ? "Informe linhas isoladas ou intervalos. Exemplo: 113, 150, 201-205."
                    : "Carregue o arquivo .DCD que sera confrontado com a base interna de contratos."}
                </p>
              </div>
            </div>
          ) : null}

          {step === 1 ? (
            <div class="contracts-form analysis-form">
              <label class="contracts-field analysis-field">
                <span>Linhas sinalizadas</span>
                <textarea
                  class="analysis-textarea"
                  placeholder="Ex.: 113, 150, 201-205"
                  value={linhasInput}
                  onInput={(event) => setLinhasInput(event.currentTarget.value)}
                />
              </label>

              <div class="analysis-inline-meta">
                <div class="analysis-inline-meta__item">
                  <strong>{linhasNormalizadas.length}</strong>
                  <span>linhas validas identificadas</span>
                </div>
                <div class="analysis-inline-meta__item">
                  <strong>{linhasPreview[0] ?? "-"}</strong>
                  <span>primeira linha considerada</span>
                </div>
              </div>

              <div class="analysis-lines-preview">
                {linhasPreview.length > 0 ? (
                  linhasPreview.map((linha) => (
                    <span key={linha} class="analysis-line-chip">
                      Linha {linha}
                    </span>
                  ))
                ) : (
                  <p>Nenhuma linha valida foi identificada ainda.</p>
                )}

                {linhasNormalizadas.length > linhasPreview.length ? (
                  <span class="analysis-line-chip analysis-line-chip--muted">
                    +{linhasNormalizadas.length - linhasPreview.length} adicionais
                  </span>
                ) : null}
              </div>

              <div class="analysis-actions">
                <button
                  type="button"
                  class="contracts-button contracts-button--primary"
                  disabled={linhasNormalizadas.length === 0}
                  onClick={() => setStep(2)}
                >
                  Avancar para upload
                </button>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div class="contracts-form analysis-form">
              <div
                class={`contracts-dropzone contracts-dropzone--refined analysis-dropzone${arrastandoArquivo ? " is-dragging" : ""}${arquivo ? " is-ready" : ""}`}
                onClick={() => inputArquivoRef.current?.click()}
                onDragOver={(event) => {
                  event.preventDefault();
                  setArrastandoArquivo(true);
                }}
                onDragLeave={(event) => {
                  event.preventDefault();
                  setArrastandoArquivo(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setArrastandoArquivo(false);
                  handleFileSelection(event.dataTransfer?.files[0] ?? null);
                }}
              >
                <div class="contracts-dropzone__header">
                  <div class="contracts-dropzone__header-copy">
                    <span>Arquivo de validacao</span>
                    <strong>{arquivo ? arquivo.name : "Selecione ou arraste um arquivo .DCD"}</strong>
                  </div>
                  <div class="contracts-dropzone__type-icon">DCD</div>
                </div>

                <div class="contracts-dropzone__body">
                  <p class="contracts-dropzone__headline">
                    {arquivo ? "Arquivo pronto para analise" : "Envie um arquivo .DCD para validacao."}
                  </p>
                  <div class="contracts-dropzone__actions">
                    <button type="button" class="contracts-button contracts-button--picker">
                      {arquivo ? "Trocar arquivo" : "Selecionar arquivo"}
                    </button>
                    <span class="contracts-dropzone__hint">{formatFileSize(arquivo)}</span>
                  </div>
                </div>
              </div>

              <input
                ref={inputArquivoRef}
                class="contracts-file-input-hidden"
                type="file"
                accept=".DCD,.dcd"
                onChange={(event) => handleFileSelection(event.currentTarget.files?.[0] ?? null)}
              />

              <div class="analysis-actions analysis-actions--split">
                <button type="button" class="contracts-button analysis-button--ghost" onClick={() => setStep(1)}>
                  Voltar
                </button>
                <button
                  type="button"
                  class="contracts-button contracts-button--primary"
                  disabled={carregando || !arquivo}
                  onClick={() => executarAnalise(1)}
                >
                  {carregando ? "Analisando..." : "Executar analise"}
                </button>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div class="contracts-form analysis-form">
              <div class="analysis-metrics">
                <div class="analysis-metric">
                  <small>Total analisado</small>
                  <strong>{meta?.count ?? resultados.length}</strong>
                  <span>linhas retornadas</span>
                </div>
                <div class="analysis-metric">
                  <small>Com correspondencia</small>
                  <strong>{resultadosComContrato}</strong>
                  <span>linhas com contrato localizado</span>
                </div>
                <div class="analysis-metric">
                  <small>Sem correspondencia</small>
                  <strong>{resultadosSemContrato}</strong>
                  <span>linhas sem contrato aderente</span>
                </div>
              </div>

              <div class="analysis-results-list">
                {resultados.length > 0 ? (
                  resultados.map((resultado) => {
                    const contratoBase = resultado.contracts?.[0] || {};
                    const semContrato = (resultado.contracts?.length || 0) === 0;

                    return (
                      <section key={resultado.line_number} class="analysis-result-card analysis-result-card--open">
                        <div class="analysis-result-card__summary">
                          <div class="analysis-result-card__main">
                            <span class="analysis-result-card__line">Linha {resultado.line_number}</span>
                            <strong>{resultado.data?.numero_contrato || "Contrato nao informado"}</strong>
                            <small>Municipio {resultado.data?.cod_municipio || "-"}</small>
                          </div>

                          <div class="analysis-result-card__meta">
                            <span class={`analysis-status-badge${semContrato ? " is-missing" : " is-match"}`}>
                              {semContrato ? "Sem contrato" : "Contrato localizado"}
                            </span>
                            <small>Comparacao completa exibida abaixo</small>
                          </div>
                        </div>

                        <div class="analysis-result-card__content">
                          <div class="analysis-result-card__grid">
                            {renderComparisonField(
                              "Numero do contrato",
                              resultado.data?.numero_contrato,
                              contratoBase.numero_contrato,
                            )}
                            {renderComparisonField(
                              "CPF do gestor",
                              resultado.data?.cpf_gestor_contrato,
                              contratoBase.cpf_gestor,
                              "cpf",
                            )}
                            {renderComparisonField(
                              "Data de assinatura",
                              resultado.data?.data_assinatura_contrato,
                              contratoBase.data_assinatura,
                              "data",
                            )}
                          </div>
                        </div>
                      </section>
                    );
                  })
                ) : (
                  <div class="contracts-empty">
                    <p>Nenhuma divergencia retornada para os filtros informados.</p>
                  </div>
                )}
              </div>

              {meta && meta.last > 1 ? (
                <div class="tce-pagination">
                  <strong>
                    Pagina {meta.page} de {meta.last}
                  </strong>
                  <div class="tce-pagination__actions">
                    <button
                      type="button"
                      class="contracts-button tce-pagination__button"
                      disabled={carregando || meta.page === 1}
                      onClick={() => executarAnalise(meta.page - 1)}
                    >
                      Anterior
                    </button>
                    <button
                      type="button"
                      class="contracts-button tce-pagination__button"
                      disabled={carregando || meta.page === meta.last}
                      onClick={() => executarAnalise(meta.page + 1)}
                    >
                      Proxima
                    </button>
                  </div>
                </div>
              ) : null}

              <div class="analysis-actions analysis-actions--split">
                <button type="button" class="contracts-button analysis-button--ghost" onClick={() => setStep(2)}>
                  Trocar arquivo
                </button>
                <button type="button" class="contracts-button contracts-button--primary" onClick={resetAnalysis}>
                  Nova analise
                </button>
              </div>
            </div>
          ) : null}

          {erro ? <p class="contracts-feedback contracts-feedback--error">{erro}</p> : null}
        </article>
      </div>
    </div>
  );
};
