import { type FunctionalComponent } from "preact";
import { useRef, useState } from "preact/hooks";
import { uploadContratos } from "../services/contratosApi";

export const UploadHistoryPage: FunctionalComponent = () => {
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  const [arquivos, setArquivos] = useState<File[]>([]);
  const [mensagemUpload, setMensagemUpload] = useState("");
  const [erroUpload, setErroUpload] = useState("");
  const [carregandoUpload, setCarregandoUpload] = useState(false);
  const [arrastandoArquivo, setArrastandoArquivo] = useState(false);

  // Apenas seleciona os arquivos e guarda no estado
  const lidarComSelecao = (lista: FileList | null) => {
    if (!lista) return;
    setArquivos(Array.from(lista));
    setMensagemUpload("");
    setErroUpload("");
  };

  // Executa o upload de fato
  const executarUpload = async () => {
    if (arquivos.length === 0) return;

    setCarregandoUpload(true);
    setMensagemUpload("");
    setErroUpload("");

    try {
      const mensagem = await uploadContratos(arquivos);
      setMensagemUpload(mensagem);
      setArquivos([]); // Limpa a lista após sucesso
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

  return (
    <div class="contracts-upload-shell">
      <div class="contracts-grid contracts-grid--single">
        <article class="contracts-card contracts-card--upload-compact">
          <div class="contracts-card__header">
            <div>
              <h2>Importar Histórico de Contratos</h2>
              <p style={{ color: '#666', fontSize: '0.85rem' }}>Selecione um ou mais arquivos .LCO</p>
            </div>
          </div>

          <div class="contracts-form">
            <label class="contracts-field">
              <div
                class={`contracts-dropzone${arrastandoArquivo ? " is-dragging" : ""}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => inputArquivoRef.current?.click()}
                style={{ cursor: 'pointer' }}
              >
                <div class="contracts-dropzone__content">
                  <span style={{ fontSize: '2rem', marginBottom: '10px' }}>📁</span>
                  <strong>Arraste os arquivos para cá</strong>
                  <span>ou clique para abrir o seletor</span>
                </div>
              </div>
            </label>

            <input
              ref={inputArquivoRef}
              id="arquivo-contratos"
              class="contracts-file-input-hidden"
              type="file"
              multiple
              onChange={(e) => lidarComSelecao(e.currentTarget.files)}
            />
          </div>

          {/* Lista de Arquivos Selecionados */}
          {arquivos.length > 0 && (
            <div class="contracts-file-list-container" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: 'bold', marginBottom: '10px' }}>
                Arquivos para importar ({arquivos.length}):
              </p>
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {arquivos.map((arq) => (
                  <li key={arq.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '5px', padding: '5px', background: '#f9f9f9', borderRadius: '4px' }}>
                    <span>{arq.name}</span>
                    <span style={{ color: '#888' }}>{(arq.size / 1024).toFixed(1)} KB</span>
                  </li>
                ))}
              </ul>

              {/* Botão de Ação Principal: Posicionado no final da lista */}
              <button
                class="contracts-button contracts-button--primary"
                type="button"
                disabled={carregandoUpload}
                onClick={executarUpload}
                style={{ width: '100%', marginTop: '15px', padding: '12px', fontWeight: 'bold' }}
              >
                {carregandoUpload ? "Processando..." : `Confirmar Importação de ${arquivos.length} arquivo(s)`}
              </button>
            </div>
          )}

          {/* Feedbacks */}
          {mensagemUpload && (
            <p class="contracts-feedback contracts-feedback--success" style={{ marginTop: '15px' }}>
              ✅ {mensagemUpload}
            </p>
          )}

          {erroUpload && (
            <p class="contracts-feedback contracts-feedback--error" style={{ marginTop: '15px' }}>
              ❌ {erroUpload}
            </p>
          )}
        </article>
      </div>
    </div>
  );
};