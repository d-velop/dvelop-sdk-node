import { AxiosInstance } from "axios";
import { isArray } from "util";
import { DvelopHttpResponse, NotFoundError } from "..";
import { DvelopHttpRequestConfig } from "./http-client";

export interface HalJsonResponse {
  _links: {
    [key: string]: {
      href: string;
    }
  }
}

interface UrlParamSplit {
  url: string;
  params: { [key: string]: any }
}

async function getFollowUrl(axios: AxiosInstance, config: DvelopHttpRequestConfig, follow: string): Promise<UrlParamSplit> {

  if (!config.headers) {
    config.headers = {};
  }

  config.method = "GET";
  config.headers["Accept"] = "application/hal+json, application/json";
  config.responseType = "json";
  config.follows = [];

  let response: DvelopHttpResponse;

  response = await axios.request(config);

  if (!response.data._links[follow] || !response.data._links[follow].href) {
    throw new NotFoundError(`No hal-json link found for ${follow}.`);
  }

  let followUrl: string = response.data._links[follow].href;

  return templateUrl(followUrl, config.params, config.templates);
}

function templateUrl(url: string, originalParams: { [key: string]: string | undefined }, templates: { [key: string]: string } | undefined): { url: string, params: { [key: string]: string } } {

  let matchArray: RegExpExecArray | null;

  let params: { [key: string]: string } = originalParams ? originalParams as { [key: string]: string } : {};

  while ((matchArray = /{(.*?)}/g.exec(url)) !== null) {

    const matchWithBrackets: string = matchArray[0];
    const matchWithoutBrackets: string = matchArray[1];

    // find matches like {?a,b,c}
    if (matchWithoutBrackets.match(/^\?.*/)) {

      const keys: string[] = matchWithoutBrackets.slice(1).split(",");

      keys.forEach(key => {

        if (templates && templates[key]) {

          let value: any = templates[key];

          if (Array.isArray(value)) {
            if (value.length > 0) {
              value = JSON.stringify(templates[key]);
              params[key] = value;
            }
          } else {
            params[key] = value;
          }
        }
      });

      url = url.replace(matchWithBrackets, "");

    } else {

      if (templates && templates[matchWithoutBrackets]) {
        url = url.replace(matchWithBrackets, templates[matchWithoutBrackets]);
      } else {
        url = url.replace(matchWithBrackets, "");
      }
    }
  }

  return { url, params };
}

export function axiosFollowHalJsonFunctionFactory(axios: AxiosInstance): (config: DvelopHttpRequestConfig) => Promise<DvelopHttpRequestConfig> {
  return async (config: DvelopHttpRequestConfig) => {
    if (config.url) {
      const urlAndParams: UrlParamSplit = templateUrl(config.url, config.params, config.templates);
      config.url = urlAndParams.url;
      config.params = urlAndParams.params;
    }

    if (!config.follows || config.follows.length === 0) {
      return config;
    }

    for (let f of config.follows) {
      const follow: any = await getFollowUrl(axios, { ...config }, f);
      config.url = follow.url;
      config.params = follow.params;
    }

    delete config.follows;
    return config;
  };
}