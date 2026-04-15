import api from "./api"; 
import axios from "axios";
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

export type UploadResource = "contracts" | "biddings" | "vehicles";

function appendFilesToFormData(arquivos: File | File[]): FormData {
  const formData = new FormData();
  const listaArquivos = Array.isArray(arquivos) ? arquivos : [arquivos];

  listaArquivos.forEach((arquivo) => {
    formData.append("files[]", arquivo);
  });

  return formData;
}

function extractApiErrorMessage(error: unknown, fallbackMessage: string) {
  if (axios.isAxiosError(error)) {
    const responseMessage = error.response?.data?.message;
    if (typeof responseMessage === "string" && responseMessage.trim()) {
      return responseMessage;
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return fallbackMessage;
}

/**
 * Envia um ou mais arquivos para o Rails.
 */
export async function uploadContratos(arquivos: File | File[]): Promise<string> {
  const formData = appendFilesToFormData(arquivos);

  try {
    const response = await api.post("/contracts", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.message ?? "Arquivos processados com sucesso!";
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, "Falha ao enviar os arquivos de contratos."));
  }
}

export async function uploadLicitacoes(arquivos: File | File[]): Promise<string> {
  const formData = appendFilesToFormData(arquivos);

  try {
    const response = await api.post("/biddings", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.message ?? "Arquivos processados com sucesso!";
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, "Falha ao enviar os arquivos de licitacoes."));
  }
}

export async function uploadVeiculos(arquivos: File | File[]): Promise<string> {
  const formData = appendFilesToFormData(arquivos);

  try {
    const response = await api.post("/vehicles", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data?.message ?? "Arquivos processados com sucesso!";
  } catch (error) {
    throw new Error(extractApiErrorMessage(error, "Falha ao enviar os arquivos de veiculos."));
  }
}

/**
 * Busca contratos (Padrão Sênior Pagy v43)
 */
export async function buscarContratos(
  numeroContrato?: string,
  codMunicipio?: string,
  page = 1
): Promise<ContratoPagedResult> {
  const url = numeroContrato?.trim() 
    ? `/contracts/numero/${encodeURIComponent(numeroContrato.trim())}` 
    : "/contracts";

  const response = await api.get(url, {
    params: {
      cod_municipio: codMunicipio?.trim() || undefined,
      "page[page]": page 
    },
  });

  return response.data;
}

/**
 * Busca a lista de códigos de municípios que possuem contratos importados.
 */
export async function getMunicipiosImportados(): Promise<string[]> {
  try {
    const response = await api.get("/contracts/municipios-importados");
    // Como o Rails retorna { municipios: [...] }, acessamos .municipios
    return response.data?.municipios ?? [];
  } catch (error) {
    throw new Error(
      extractApiErrorMessage(error, "Falha ao carregar a lista de municípios.")
    );
  }
}
