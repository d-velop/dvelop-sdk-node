import axios, { AxiosResponse } from "axios";
import { DmsApiError } from "../../errors";
import { UnauthorizedError } from "../../index";

export interface SearchParams {
  repositoryId: string;
  sourceId: string;
  fulltext?: string;
}

interface SearchResultPageDto {
  _links: {
    next: {
      href: string;
    }
  }
  page: number;
}

export interface SearchResultPage {
  pageNumber: number;
  getNextPage?: ()=> Promise<SearchResultPage>;
}


export async function search(systemBaseUri: string, authSessionId: string, params: SearchParams): Promise<SearchResultPage> {

  const errorContext: string = "Failed to search repository";

  const templates: any = {
    repositoryid: params.repositoryId,
    sourceid: params.sourceId
  };

  if (params.fulltext) {
    templates.fulltext = params.fulltext;
  }

  let resultPage: SearchResultPageDto;

  try {
    const response = await axios.get<SearchResultPageDto>("/dms", {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`
      },
      follows: ["repo", "searchresultwithmapping"],
      templates: templates
    });

    resultPage = response.data;
  } catch (e) {
    if (e.response) {
      switch (e.response.status) {
      case 400:
        throw new DmsApiError(errorContext, e.response.data.reason, e.response);
      case 401:
        throw new UnauthorizedError(errorContext, e.response);

      }
    }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
  return transformDtoToPage(systemBaseUri, authSessionId, resultPage);
}

function transformDtoToPage(systemBaseUri: string, authSessionId: string, dto: SearchResultPageDto): SearchResultPage {

  let result: SearchResultPage = {
    pageNumber: dto.page
  };

  if (dto._links && dto._links.next) {
    result.getNextPage = async () => getNextPage(systemBaseUri, authSessionId, dto._links.next.href);
  }

  return result;
}

async function getNextPage(systemBaseUri: string, authSessionId: string, url: string): Promise<SearchResultPage> {

  const errorContext: string = "Failed to search repository";

  try {
    const response: AxiosResponse<SearchResultPageDto> = await axios.get<SearchResultPageDto>(url, {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`
      }
    });

    return transformDtoToPage(systemBaseUri, authSessionId, response.data);
  } catch (e) {
    if (e.response) {
      switch (e.response.status) {
      case 401:
        throw new UnauthorizedError(errorContext, e.response);
      }
    }
    e.message = `${errorContext}: ${e.message}`;
    throw e;
  }
}
