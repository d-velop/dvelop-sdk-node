import { Context } from "../../utils/context";
import { AxiosResponse, getAxiosInstance, mapRequestError } from "../../utils/http";
import { Repository } from "../get-repository/get-repository";

export type GetRepositoriesTransformer<T> = (response: AxiosResponse<any>, context: Context)=> T;

export const getRepositoriesDefaultTransformer: GetRepositoriesTransformer<Repository[]> = (response: AxiosResponse<any>, _: Context) => {
  const dtos: any[] = response.data.repositories;
  return dtos.map(dto => {
    return {
      id: dto.id,
      name: dto.name,
      sourceId: dto._links["source"].href
    };
  });
};

/**
 * Returns all {@link Repository}-objects for the tenant.
 *
 * @param systemBaseUri SystemBaseUri for the tenant
 * @param authSessionId Valid AuthSessionId
 * @throws {@link UnauthorizedError} indicates an invalid authSessionId or no authSessionId was sent.
 *
 * @category Repository
 *
 * @example ```typescript
 * const repos: Repository[] = await getRepositories("https://steamwheedle-cartel.d-velop.cloud", "dQw4w9WgXcQ");
 * const repoList: string = repos.map(r => r.name).join(", ");
 * console.log("Repositories:", repoList); // Booty Bay Documents, Everlook Documents, Ratchet Documents
 * ```
 */
export async function getRepositories(context: Context): Promise<Repository[]>;
export async function getRepositories<T>(context: Context, transform: GetRepositoriesTransformer<T>): Promise<T>;
export async function getRepositories(context: Context, transform: GetRepositoriesTransformer<any> = getRepositoriesDefaultTransformer): Promise<any> {

  let response: AxiosResponse<any>;

  try {
    response = await getAxiosInstance().get("/dms", {
      baseURL: context.systemBaseUri,
      headers: {
        "Authorization": `Bearer ${context.authSessionId}`
      },
      follows: ["allrepos"]
    });

  } catch (e) {
    throw mapRequestError([], "Failed to get repositories", e);
  }

  return transform(response, context);
}