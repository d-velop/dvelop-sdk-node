import axios, { AxiosResponse } from "axios";
import { TenantContext, BadRequestError, UnauthorizedError, ServiceDeniedError } from "../../index";
import { getDmsObject } from "../get-dms-object/get-dms-object";

export interface DeleteDmsObjectParams {
  repositoryId: string;
  sourceId: string;
  dmsObjectId: string;
  reason: string;
  versions: "current" | "all - i know what i'm doing";
}

interface HalJsonDto {
  _links: {
    delete?: {
      href: string;
    },
    deleteWithReason?: {
      href: string;
    }
  }
}

export async function deleteDmsObject(context: TenantContext, params: DeleteDmsObjectParams): Promise<void>;
export async function deleteDmsObject<T>(context: TenantContext, params: DeleteDmsObjectParams, transform: (response: AxiosResponse)=> T): Promise<T>;
export async function deleteDmsObject(context: TenantContext, params: DeleteDmsObjectParams, transform: (response: AxiosResponse)=> any = (_) => { }): Promise<any> {

  try {
    const dmsObjectDto: HalJsonDto = await getDmsObject(context, params, (response: AxiosResponse<HalJsonDto>) => response.data);
    let deleteResponse: AxiosResponse<HalJsonDto | null> = await deleteRequest(context, params, dmsObjectDto);

    if (params.versions === "all - i know what i'm doing") {

      while (deleteResponse.data) {
        deleteResponse = await deleteRequest(context, params, deleteResponse.data);
      }

      return transform(deleteResponse);

    } else {
      return transform(deleteResponse);
    }
  } catch (e) {

    const errorContext: string = "Failed to delete dmsObject";

    if (axios.isAxiosError(e)) {
      switch (e.response?.status) {
      case 400:
        throw new BadRequestError(errorContext, e);

      case 401:
        throw new UnauthorizedError(errorContext, e);
      }
    } else if (e instanceof NoDeletionLinksError) {
      throw new ServiceDeniedError(errorContext, "Deletion was denied. For further information refer to the docs.");
    }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}
class NoDeletionLinksError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor() {
    super();
    Object.setPrototypeOf(this, NoDeletionLinksError.prototype);
  }
}

async function deleteRequest(context: TenantContext, params: DeleteDmsObjectParams, dto: HalJsonDto): Promise<AxiosResponse<HalJsonDto | null>> {

  let url: string;

  if (dto._links.delete) {
    url = dto._links.delete.href;
  } else if (dto._links.deleteWithReason) {
    url = dto._links.deleteWithReason.href;
  } else {
    throw new NoDeletionLinksError();
  }

  return await axios.delete<HalJsonDto | null>(url, {
    baseURL: context.systemBaseUri,
    headers: {
      "Authorization": `Bearer ${context.authSessionId}`,
      "Accept": "application/hal+json",
      "Content-Type": "application/hal+json"
    },
    data: {
      reason: params.reason
    }
  });
}