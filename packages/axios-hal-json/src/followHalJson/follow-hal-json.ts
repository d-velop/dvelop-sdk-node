import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { HalJsonRequestChainError, NoHalJsonLinkToFollowError, NoHalJsonLinksInResponseError } from "../index";

/**
 * This method can be registered as a [axios interceptor]{@link https://github.com/axios/axios#interceptors} to add hal-json follow behaviour. After registering just add ```follows``` and ```templates``` to your [request-config]{@link https://github.com/axios/axios#request-config}. To work with relative hal-json links use the ```baseUri``` and ```uri``` property.
 *
 * The original axios config is preserved except the ```url``` property. During hal-json request the method is set to 'GET' and the Accept-Header is set to 'application/hal+json, application/json'.
 *
 * @param {AxiosRequestConfig} config Config object for axios request
 * @returns {AxiosRequestConfig} Config object for axios request. The ```url``` property will contain the final url
 *
 * @throws {@link HalJsonRequestChainError} indicates that a request in the follow-chain failed.
 * @throws {@link NoHalJsonLinksInResponseError} indicates that a response within the follow-chain does not contain _links.
 * @throws {@link NoHalJsonLinkToFollowError} indicates that a response in the follow-chain does not contain a follow link in _links.

 * @example ```typescript
 *
 * import axios from "axios";
 * import { followHalJson } from "@dvelop-sdk/axios-hal-json";
 *
 * axios.interceptors.request.use(followHalJson);
 *
 * const response: Axiosresponse = axios({
 *   baseUrl: "https://abstergo-industries.d-velop.cloud",
 *   uri: "/dms",
 *   follows: ["repo"],
 *   templates: {repositoryid: "e2f7b638-1fff-4796-90d0-25205f57a582"}
 * });
 * ```
 */
export async function followHalJson(config: AxiosRequestConfig): Promise<AxiosRequestConfig> {

  if (config.url) {
    const t: any = templateUrl(config.url, config.templates);
    config.url = t.url;
    config.params = t.params;
  }

  if (!config.follows || config.follows.length === 0) {
    return config;
  }

  for (let f of config.follows) {
    const follow: any = await getFollowUrl({ ...config }, f);
    config.url = follow.url;
    config.params = follow.params;
  }
  return config;
}

async function getFollowUrl(config: AxiosRequestConfig, follow: string): Promise<{ url: string, params: { [key: string]: string } }> {

  if (!config.headers) {
    config.headers = {};
  }

  config.method = "GET";
  config.headers["Accept"] = "application/hal+json, application/json";
  config.follows = [];

  let response: AxiosResponse;

  try {
    response = await axios.request(config);
  } catch (e) {
    throw new HalJsonRequestChainError(follow, e);
  }

  if (!response.data._links) {
    throw new NoHalJsonLinksInResponseError(follow, response);
  }

  if (!response.data._links[follow] || !response.data._links[follow].href) {
    throw new NoHalJsonLinkToFollowError(follow, response);
  }

  let followUrl: string = response.data._links[follow].href;

  return templateUrl(followUrl, config.templates);

}

function templateUrl(url: string, templates: { [key: string]: string } | undefined): { url: string, params: { [key: string]: string } } {

  let matchArray: RegExpExecArray | null;
  let params: { [key: string]: string } = {};

  while ((matchArray = /{(.*?)}/g.exec(url)) !== null) {

    const matchWithBrackets: string = matchArray[0];
    const matchWithoutBrackets: string = matchArray[1];

    // find matches like {?a,b,c}
    if (matchWithoutBrackets.match(/^\?.*/)) {

      const keys: string[] = matchWithoutBrackets.slice(1).split(",");

      keys.forEach(key => {
        if (templates && templates[key]) {
          params[key] = templates[key];
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


