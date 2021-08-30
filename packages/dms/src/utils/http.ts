import axios, { AxiosError, AxiosInstance } from "axios";
import { followHalJson } from "../../../axios-hal-json/lib";
import { BadRequestError, UnauthorizedError, NotFoundError } from "../index";

export { AxiosInstance, AxiosResponse, AxiosError } from "axios";
export const isAxiosError = axios.isAxiosError;

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

export function mapAxiosError(context: string, axiosError: AxiosError): Error {
  if (axiosError.response?.status) {
    switch (axiosError.response.status) {
    case 400:
      return new BadRequestError(context, axiosError);

    case 401:
      return new UnauthorizedError(context, axiosError);

    case 404:
      return new NotFoundError(context, axiosError.response.data?.reason);
    }
  }

  axiosError.message = `${context}: ${axiosError.message}`;
  return axiosError;
}