import { BadInputError, ForbiddenError, NotFoundError, UnauthorizedError } from "@dvelop-sdk/core";
import { InvalidTaskDefinitionError, TaskError, ensureSuccessResponse } from "./task-error";

describe("ensureSuccessResponse", () => {

  it("should not throw on 200", async () => {
    const response = new Response("anything", { status: 200 });
    await expect(ensureSuccessResponse(response)).resolves.toBeUndefined();
  });

  it("should not throw on 204", async () => {
    const response = new Response(null, { status: 204 });
    await expect(ensureSuccessResponse(response)).resolves.toBeUndefined();
  });

  describe("on statusCode 400", () => {

    it("should throw InvalidTaskDefinitionError with validation from body", async () => {
      const validation = { "HiItsMeValidation": "HiItsMeValidationError" };
      const response = new Response(JSON.stringify(validation), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });

      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(InvalidTaskDefinitionError);
      expect(err.message).toEqual("Taskdefinition is invalid. See 'validation'-property for more information.");
      expect(err.validation).toEqual(validation);
    });

    it("should throw generic BadInputError on missing body", async () => {
      const response = new Response(null, { status: 400 });
      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(BadInputError);
      expect(err.message).toEqual("Task-App responded with Status 400 indicating bad Request-Parameters.");
    });
  });

  describe("on statusCode 401", () => {

    it("should throw UnauthorizedError with string body", async () => {
      const response = new Response("HiItsMeErrorReason", { status: 401 });
      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toEqual("HiItsMeErrorReason");
    });

    it("should throw generic UnauthorizedError on missing body", async () => {
      const response = new Response(null, { status: 401 });
      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toEqual("Task-App responded with Status 401 indicating bad authSessionId.");
    });
  });

  it("should throw generic ForbiddenError on statusCode 403", async () => {
    const response = new Response(null, { status: 403 });
    const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
    expect(err).toBeInstanceOf(ForbiddenError);
    expect(err.message).toEqual("Task-App responded with Status 403 indicating a forbidden action.");
  });

  it("should throw generic NotFoundError on statusCode 404", async () => {
    const response = new Response(null, { status: 404 });
    const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
    expect(err).toBeInstanceOf(NotFoundError);
    expect(err.message).toEqual("Task-App responded with Status 404 indicating a requested resource does not exist.");
  });

  it("should throw TaskError on statusCode 429", async () => {
    const response = new Response(null, { status: 429 });
    const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
    expect(err).toBeInstanceOf(TaskError);
    expect(err.message).toEqual("Task-App responded with status 429 indicating that you sent too many requests in a short time. Consider throttling your requests.");
  });

  it("should throw generic TaskError on unknown status code", async () => {
    const response = new Response(null, { status: 500 });
    const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
    expect(err).toBeInstanceOf(TaskError);
    expect(err.message).toEqual("Task-App responded with status 500.");
  });
});
