import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { followHalJson } from "@dvelop-sdk/axios-hal-json";
import { Context } from "./context";

export { AxiosInstance, AxiosResponse, AxiosError } from "axios";
export const isAxiosError = axios.isAxiosError;

export interface HttpConfig extends AxiosRequestConfig { }
export interface HttpResponse<T = any> extends AxiosResponse<T> { }
export interface HttpError extends AxiosError { }
export type HttpRequestFunction = (context: Context, config: HttpConfig) => Promise<HttpResponse>;

export interface DmsErrorDto {
  reason: string
}

/**
*
* @category Error
*/
/* istanbul ignore next */
export class DmsError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, DmsError.prototype);
  }
}

/**
*
* @category Error
*/
/* istanbul ignore next */
export class BadInputError extends DmsError {
  // eslint-disable-next-line no-unused-vars
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, BadInputError.prototype);
  }
}

/**
*
* @category Error
*/
/* istanbul ignore next */
export class UnauthorizedError extends DmsError {
  // eslint-disable-next-line no-unused-vars
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}

/**
*
* @category Error
*/
/* istanbul ignore next */
export class ForbiddenError extends DmsError {
  // eslint-disable-next-line no-unused-vars
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

/**
*
* @category Error
*/
/* istanbul ignore next */
export class NotFoundError extends DmsError {
  // eslint-disable-next-line no-unused-vars
  constructor(public message: string, public originalError?: Error) {
    super(message);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

export function axiosErrorInterceptor(error: Error) {

  if (axios.isAxiosError(error) && error.response) {

    <AxiosError<DmsErrorDto>>error;
    switch (error.response.status) {
    case 400:
      throw new BadInputError(error.response.data?.reason || "DMS-App responded with Status 400 indicating bad Request-Parameters. See 'originalError'-property for details.", error);

    case 401:
      throw new UnauthorizedError(error.response.data?.reason || "DMS-App responded with Status 401 indicating bad authSessionId.", error);

    case 403:
      throw new ForbiddenError(error.response.data?.reason || "DMS-App responded with Status 403 indicating a forbidden action. See 'originalError'-property for details.", error);

    case 404:
      throw new NotFoundError(error.response.data?.reason || "DMS-App responded with Status 404 indicating a requested resource does not exist. See 'originalError'-property for details.", error);

    default:
      throw new DmsError(error.response.data?.reason || `DMS-App responded with status ${error.response.status}. See 'originalError'-property for details.`, error);
    }
  } else {
    throw new DmsError(`Request to DMS-App failed: ${error.message}. See 'originalError'-property for details.`, error);
  }
}

export function defaultAxiosInstanceFactory(): AxiosInstance {
  const axiosInstance: AxiosInstance = axios.create();
  axiosInstance.interceptors.request.use(followHalJson);
  axiosInstance.interceptors.response.use(undefined, axiosErrorInterceptor);
  return axiosInstance;
}

export function httpRequestFunctionFactory(httpClient: { request: (config: HttpConfig) => Promise<HttpResponse> }): (context: Context, config: HttpConfig) => Promise<HttpResponse> {
  return (context: Context, config: HttpConfig) => {


    const defaultConfig: HttpConfig = {
      headers: {
        "ContentType": "application/json",
        "Accept": "application/hal+json, application/json",
      }
    };

    if (context.systemBaseUri) {
      defaultConfig.baseURL = context.systemBaseUri;
    }

    if (context.authSessionId) {
      defaultConfig.headers["Authorization"] = `Bearer ${context.authSessionId}`;
    }

    return httpClient.request({ ...defaultConfig, ...config, ...{ headers: { ...defaultConfig.headers, ...config.headers } } });
  };
}

/* istanbul ignore next */
export async function defaultHttpRequestFunction(context: Context, config: HttpConfig): Promise<HttpResponse> {
  return httpRequestFunctionFactory(defaultAxiosInstanceFactory())(context, config);
}
