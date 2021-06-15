import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import "../index";

/**
 * A request in the follow-chain failed
 * @category Error
 */
export class HalJsonRequestChainError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(public config: AxiosRequestConfig, public originalError: Error) {
    super(`Request in hal-json chain failed for config: ${JSON.stringify(config)}`);
    Object.setPrototypeOf(this, HalJsonRequestChainError.prototype);
  }
}

/**
 * A response within the follow-chain does not contain _links.
 * @category Error
 */
export class NoHalJsonLinksInResponseError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(public config: AxiosRequestConfig, public response: AxiosResponse) {
    super(`No _links found in response: ${JSON.stringify(response.data)}`);
    Object.setPrototypeOf(this, NoHalJsonLinksInResponseError.prototype);
  }
}

/**
 * A response in the follow-chain does not contain a follow link in _links.
 * @category Error
 */
export class NoHalJsonLinkToFollowError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(public follow: string, public config: AxiosRequestConfig, public response: AxiosResponse) {
    super(`No href for '${follow}' found in _links: ${JSON.stringify(response.data._links)}`);
    Object.setPrototypeOf(this, NoHalJsonLinkToFollowError.prototype);
  }
}

/**
 * A link in the follow-chain needs to be templated but no template value was given.
 * @category Error
 */
export class NoHalJsonTemplateValueError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(public template: string, public followUrl: string, public config?: AxiosRequestConfig, public response?: AxiosResponse) {
    super(`No template value for '${template}'. Needed for url: '${followUrl}`);
    Object.setPrototypeOf(this, NoHalJsonTemplateValueError.prototype);
  }
}

/**
 * This method can be registered as a [axios interceptor]{@link https://github.com/axios/axios#interceptors} to add hal-json follow behaviour. After registering just add ```follows``` and ```templates``` to your [request-config]{@link https://github.com/axios/axios#request-config}. To work with relative hal-json links use the ```baseUri``` and ```uri``` property.
 *
 * The original axios config is preserved except the ```url``` property. During hal-json request the method is set to 'GET' and the Accept-Header is set to 'application/hal+json, application/json'.
 *
 * @throws [[HalJsonRequestChainError]] indicates that a request in the follow-chain failed.
 * @throws [[NoHalJsonLinksInResponseError]] indicates that a response within the follow-chain does not contain _links.
 * @throws [[NoHalJsonLinkToFollowError]] indicates that a response in the follow-chain does not contain a follow link in _links.
 * @throws [[NoHalJsonTemplateValueError]] indicates that a link in the follow-chain needs to be templated but no template value was given.
 *
 * @param {AxiosRequestConfig} config Config object for axios request.
 * @returns {AxiosRequestConfig} Config object for axios request. The ```url``` property will contain the final url.
 *
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
    try {
      config.url = templateUrl(config.url, config.templates);
    } catch (e) {
      e.config = config;
      throw e;
    }
  }

  if (!config.follows || config.follows.length === 0) {
    return config;
  }

  for (let f of config.follows) {
    config.url = await getFollowUrl({ ...config }, f);
  }
  return config;
}

async function getFollowUrl(config: AxiosRequestConfig, follow: string): Promise<string> {

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
    throw new HalJsonRequestChainError(config, e);
  }

  if (!response.data._links) {
    throw new NoHalJsonLinksInResponseError(config, response);
  }

  if (!response.data._links[follow] || !response.data._links[follow].href) {
    throw new NoHalJsonLinkToFollowError(follow, config, response);
  }

  let followUrl: string = response.data._links[follow].href;

  try {
    followUrl = templateUrl(followUrl, config.templates);
  } catch (e) {
    e.config = config;
    e.response = response;
    throw e;
  }

  return followUrl;
}

function templateUrl(url: string, templates: { [key: string]: string } | undefined): string {

  let matches: RegExpExecArray | null;

  while ((matches = /{(.*?)}/g.exec(url)) !== null) {

    const template: string = matches[0];

    if (!templates || Object.keys(templates).length === 0) {
      throw new NoHalJsonTemplateValueError(template, url);
    }

    const value: string = templates[template.slice(1, -1)];

    if (!value) {
      throw new NoHalJsonTemplateValueError(template, url);
    }

    url = url.replace(template, value);
  }

  return url;
}