// src/services/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const api: AxiosInstance = axios.create({
  // Ajuste para o seu endereço do Rails
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000",
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 1. Pega a chave do .env com tipagem
    const secret = import.meta.env.VITE_APP_SECRET as string;
    
    if (secret) {
      // 2. Alinhado com o 'X-API-KEY' do seu Rails
      config.headers["X-API-KEY"] = secret;
    }

    config.headers["Accept"] = "application/json";
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;