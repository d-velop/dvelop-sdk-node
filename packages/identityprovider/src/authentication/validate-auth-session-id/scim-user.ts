/**
 * User representation according to the [System for Cross-domain Identity Management (SCIM)]{@link https://tools.ietf.org/html/rfc7644}.
 * @category Authentication
 */
export interface ScimUser {

  /** Unique UserId */
  id?: string;

  /** Technical username */
  userName?: string;

  /** Name object containg family name and given name */
  name?: {
    familyName?: string;
    givenName?: string;
  };

  /** Display name assigned by the administrators */
  displayName?: string;

  /** E-Mail addesses */
  emails?: {
    value?: string;
  }[];

  /** Groups assigned to the user */
  groups?: {
    value?: string;
    display?: string;
  }[];

  /** Photos for the user usually provided by URL in value */
  photos?: {
    value?: string;
    type?: string;
  }[];
}