import { AxiosError, AxiosResponse } from "axios";

/**
 * A request in the follow-chain failed.
 * @category Error
 */
export class HalJsonRequestChainError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(follow: string, public requestError: AxiosError) {
    super(`Request for in the follow-chain failed. Cannot follow '${follow}'.`);
    Object.setPrototypeOf(this, HalJsonRequestChainError.prototype);
  }
}

/**
 * A response within the follow-chain does not contain _links.
 * @category Error
 */
export class NoHalJsonLinksInResponseError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(follow: string, public response: AxiosResponse) {
    super(`Request in the follow-chain does not contain any _links. Cannot follow '${follow}'.`);
    Object.setPrototypeOf(this, NoHalJsonLinksInResponseError.prototype);
  }
}

/**
 * A response in the follow-chain does not contain a follow link in _links.
 * @category Error
 */
export class NoHalJsonLinkToFollowError extends Error {
  // eslint-disable-next-line no-unused-vars
  constructor(follow: string, public response: AxiosResponse) {
    super(`Request in the follow-chain does not contain '${follow}' in _links.`);
    Object.setPrototypeOf(this, NoHalJsonLinkToFollowError.prototype);
  }
}

