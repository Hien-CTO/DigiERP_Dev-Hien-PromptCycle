import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ServiceConfig } from '../types';

export class HttpClient {
  private static instances: Map<string, AxiosInstance> = new Map();

  static getInstance(serviceConfig: ServiceConfig): AxiosInstance {
    const key = serviceConfig.name;
    
    if (!this.instances.has(key)) {
      const instance = axios.create({
        baseURL: serviceConfig.url,
        timeout: serviceConfig.timeout || 5000,
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Add request interceptor for logging
      instance.interceptors.request.use(
        (config) => {
          console.log(`[${serviceConfig.name}] ${config.method?.toUpperCase()} ${config.url}`);
          return config;
        },
        (error) => {
          console.error(`[${serviceConfig.name}] Request error:`, error.message);
          return Promise.reject(error);
        }
      );

      // Add response interceptor for error handling
      instance.interceptors.response.use(
        (response) => {
          console.log(`[${serviceConfig.name}] ${response.status} ${response.config.url}`);
          return response;
        },
        (error) => {
          console.error(`[${serviceConfig.name}] Response error:`, error.response?.status, error.message);
          return Promise.reject(error);
        }
      );

      this.instances.set(key, instance);
    }

    return this.instances.get(key)!;
  }

  static async get<T = any>(
    serviceConfig: ServiceConfig,
    path: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const instance = this.getInstance(serviceConfig);
    const response: AxiosResponse<T> = await instance.get(path, config);
    return response.data;
  }

  static async post<T = any>(
    serviceConfig: ServiceConfig,
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const instance = this.getInstance(serviceConfig);
    const response: AxiosResponse<T> = await instance.post(path, data, config);
    return response.data;
  }

  static async put<T = any>(
    serviceConfig: ServiceConfig,
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const instance = this.getInstance(serviceConfig);
    const response: AxiosResponse<T> = await instance.put(path, data, config);
    return response.data;
  }

  static async delete<T = any>(
    serviceConfig: ServiceConfig,
    path: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const instance = this.getInstance(serviceConfig);
    const response: AxiosResponse<T> = await instance.delete(path, config);
    return response.data;
  }
}
