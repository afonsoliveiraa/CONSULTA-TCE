// Representa o formato retornado pela API para consulta de contratos.
export interface Contrato {
  id: number; // Adicione esta linha
  tipoDocumento: string;
  codMunicipio: string;
  cpfGestor: string;
  numeroContrato: string;
  dataAssinatura: string | null;
  tipoObjeto: string;
  modalidade: string;
  cpfGestorOriginal: string;
  numeroContratoOrig: string;
  dataContratoOrig: string | null;
  vigenciaInicial: string | null;
  vigenciaFinal: string | null;
  dataInicioObra: string | null;
  tipoObraServico: string;
  numeroObra: string;
  dataTerminoObra: string | null;
  referencia: string | null;
  dataAutuacao: string | null;
  numeroProcesso: string;
  objeto: string;
  valor: number;
  cpfFiscal: string;
  nomeFiscal: string;
  idContratoPncp: string;
}
