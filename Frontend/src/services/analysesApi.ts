import api from "./api";

/**
 * Envia o arquivo .DCD e as linhas com erro para o backend Rails.
 * Rota: POST /analyses/analyses_ne
 */
// services/analysesApi.ts

export const analisarArquivoNE = async (arquivo: File, errorLines: number[]) => {
  const formData = new FormData();
  
  formData.append("file", arquivo);

  // EM VEZ DE: formData.append("error_lines", errorLines)
  // FAÇA ISSO:
  errorLines.forEach((linha) => {
    formData.append("error_lines[]", linha.toString());
  });

  // O Axios lidará com o resto
  return api.post("/analyses/analyses_ne", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};