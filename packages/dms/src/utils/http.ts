import axios, { AxiosInstance } from "axios";
import { followHalJson } from "../../../axios-hal-json/lib";
import { BadInputError, DmsError, UnauthorizedError } from "./errors";

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

export function mapRequestError(expectedStatusCodes: number[], context: string, error: Error): Error {

  if (isAxiosError(error) && error.response?.status) {

    const status: number = error.response.status;

    if (status === 401) {
      return new UnauthorizedError(context, error);
    } else if (expectedStatusCodes.includes(status)) {

      switch (status) {
      case 400:
        return new BadInputError(context, error);
      }
    }
  }

  return new DmsError(context, error);
}
