export interface CloudCenterEvent {
  type: "subscribe" | "unsubscribe" | "resubscribe" | "purge";
  tenantId: string;
  baseUri: string;
}