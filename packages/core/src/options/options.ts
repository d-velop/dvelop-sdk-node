export interface DvelopOptions<T> {
  initOverwrite?: Partial<RequestInit>;
  onResponse?: (response: Response) => T | Promise<T>;
}