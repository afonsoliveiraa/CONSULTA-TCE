// src/services/api.ts
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";

const api: AxiosInstance = axios.create({
  baseURL: (import.meta.env.VITE_API_BASE_URL as string) || "http://localhost:3000",
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const secret = import.meta.env.VITE_APP_SECRET as string;

    if (secret) {
      config.headers["X-API-KEY"] = secret;
    }

    config.headers["Accept"] = "application/json";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
