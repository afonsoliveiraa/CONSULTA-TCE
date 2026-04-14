import { type FunctionalComponent } from "preact";
import { useRef, useState } from "preact/hooks";
import { analisarArquivoNE } from "../services/analysesApi";

export const AnalysisNEPage: FunctionalComponent = () => {
  const inputArquivoRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [linhasInput, setLinhasInput] = useState(""); 
  const [resultados, setResultados] = useState<any[]>([]);
  const [meta, setMeta] = useState<any>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [arrastandoArquivo, setArrastandoArquivo] = useState(false);

  const parseLinhas = (texto: string) => {
    const numeros = new Set<number>();
    texto.split(/[,; ]+/).forEach(p => {
      if (p.includes("-")) {
        const [i, f] = p.split("-").map(Number);
        if (!isNaN(i) && !isNaN(f)) for (let n = Math.min(i, f); n <= Math.max(i, f); n++) numeros.add(n);
      } else {
        const n = Number(p);
        if (!isNaN(n) && n > 0) numeros.add(n);
      }
    });
    return Array.from(numeros).sort((a, b) => a - b);
  };

  const executarAnalise = async (page = 1) => {
    if (!arquivo) return;
    setCarregando(true);
    setErro("");
    try {
      const response = await analisarArquivoNE(arquivo, parseLinhas(linhasInput), page);
      setResultados(response.data?.data || []);
      setMeta(response.data?.pagination || null);
      setStep(3);
    } catch (e) {
      setErro("Falha ao processar análise.");
    } finally {
      setCarregando(false);
    }
  };

  const compararValores = (v1: any, v2: any, tipo: 'cpf' | 'data' | 'texto') => {
    const s1 = v1?.toString().trim() || '';
    const s2 = v2?.toString().trim() || '';
    if (tipo === 'cpf') return s1.replace(/\D/g, '') === s2.replace(/\D/g, '');
    if (tipo === 'data') return s1.split('T')[0] === s2.split('T')[0];
    return s1 === s2;
  };

  const renderCell = (label: string, valArq: any, valSys: any, tipo: 'cpf' | 'data' | 'texto' = 'texto') => {
    const divergente = !compararValores(valArq, valSys, tipo);
    return (
      <td style={{ 
        padding: '10px 12px', borderBottom: '1px solid #eee',
        backgroundColor: divergente ? '#fff5f5' : 'transparent',
        borderLeft: divergente ? '3px solid #e53e3e' : 'none'
      }}>
        <div style={{ fontSize: '0.65rem', color: '#999' }}>{label}</div>
        <div style={{ fontSize: '0.8rem' }}>A: <strong>{valArq || '-'}</strong></div>
        <div style={{ fontSize: '0.8rem', color: divergente ? '#e53e3e' : 'inherit' }}>
          S: <strong>{valSys || '-'}</strong>
        </div>
      </td>
    );
  };

  return (
    <div class="contracts-upload-shell">
      <div class="contracts-grid contracts-grid--single">
        <article class="contracts-card contracts-card--upload-compact">
          <div class="contracts-card__header">
            <div>
              <h2>Análise de Divergências</h2>
              <p style={{ color: '#666', fontSize: '0.85rem' }}>
                {step === 3 ? `Resultados: ${meta?.count || 0}` : "Validação de arquivo .DCD"}
              </p>
            </div>
          </div>

          <div class="contracts-form" style={{ marginTop: '20px' }}>
            {step === 1 && (
              <div class="contracts-field">
                <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '8px', fontSize: '0.9rem' }}>Linhas com erro:</label>
                <input 
                  type="text" 
                  class="contracts-input" 
                  placeholder="Ex: 113, 150" 
                  value={linhasInput} 
                  onInput={(e) => setLinhasInput(e.currentTarget.value)} 
                  style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', outline: 'none' }} 
                />
                <button class="contracts-button contracts-button--primary" disabled={!linhasInput} onClick={() => setStep(2)} style={{ width: '100%', marginTop: '20px' }}>Próximo</button>
              </div>
            )}

            {step === 2 && (
              <div>
                <div 
                   class={`contracts-dropzone ${arquivo ? "is-active" : ""}`} 
                   onClick={() => inputArquivoRef.current?.click()}
                   onDrop={(e) => { e.preventDefault(); setArquivo(e.dataTransfer?.files[0] ?? null); }}
                >
                  <div class="contracts-dropzone__content">
                    <span style={{ fontSize: '2rem' }}>{arquivo ? "📄" : "📁"}</span>
                    <strong>{arquivo ? arquivo.name : "Selecionar arquivo .DCD"}</strong>
                  </div>
                </div>
                <input ref={inputArquivoRef} type="file" accept=".DCD,.dcd" hidden onChange={(e) => setArquivo(e.currentTarget.files?.[0] ?? null)} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                  <button class="contracts-button" onClick={() => setStep(1)} style={{ flex: 1 }}>Voltar</button>
                  <button class="contracts-button contracts-button--primary" disabled={carregando || !arquivo} onClick={() => executarAnalise(1)} style={{ flex: 2 }}>{carregando ? "Analisando..." : "Analisar"}</button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <div class="contracts-table-container" style={{ border: '1px solid #eee', borderRadius: '8px', overflowX: 'auto', maxHeight: '400px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8f9fa', zIndex: 1 }}>
                      <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
                        <th style={{ padding: '10px', fontSize: '0.7rem' }}>LINHA</th>
                        <th style={{ padding: '10px', fontSize: '0.7rem' }}>CONTRATO</th>
                        <th style={{ padding: '10px', fontSize: '0.7rem' }}>CPF GESTOR</th>
                        <th style={{ padding: '10px', fontSize: '0.7rem' }}>ASSINATURA</th>
                      </tr>
                    </thead>
                    <tbody>
                      {resultados.map(res => {
                        const banco = res.contracts?.[0] || {};
                        return (
                          <tr key={res.line_number}>
                            <td style={{ padding: '10px', fontWeight: 'bold', borderBottom: '1px solid #eee', fontSize: '0.8rem', textAlign: 'center' }}>
                              {res.line_number}
                            </td>
                            {renderCell("Nº", res.data?.numero_contrato, banco.numero_contrato)}
                            {renderCell("CPF", res.data?.valor_empenhado, banco.cpf_gestor, 'cpf')}
                            {renderCell("Data", res.data?.data_assinatura_contrato, banco.data_assinatura, 'data')}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {meta && meta.last > 1 && (
                  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
                    <button class="contracts-button" disabled={carregando || meta.page === 1} onClick={() => executarAnalise(meta.page - 1)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>❮</button>
                    <span style={{ fontSize: '0.75rem' }}>{meta.page} / {meta.last}</span>
                    <button class="contracts-button" disabled={carregando || meta.page === meta.last} onClick={() => executarAnalise(meta.page + 1)} style={{ padding: '4px 8px', fontSize: '0.7rem' }}>❯</button>
                  </div>
                )}

                <button onClick={() => { setStep(1); setArquivo(null); }} style={{ width: '100%', background: 'none', border: 'none', color: '#004a80', textDecoration: 'underline', marginTop: '15px', cursor: 'pointer', fontSize: '0.85rem' }}>
                  Nova Análise
                </button>
              </div>
            )}
          </div>
          {erro && <p class="contracts-feedback contracts-feedback--error" style={{ marginTop: '15px' }}>{erro}</p>}
        </article>
      </div>
    </div>
  );
};