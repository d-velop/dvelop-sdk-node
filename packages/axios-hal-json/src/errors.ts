import { AxiosRequestConfig, AxiosResponse} from "axios";

/**
 * A request in the follow-chain failed.
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

