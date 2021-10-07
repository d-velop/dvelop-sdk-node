import { Context } from "./context";
import { HttpResponse } from "./http";

export type HttpResponseTransformWithoutParamsFunction<T> = (response: HttpResponse, context: Context)=> T;
export type HttpResponseTransformFunction<P, T> = (response: HttpResponse, context: Context, params: P)=> T;
export type ApiCallFunction<P, T> = (context: Context, params: P)=> Promise<T>;