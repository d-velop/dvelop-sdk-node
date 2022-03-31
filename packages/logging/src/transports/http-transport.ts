import { deepMergeObjects, defaultDvelopHttpClientFactory, DvelopContext, DvelopHttpClient, DvelopHttpRequestConfig } from "@dvelop-sdk/core";

export function httpTransportFactory<E = any>(httpConfig: DvelopHttpRequestConfig<E>): (context: DvelopContext, event: E) => Promise<void>;
export function httpTransportFactory<E = any>(httpConfig: DvelopHttpRequestConfig<E>, http: DvelopHttpClient): (context: DvelopContext, event: E) => Promise<void>;
export function httpTransportFactory<E = any>(httpConfig: DvelopHttpRequestConfig<E>, http: DvelopHttpClient = defaultDvelopHttpClientFactory()): (context: DvelopContext, event: E) => Promise<void> {
  return async (context: DvelopContext, event: E) => {
    await http.request(context, deepMergeObjects<DvelopHttpRequestConfig<E>>(httpConfig, { data: event }));
  };
}