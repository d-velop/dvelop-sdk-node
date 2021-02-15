export interface ScimUser {
  id: string;
  userName: string;
  name: {
    familyName: string;
    givenName: string;
  };
  displayName: string;
  emails: {
    value: string;
  }[];
  groups: {
    value: string;
    display: string;
  }[];
  photos: {
    value: string;
    type: string;
  }[];
}