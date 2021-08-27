import axios, { AxiosError, AxiosInstance } from "axios";
import { BadRequestError, UnauthorizedError, NotFoundError } from "../index";

export interface HalJsonDto {
  _links?: {
    [key: string]: {
      href: string;
      templated: boolean;
    }
  }
}

export function getAxiosInstance(): AxiosInstance {
  return axios.create();
}

export function isAxiosError(error: Error): boolean {
  return axios.isAxiosError(error);
}

export function mapAxiosError(context: string, axiosError: AxiosError): Error {
  if (axiosError.response?.status) {
    switch (axiosError.response.status) {
    case 400:
      return new BadRequestError(context, axiosError);

    case 401:
      return new UnauthorizedError(context, axiosError);

    case 404:
      return new NotFoundError(context, axiosError);
    }
  }

  axiosError.message = `${context}: ${axiosError.message}`;
  return axiosError;
}