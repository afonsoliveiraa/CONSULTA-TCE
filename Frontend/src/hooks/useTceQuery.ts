import { useEffect, useMemo, useState } from "preact/hooks";
import { fetchTceMunicipalities, queryTce, fetchTceEndpointDefinitions } from "../services/tceApi";
import type { TceMunicipalityOption, TceEndpointField } from "../types/tce";

export function useTceQuery() {
  const [municipalities, setMunicipalities] = useState<TceMunicipalityOption[]>([]);
  const [selectedMunicipalityCode, setSelectedMunicipalityCode] = useState("");
  
  // Categorias (Tags do OpenAPI)
  const [selectedCategory, setSelectedCategory] = useState("Documentação de Informações Básicas - SIM");
  // Endpoint específico (Path do OpenAPI)
  const [selectedPath, setSelectedPath] = useState("/unidades_gestoras");

  const [endpointSummary, setEndpointSummary] = useState("");
  const [dynamicParameters, setDynamicParameters] = useState<TceEndpointField[]>([]);
  const [formValues, setFormValues] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loadingQuery, setLoadingQuery] = useState(false);

  // Mapeamento baseado no seu JSON
  const allEndpoints = [
    { path: "/municipios", label: "Municípios", category: "Documentação de Informações Básicas - SIM" },
    { path: "/unidades_gestoras", label: "Unidades Gestoras", category: "Documentação de Informações Básicas - SIM" },
    { path: "/funcoes", label: "Funções", category: "Documentação de Informações Básicas - SIM" },
    { path: "/gestores_unidades_gestoras", label: "Gestores de U.G.", category: "Documentação de Informações Básicas - SIM" },
    { path: "/contratos", label: "Contratos", category: "Licitações e Contratos" },
  ];

  const categories = [...new Set(allEndpoints.map(e => e.category))];
  const filteredEndpoints = allEndpoints.filter(e => e.category === selectedCategory);

  useEffect(() => {
    fetchTceMunicipalities().then(setMunicipalities);
  }, []);

  // Quando o PATH muda, busca novos parâmetros
  useEffect(() => {
    if (!selectedPath) return;
    fetchTceEndpointDefinitions(selectedPath).then(data => {
      setEndpointSummary(data.summary || "");
      // Remove codigo_municipio da lista dinâmica pois temos o select fixo
      const fields = (data.parameters || []).filter((p: any) => p.name !== "codigo_municipio");
      setDynamicParameters(fields);
      setFormValues({});
    });
  }, [selectedPath]);

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setLoadingQuery(true);
    try {
      const res = await queryTce(selectedPath, { 
        ...formValues, 
        codigo_municipio: selectedMunicipalityCode 
      });
      setResult(res);
    } finally {
      setLoadingQuery(false);
    }
  };

  return {
    municipalities, categories, filteredEndpoints,
    selectedCategory, setSelectedCategory,
    selectedPath, setSelectedPath,
    selectedMunicipalityCode, setSelectedMunicipalityCode,
    endpointSummary, dynamicParameters, formValues,
    loadingQuery, result,
    setFieldValue: (name: string, value: string) => setFormValues(prev => ({ ...prev, [name]: value })),
    handleSubmit
  };
}