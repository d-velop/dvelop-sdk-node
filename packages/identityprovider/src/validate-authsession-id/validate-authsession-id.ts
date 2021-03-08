import axios, { AxiosResponse } from "axios";
import { ScimUser } from "./scrim-user";

export async function validateAuthsessionId(systemBaseUri: string, authsessionId: string): Promise<ScimUser> {
  const response: AxiosResponse = await axios.get(`${systemBaseUri}/identityprovider/validate`, {
    headers: {
      "Authorization": `Bearer ${authsessionId}`
    }
  });
  return response.data as ScimUser;
}