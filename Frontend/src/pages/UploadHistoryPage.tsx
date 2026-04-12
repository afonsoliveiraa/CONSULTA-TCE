import { type FunctionalComponent } from "preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { Icon, type IconName } from "../components/Icon";
import { showToast } from "../lib/toast";
import { uploadContratos, uploadLicitacoes, uploadVeiculos, type UploadResource } from "../services/contratosApi";

type UploadTone = "contracts" | "biddings" | "vehicles";

type UploadCardContent = {
  code: string;
  tone: UploadTone;
  sectionLabel: string;
  title: string;
  subtitle: string;
  description: string;
  actionLabel: string;
  emptyState: string;
  expectedExtension: string;
  icon: IconName;
};

const uploadContentByType: Record<UploadResource, UploadCardContent> = {
  contracts: {
    code: "CO",
    tone: "contracts",
    sectionLabel: "Contratos",
    title: "Selecionar arquivos de contratos",
    subtitle: "Arraste os arquivos para esta area ou abra o explorador manualmente.",
    description: "Importacao historica de contratos do SIM.",
    actionLabel: "contratos",
    emptyState: "Nenhum arquivo selecionado.",
    expectedExtension: "LCO",
    icon: "file",
  },
  biddings: {
    code: "LI",
    tone: "biddings",
    sectionLabel: "Licitacoes",
    title: "Selecionar arquivos de licitacoes",
    subtitle: "Arraste os arquivos para esta area ou abra o explorador manualmente.",
    description: "Importacao historica de licitacoes do SIM.",
    actionLabel: "licitacoes",
    emptyState: "Nenhum arquivo selecionado.",
    expectedExtension: "LCO",
    icon: "file",
  },
  vehicles: {
    code: "VM",
    tone: "vehicles",
    sectionLabel: "Veiculos",
    title: "Selecionar arquivos de veiculos",
    subtitle: "Arraste os arquivos para esta area ou abra o explorador manualmente.",
    description: "Importacao historica de veiculos municipais do SIM.",
    actionLabel: "veiculos",
    emptyState: "Nenhum arquivo selecionado.",
    expectedExtension: "VCL",
    icon: "file",
  },
};

function formatFileSize(size: number) {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export const UploadHistoryPage: FunctionalComponent = () => {
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [tipoUpload, setTipoUpload] = useState<UploadResource>("contracts");
  const [mensagemUpload, setMensagemUpload] = useState("");
  const [erroUpload, setErroUpload] = useState("");
  const [carregandoUpload, setCarregandoUpload] = useState(false);
  const [arrastandoArquivo, setArrastandoArquivo] = useState(false);

  useEffect(() => {
    if (mensagemUpload) {
      showToast({ message: mensagemUpload, tone: "success" });
    }
  }, [mensagemUpload]);

  useEffect(() => {
    if (erroUpload) {
      showToast({ message: erroUpload, tone: "error" });
    }
  }, [erroUpload]);

  const lidarComSelecao = (lista: FileList | null) => {
    if (!lista) return;

    setArquivos(Array.from(lista));
    setMensagemUpload("");
    setErroUpload("");
  };

  const executarUpload = async () => {
    if (arquivos.length === 0) return;

    setCarregandoUpload(true);
    setMensagemUpload("");
    setErroUpload("");

    try {
      const mensagem =
        tipoUpload === "contracts"
          ? await uploadContratos(arquivos)
          : tipoUpload === "biddings"
            ? await uploadLicitacoes(arquivos)
            : await uploadVeiculos(arquivos);

      setMensagemUpload(mensagem);
      setArquivos([]);
    } catch (error) {
      setErroUpload(error instanceof Error ? error.message : "Falha ao enviar os arquivos.");
    } finally {
      setCarregandoUpload(false);
    }
  };

  const handleDragOver = (event: DragEvent) => {
    event.preventDefault();
    setArrastandoArquivo(true);
  };

  const handleDragLeave = (event: DragEvent) => {
    const elementoAtual = event.currentTarget as HTMLElement | null;
    const proximoAlvo = event.relatedTarget as Node | null;

    if (elementoAtual?.contains(proximoAlvo)) return;

    setArrastandoArquivo(false);
  };

  const handleDrop = (event: DragEvent) => {
    event.preventDefault();
    setArrastandoArquivo(false);
    lidarComSelecao(event.dataTransfer?.files ?? null);
  };

  const uploadCardContent = uploadContentByType[tipoUpload];
  const totalSelectedSize = arquivos.reduce((total, arquivo) => total + arquivo.size, 0);

  return (
    <div class="contracts-upload-shell">
      <div class="contracts-grid contracts-grid--single">
        <article class="contracts-card contracts-card--upload-compact">
          <div class="contracts-card__header">
            <div>
              <h2>Importar Arquivos Historicos</h2>
              <p class="contracts-upload__intro">Escolha o tipo do lote e envie os arquivos correspondentes.</p>
            </div>
          </div>

          <div class="contracts-form">
            <div class="contracts-upload__segmented" role="tablist" aria-label="Tipo de importacao">
              <button
                class={`contracts-upload__segment${tipoUpload === "contracts" ? " is-active" : ""}`}
                type="button"
                onClick={() => setTipoUpload("contracts")}
              >
                Contratos
              </button>

              <button
                class={`contracts-upload__segment${tipoUpload === "biddings" ? " is-active" : ""}`}
                type="button"
                onClick={() => setTipoUpload("biddings")}
              >
                Licitacoes
              </button>

              <button
                class={`contracts-upload__segment${tipoUpload === "vehicles" ? " is-active" : ""}`}
                type="button"
                onClick={() => setTipoUpload("vehicles")}
              >
                Veiculos
              </button>
            </div>

            <div class="contracts-field">
              <div
                class={`contracts-dropzone contracts-dropzone--refined${arrastandoArquivo ? " is-dragging" : ""}${arquivos.length > 0 ? " is-ready" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputArquivoRef.current?.click()}
              >
                <div class="contracts-dropzone__header">
                  <span class={`contracts-dropzone__file-code contracts-dropzone__file-code--${uploadCardContent.tone}`}>
                    {uploadCardContent.code}
                  </span>
                  <div class="contracts-dropzone__header-copy">
                    <strong>{uploadCardContent.title}</strong>
                    <span>{uploadCardContent.sectionLabel}</span>
                  </div>
                  <span class="contracts-dropzone__type-icon" aria-hidden="true">
                    <Icon name={uploadCardContent.icon} className="sidebar-svg-icon" />
                  </span>
                </div>

                <div class="contracts-dropzone__body">
                  <p class="contracts-dropzone__headline">{uploadCardContent.subtitle}</p>
                  <p class="contracts-dropzone__description">{uploadCardContent.description}</p>

                  <div class="contracts-dropzone__actions">
                    <button
                      class="contracts-button contracts-button--picker"
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        inputArquivoRef.current?.click();
                      }}
                    >
                      Escolher arquivos
                    </button>
                    <span class="contracts-dropzone__hint">Extensao esperada: {uploadCardContent.expectedExtension}</span>
                  </div>
                </div>
              </div>
            </div>

            <input
              ref={inputArquivoRef}
              id="arquivo-historico"
              class="contracts-file-input-hidden"
              type="file"
              multiple
              onChange={(event) => lidarComSelecao(event.currentTarget.files)}
            />
          </div>

          <div class={`contracts-upload__selection${arquivos.length > 0 ? " is-ready" : ""}`}>
            <div class="contracts-upload__selection-summary">
              <strong>{arquivos.length > 0 ? `${arquivos.length} arquivo(s) selecionado(s)` : uploadCardContent.emptyState}</strong>
              <span>
                {arquivos.length > 0
                  ? `Lote ${uploadCardContent.code} • ${formatFileSize(totalSelectedSize)} no total`
                  : `Lote ${uploadCardContent.code} pronto para importacao`}
              </span>
            </div>

            {arquivos.length > 0 ? (
              <div class="contracts-upload__file-chips" aria-label="Arquivos selecionados">
                {arquivos.slice(0, 6).map((arquivo) => (
                  <span key={`${arquivo.name}-${arquivo.size}`} class="contracts-upload__file-chip">
                    <strong>{arquivo.name}</strong>
                    <small>{formatFileSize(arquivo.size)}</small>
                  </span>
                ))}
                {arquivos.length > 6 ? (
                  <span class="contracts-upload__file-chip contracts-upload__file-chip--muted">
                    <strong>+{arquivos.length - 6} arquivo(s)</strong>
                    <small>na selecao</small>
                  </span>
                ) : null}
              </div>
            ) : null}

            <button
              class="contracts-button contracts-upload__submit"
              type="button"
              disabled={carregandoUpload || arquivos.length === 0}
              onClick={executarUpload}
            >
              {carregandoUpload
                ? "Processando..."
                : `Confirmar importacao de ${uploadCardContent.actionLabel}`}
            </button>
          </div>
        </article>
      </div>
    </div>
  );
};
