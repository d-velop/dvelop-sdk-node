import axios, { AxiosResponse } from "axios";
import { DmsApiError } from "../../errors";
import { UnauthorizedError } from "../../index";

export interface SearchParams {
  repositoryId: string;
  sourceId: string;
  categories?: string[];
  properties?: {
    [key: string]: string[]
  }[];
  fulltext?: string;
  sortProperty?: string;
  ascending?: boolean;
  page?: number;
  pageSize?: number;
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

  if (params.categories && params.categories.length > 0) {
    templates.sourcecategories = params.categories;
  }

  if (params.properties && params.properties.length > 0) {
    // TODO: transform
    // Suche nach einem numerischen Wert oder einem Geldwert:
    // Geben Sie den Wert ohne Tausendertrennzeichen an. Als Dezimaltrennzeichen gilt der Punkt (.). Beispiel: Für den Wert 1.000,20 EUR geben Sie 1000.20 an.

    // Suche nach einem Datum und Uhrzeit:
    // Geben Sie das Datum im Format YYYY-MM-DD an. Beispiel: Für den 05.12.2014 (DD.MM.YYYY) geben Sie 2014-12-05 an.
    // Zeitangaben werden nach dem Format YYYY-MM-DDTHH:mm:ss+01:00 durchführt. Das Pluszeichen (+) müssen Sie mit %2b encodieren. Beispiel: 2015-02-18T23:59:59%2b01:00 für den 18.02.2015 um 23:59 Uhr und 59 Sekunden in der Zeitzone UTC+1 für Winterzeit in Deutschland.

    // Suche nach Elementen, die sich in einem bestimmten Bereich befinden:
    // Für die Bereichssuche verwenden Sie als Trennzeichen eine Kombination aus einem Pipe- und Minuszeichen (|-). Beispiele für ein numerisches Feld mit der ID "231":
    // Werte größer oder gleich 100:  {"231":["100|-"]}
    // Werte kleiner oder gleich 100: {"231":["|-100"]}
    // Werte zwischen 100 und 200: {"231":["100|-200"]}
    templates.sourceproperties = params.properties;
  }

  if (params.fulltext) {
    templates.fulltext = params.fulltext;
  }

  if (params.sortProperty) {
    templates.sourcepropertysort = params.sortProperty;
  }

  if (params.ascending) {
    templates.ascending = params.ascending;
  }

  if (params.page) {
    templates.page = params.page;
  }

  if (params.pageSize) {
    templates.pagesize = params.pageSize;
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
