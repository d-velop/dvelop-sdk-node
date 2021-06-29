/**
 * User representation according to the [System for Cross-domain Identity Management (SCIM)]{@link https://tools.ietf.org/html/rfc7644}.
 * @property {string} id Unique Id
 * @property {string} userName Technical user name
 * @property {object} name Name object containing familyName (string) and givenName (string)
 * @property {string} displayName Display name assigned to the user
 * @property {object[]} emails Array of objects containing value (string) which represents the e-mail address
 * @property {object[]} groups Array of objects containing value (string) which represents the group ID and display (string) which represents the group name
 * @property {object[]} photos Array of objects containing value (string) which represents a relative URL to the photo and type (string)
 */

export interface ScimUser {
  id?: string;
  userName?: string;
  name?: {
    familyName?: string;
    givenName?: string;
  };
  displayName?: string;
  emails?: {
    value?: string;
  }[];
  groups?: {
    value?: string;
    display?: string;
  }[];
  photos?: {
    value?: string;
    type?: string;
  }[];
}