export interface Repository {
  id: string;
  name: string;
  supportsFulltextSearch: boolean;
  serverId: string;
  available: boolean,
  isDefault: boolean,
  version: string;
}