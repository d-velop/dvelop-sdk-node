import { DvelopContext } from "../context/context";

export interface DvelopInternals<T> {
  fetch?: (context: DvelopContext, input: RequestInfo | URL, init?: RequestInit) => Promise<Response>
  transform?: (response: Response) => T
}