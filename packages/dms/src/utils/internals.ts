
export interface HalJsonLinks {
  [key: string]: {
    href: string;
    templated?: boolean;
    icon?: string;
  }
}

export { AxiosResponse, AxiosError } from "axios";
export { GetRepositoryListDto, transformGetRepositoryListDto } from "../repositories/get-repositories/get-repositories";
export { GetRepositoryDto, transformGetRepositoryDto } from "../repositories/get-repository/get-repository";
// export { DmsObjectWithMappingDto, transformGetDmsObjectResponseToDmsObject } from "../dms-objects/get-dms-object/get-dms-object";
