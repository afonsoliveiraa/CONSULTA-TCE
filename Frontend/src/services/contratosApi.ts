import api from "./api"; 
import type { Contrato } from "../types/contrato";

export interface ContratoPagedResult {
  data: Contrato[];
  pagination: {
    count: number;
    page: number;
    last: number;
    next: number | null;
    prev: number | null;
    from: number;
    to: number;
  };
}

/**
 * Envia um ou mais arquivos para o Rails.
 */
export async function uploadContratos(arquivos: File | File[]): Promise<string> {
  const formData = new FormData();
  
  // Garantimos que trabalhamos com um array
  const listaArquivos = Array.isArray(arquivos) ? arquivos : [arquivos];

  listaArquivos.forEach((arquivo) => {
    // IMPORTANTE: O sufixo [] na chave "files[]" garante que o Rails 
    // receba um array no backend, casando com o params.permit(files: [])
    formData.append("files[]", arquivo); 
  });

  const response = await api.post("/contracts", formData, {
    headers: {
      // O Axios define o Content-Type correto com o boundary automaticamente 
      // ao detectar o FormData, mas mantemos a flexibilidade aqui.
      "Content-Type": "multipart/form-data",
    },
  });

  return response.data?.message ?? "Arquivos processados com sucesso!";
}

/**
 * Busca contratos (Padrão Sênior Pagy v43)
 */
export async function buscarContratos(
  numeroContrato?: string,
  page = 1
): Promise<ContratoPagedResult> {
  const url = numeroContrato?.trim() 
    ? `/contracts/numero/${encodeURIComponent(numeroContrato.trim())}` 
    : "/contracts";

  const response = await api.get(url, {
    params: {
      "page[page]": page 
    },
  });

  return response.data;
}