import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosStatic } from "axios";
import { DvelopContext } from "../context/context";
import { axiosFollowHalJsonFunctionFactory } from "./axios-follow-hal-json";

export interface DvelopHttpRequestConfig<T = any> extends AxiosRequestConfig<T> {
  follows?: string[];
  templates?: { [key: string]: any }
}

export interface HttpResponse<T = any> extends AxiosResponse<T> { }

export interface DvelopHttpError extends AxiosError { }

export interface DvelopHttpClient {
  request(context: DvelopContext, config: DvelopHttpRequestConfig): Promise<HttpResponse>
}

export function axiosInstanceFactory(axios: AxiosStatic): AxiosInstance {
  const instance: AxiosInstance = axios.create();
  instance.interceptors.request.use(axiosFollowHalJsonFunctionFactory(instance));
  return instance;
}

export function axiosHttpClientFactory(axiosInstance: AxiosInstance): DvelopHttpClient {

  return {
    request: async (context: DvelopContext, config: DvelopHttpRequestConfig) => {


      const defaultConfig: DvelopHttpRequestConfig = {
        headers: {
          "ContentType": "application/json",
          "Accept": "application/hal+json, application/json",
        }
      };

      if (context.systemBaseUri) {
        defaultConfig.baseURL = context.systemBaseUri;
      }

      if (context.authSessionId && defaultConfig.headers) {
        defaultConfig.headers["Authorization"] = `Bearer ${context.authSessionId}`;
      }

      return axiosInstance.request({ ...defaultConfig, ...config, ...{ headers: { ...defaultConfig.headers, ...config.headers } } });
    }
  };
}

/* istanbul ignore next */
export function defaultDvelopHttpClientFactory(): DvelopHttpClient {
  return axiosHttpClientFactory(axiosInstanceFactory(axios));
}