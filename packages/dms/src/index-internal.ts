export interface HalJsonLinks {
  [key: string]: {
    href: string;
    templated?: boolean;
    icon?: string;
  }
}

export { RepositoryListDto, transformRepositoryListDtoToRepositoryArray } from "./repositories/get-repositories/get-repositories";
export { RepositoryDto, transformRepositoryDtoToRepository } from "./repositories/get-repository/get-repository";
