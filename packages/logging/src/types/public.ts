export interface DbRequest {
  name?: string;
  statement?: string;
  operation?: string;
  duration?: number;
}

export interface IncomingHttpRequest {
  method: string;
  url: string;
  headers?: {
    userAgent?: string;
  };
  clientIp?: string;
  routeTemplate?: string;
}

export interface OutgoingHttpRequest {
  method: string;
  url: string;
  headers?: {
    userAgent?: string;
  };
}

export interface HttpResponse {
  statusCode: number;
  url: string;
  serverDuration?: number;
  clientDuration?: number;
}
