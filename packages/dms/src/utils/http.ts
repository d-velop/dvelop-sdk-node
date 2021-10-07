import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { Context } from "./context";
import { followHalJson } from "../../../axios-hal-json/lib";
import { BadInputError, DmsError, ForbiddenError, NotFoundError, UnauthorizedError } from "./errors";

export { AxiosInstance, AxiosResponse, AxiosError } from "axios";
export const isAxiosError = axios.isAxiosError;

export interface HttpConfig extends AxiosRequestConfig { }
export interface HttpResponse extends AxiosResponse { }
export type HttpRequestFunction = (context: Context, config: HttpConfig)=> Promise<HttpResponse>;

let _axiosFactory: ()=> AxiosInstance;

export function getAxiosInstance(): AxiosInstance {
  if (!_axiosFactory) {
    _axiosFactory = defaultAxiosFactory;
  }
  return _axiosFactory();
}

export function setAxiosFactory(axiosFactory: ()=> AxiosInstance): void {
  _axiosFactory = axiosFactory;
}

export function defaultAxiosFactory(): AxiosInstance {
  const axiosInstance: AxiosInstance = axios.create();
  axiosInstance.interceptors.request.use(followHalJson);
  return axiosInstance;
}

function axiosErrorInterceptor(err: Error) {
  if (isAxiosError(err)) {
    if (err.response?.status) {
      switch (err.response.status) {
      case 400:
        throw new BadInputError("", err);

      case 401:
        throw new UnauthorizedError("", err);
      default:
        break;
      }
    }
    throw new Error("ErrorMerror");
  } else {
    throw err;
  }
}

export function defaultAxiosInstanceFactory(config?: AxiosRequestConfig): AxiosInstance {
  const axiosInstance: AxiosInstance = axios.create(config);
  axiosInstance.interceptors.request.use(followHalJson);
  axiosInstance.interceptors.response.use(undefined, axiosErrorInterceptor);
  return axiosInstance;
}

export async function defaultHttpRequestFunction(context: Context, config: HttpConfig): Promise<HttpResponse> {

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

  return await defaultAxiosInstanceFactory().request({ ...defaultConfig, ...config, ...{ headers: { ...defaultConfig.headers, ...config.headers } } });
}

export function mapRequestError(expectedStatusCodes: number[], context: string, error: Error): Error {

  if (isAxiosError(error) && error.response?.status) {

    const status: number = error.response.status;

    if (status === 401) {
      return new UnauthorizedError(context, error);
    } else if (expectedStatusCodes.includes(status)) {

      switch (status) {
      case 400:
        return new BadInputError(context, error);

      case 403:
        return new ForbiddenError(context, error);

      case 404:
        return new NotFoundError(context, error);
      }
    }
  }

  return new DmsError(context, error);
}
