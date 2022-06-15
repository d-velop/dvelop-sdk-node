import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosStatic } from "axios";
import { generateRequestId } from "..";
import { DvelopContext } from "../context/context";
import { axiosFollowHalJsonFunctionFactory } from "./axios-follow-hal-json";
import { DVELOP_REQUEST_ID_HEADER } from "./http-headers";
import { deepMergeObjects } from "../util/deep-merge-objects";

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

export function axiosHttpClientFactory(axiosInstance: AxiosInstance, generateRequestId: () => string): DvelopHttpClient {

  return {
    request: async (context: DvelopContext, config: DvelopHttpRequestConfig) => {


      const defaultConfig: DvelopHttpRequestConfig = {};

      defaultConfig.headers = {
        "ContentType": "application/json",
        "Accept": "application/hal+json, application/json",
      };

      if (context.systemBaseUri) {
        defaultConfig.baseURL = context.systemBaseUri;
      }

      if (context.authSessionId) {
        defaultConfig.headers["Authorization"] = `Bearer ${context.authSessionId}`;
      }

      if (context.requestId) {
        defaultConfig.headers[DVELOP_REQUEST_ID_HEADER] = context.requestId;
      } else {
        defaultConfig.headers[DVELOP_REQUEST_ID_HEADER] = generateRequestId();
      }

      return axiosInstance.request(deepMergeObjects(defaultConfig, config));
    }
  };
}

/* istanbul ignore next */
export function defaultDvelopHttpClientFactory(): DvelopHttpClient {
  return axiosHttpClientFactory(axiosInstanceFactory(axios), generateRequestId);
}