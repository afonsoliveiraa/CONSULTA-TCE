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
  if (!value) return "-";
  const normalized = value.includes("T") ? value.split("T")[0] : value;
  const parts = normalized.split("-");
  return parts.length === 3 ? `${parts[2]}/${parts[1]}/${parts[0]}` : value;
};

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

  const parseLinhas = (texto: string) => {
    const numeros = new Set<number>();
    texto.split(/[,; ]+/).forEach((parte) => {
      if (parte.includes("-")) {
        const [inicio, fim] = parte.split("-").map(Number);
        if (!Number.isNaN(inicio) && !Number.isNaN(fim)) {
          for (let v = Math.min(inicio, fim); v <= Math.max(inicio, fim); v++) {
            if (v > 0) numeros.add(v);
          }
        }
        return;
      }
      const n = Number(parte);
      if (!Number.isNaN(n) && n > 0) numeros.add(n);
    });
    return Array.from(numeros).sort((a, b) => a - b);
  };

  const linhasNormalizadas = useMemo(() => parseLinhas(linhasInput), [linhasInput]);

  const executarAnalise = async (page = 1) => {
    if (!arquivo || linhasNormalizadas.length === 0) return;
    setCarregando(true);
    setErro("");
    try {
      const response = await analisarArquivoNE(arquivo, linhasNormalizadas, page);
      setResultados(response.data?.data || []);
      setMeta(response.data?.pagination || null);
      setStep(3);
    } catch (e) {
      setErro("Falha ao processar a análise do arquivo.");
    } finally {
      setCarregando(false);
    }
  };

  const compararValores = (v1: unknown, v2: unknown, tipo: "cpf" | "data" | "texto") => {
    const s1 = v1?.toString().trim() || "";
    const s2 = v2?.toString().trim() || "";
    if (tipo === "cpf") return s1.replace(/\D/g, "") === s2.replace(/\D/g, "");
    if (tipo === "data") return s1.split("T")[0] === s2.split("T")[0];
    return s1 === s2;
  };

  const renderComparisonField = (label: string, vArq: unknown, vHist: unknown, tipo: "cpf" | "data" | "texto" = "texto") => {
    const divergente = !compararValores(vArq, vHist, tipo);
    const fArq = tipo === "data" ? formatDate(vArq as string) : (vArq as string) || "-";
    const fHist = tipo === "data" ? formatDate(vHist as string) : (vHist as string) || "-";

    return (
      <div style={{
        borderRadius: '6px',
        padding: '10px 12px',
        backgroundColor: divergente ? '#fff5f5' : '#f8fafc',
        border: `1px solid ${divergente ? '#feb2b2' : '#e2e8f0'}`,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <span style={{ fontSize: '10px', fontWeight: '700', textTransform: 'uppercase', color: '#64748b' }}>{label}</span>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <div style={{ fontSize: '9px', color: '#94a3b8' }}>Arquivo</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: divergente ? '#dc2626' : '#1e293b' }}>{fArq}</div>
          </div>
          <div style={{ borderLeft: '1px solid #cbd5e1', paddingLeft: '8px' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8' }}>Histórico</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b' }}>{fHist}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div class="contracts-upload-shell analysis-page">
      <div class="contracts-topbar analysis-header-row">
        <div class="contracts-breadcrumbs">
          <span>Processos</span><span>/</span><strong>Análise de divergências</strong>
        </div>
        <div class="contracts-steps analysis-steps">
          {stepItems.map(item => (
            <button key={item.id} type="button" class={`contracts-step ${step >= item.id ? 'is-completed' : 'is-pending'}`}>
              <span>{item.id}</span><strong>{item.label}</strong>
            </button>
          ))}
        </div>
      </div>

      <div class="contracts-grid contracts-grid--single">
        {step === 1 && (
          <article class="contracts-card" style={{ borderRadius: '6px' }}>
            <div class="contracts-card__header">
              <h2>Defina as linhas com erro</h2>
              <p class="contracts-card__subtitle">Informe linhas isoladas ou intervalos. Ex.: 113, 150, 201-205.</p>
            </div>
            <div class="contracts-form analysis-form">
              <textarea class="analysis-textarea" value={linhasInput} onInput={(e) => setLinhasInput(e.currentTarget.value)} style={{ borderRadius: '6px', minHeight: '120px' }} />
              {/* Botão alinhado à direita e com tamanho automático */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  class="contracts-button contracts-button--primary" 
                  style={{ borderRadius: '6px', padding: '0 2rem' }} 
                  disabled={linhasNormalizadas.length === 0} 
                  onClick={() => setStep(2)}
                >
                  Avançar para upload
                </button>
              </div>
            </div>
          </article>
        )}

        {step === 2 && (
          <article class="contracts-card" style={{ borderRadius: '6px' }}>
            <div class="contracts-card__header"><h2>Anexe o arquivo para validação</h2></div>
            <div class="contracts-form analysis-form">
              <div class="contracts-dropzone" onClick={() => inputArquivoRef.current?.click()} style={{ borderRadius: '6px', padding: '3rem', textAlign: 'center', border: '2px dashed #cbd5e1', cursor: 'pointer' }}>
                <strong>{arquivo ? arquivo.name : "Clique para selecionar o arquivo .DCD"}</strong>
              </div>
              <input ref={inputArquivoRef} type="file" accept=".DCD,.dcd" class="contracts-file-input-hidden" onChange={(e) => setArquivo(e.currentTarget.files?.[0] || null)} />
              <div class="analysis-actions" style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" class="contracts-button" style={{ borderRadius: '6px' }} onClick={() => setStep(1)}>Voltar</button>
                <button type="button" class="contracts-button contracts-button--primary" style={{ borderRadius: '6px' }} disabled={carregando || !arquivo} onClick={() => executarAnalise(1)}>
                  {carregando ? "Analisando..." : "Executar análise"}
                </button>
              </div>
            </div>
          </article>
        )}

        {step === 3 && (
          <>
            <article class="contracts-card" style={{ borderRadius: '6px', padding: '1.25rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 'bold' }}>Resultado da análise</h2>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#64748b' }}>Divergências por linha do arquivo.</p>
                </div>
                <button class="grid-demo__text-button" style={{ backgroundColor: '#f1f5f9', borderRadius: '6px', padding: '8px 16px' }}>
                   <DownloadIcon /> Exportar CSV
                </button>
              </div>
            </article>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {resultados.map(res => {
                const hist = res.contracts?.[0] || {};
                const semContrato = !res.contracts?.length;
                return (
                  <article key={res.line_number} class="contracts-card" style={{ borderRadius: '6px', padding: '16px', border: '1px solid #e2e8f0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h3 style={{ margin: 0, fontSize: '14px', fontWeight: '800', color: '#1e293b' }}>Linha {res.line_number}</h3>
                      <span style={{ 
                        borderRadius: '6px', padding: '4px 12px', fontSize: '11px', fontWeight: '700',
                        backgroundColor: semContrato ? '#fee2e2' : '#dcfce7',
                        color: semContrato ? '#991b1b' : '#166534',
                        border: `1px solid ${semContrato ? '#fecaca' : '#bbf7d0'}`
                      }}>
                        {semContrato ? "Contrato não encontrado no histórico" : "Contrato localizado"}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '8px' }}>
                      {renderComparisonField("Contrato", res.data?.numero_contrato, hist.numero_contrato)}
                      {renderComparisonField("CPF Gestor", res.data?.cpf_gestor_contrato, hist.cpf_gestor, "cpf")}
                      {renderComparisonField("Assinatura", res.data?.data_assinatura_contrato, hist.data_assinatura, "data")}
                    </div>
                  </article>
                );
              })}
            </div>

            {meta && (
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center', 
                marginTop: '1.5rem', 
                padding: '1rem 0',
                fontSize: '14px',
                color: '#1e293b'
              }}>
                <div>
                  Página <strong>{meta.page}</strong> de <strong>{meta.last}</strong> • {meta.count} registros
                </div>
                <div style={{ display: 'flex', gap: '24px' }}>
                  <button 
                    disabled={meta.page === 1 || carregando} 
                    onClick={() => executarAnalise(meta.page - 1)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      fontWeight: '700', 
                      cursor: (meta.page === 1 || carregando) ? 'default' : 'pointer',
                      color: (meta.page === 1 || carregando) ? '#cbd5e1' : '#1e293b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Anterior
                  </button>
                  <button 
                    disabled={meta.page === meta.last || carregando} 
                    onClick={() => executarAnalise(meta.page + 1)}
                    style={{ 
                      background: 'none', 
                      border: 'none', 
                      fontWeight: '700', 
                      cursor: (meta.page === meta.last || carregando) ? 'default' : 'pointer',
                      color: (meta.page === meta.last || carregando) ? '#cbd5e1' : '#1e293b',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}
                  >
                    Próxima
                  </button>
                </div>
              </div>
            )}
          </>
        )}
        {erro && <p class="contracts-feedback contracts-feedback--error" style={{ marginTop: '1rem' }}>{erro}</p>}
      </div>
    </div>
  );
};