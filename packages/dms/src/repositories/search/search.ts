import axios, { AxiosResponse } from "axios";
import { UnauthorizedError } from "../../index";

export interface SearchParams {
  repositoryId: string;
  fulltext?: string;
}

export interface SearchResult {
  repositoryId: string,
  repositoryName: string
}

export async function search(systemBaseUri: string, authSessionId: string, params: SearchParams): Promise<SearchResult> {

  const errorContext: string = "Failed to search repository";

  const templates: any = {
    repositoryid: params.repositoryId
  };

  if (params.fulltext) {
    templates.fulltext = params.fulltext;
  }

  try {
    const response: AxiosResponse<SearchResult> = await axios.get<SearchResult>("/dms", {
      baseURL: systemBaseUri,
      headers: {
        "Authorization": `Bearer ${authSessionId}`
      },
      follows: ["repo", "searchresult"],
      templates: templates
    });

    return response.data;

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