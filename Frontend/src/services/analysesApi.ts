import api from "./api";

export const analisarArquivoNE = async (arquivo: File, errorLines: number[], page?: number) => {
  const formData = new FormData();

  formData.append("file", arquivo);

  errorLines.forEach((linha) => {
    formData.append("error_lines[]", linha.toString());
  });

  if (page && page > 1) {
    formData.append("page", page.toString());
  }

  return api.post("/analyses/analyses_ne", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
