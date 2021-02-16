import { v4 } from "uuid";

export function generateRequestId(): string {
  return v4();
}