import { BadInputError, ForbiddenError, NotFoundError, UnauthorizedError } from "@dvelop-sdk/core";
import { DmsError, ensureSuccessResponse } from "./dms-error";

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

    it("should throw BadInputError with reason from body", async () => {
      const response = new Response(JSON.stringify({ reason: "HiItsMeErrorReason" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });

      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(BadInputError);
      expect(err.message).toEqual("HiItsMeErrorReason");
    });

    it("should throw generic BadInputError on missing body", async () => {
      const response = new Response(null, { status: 400 });
      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(BadInputError);
      expect(err.message).toEqual("DMS-App responded with Status 400 indicating bad Request-Parameters.");
    });
  });

  describe("on statusCode 401", () => {

    it("should throw UnauthorizedError with reason from body", async () => {
      const response = new Response(JSON.stringify({ reason: "HiItsMeErrorReason" }), {
        status: 401,
        headers: { "Content-Type": "application/json" }
      });

      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toEqual("HiItsMeErrorReason");
    });

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
      expect(err.message).toEqual("DMS-App responded with Status 401 indicating bad authSessionId.");
    });
  });

  describe("on statusCode 403", () => {

    it("should throw ForbiddenError with reason from body", async () => {
      const response = new Response(JSON.stringify({ reason: "HiItsMeErrorReason" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(ForbiddenError);
      expect(err.message).toEqual("HiItsMeErrorReason");
    });

    it("should throw generic ForbiddenError on missing body", async () => {
      const response = new Response(null, { status: 403 });
      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(ForbiddenError);
      expect(err.message).toEqual("DMS-App responded with Status 403 indicating a forbidden action.");
    });
  });

  describe("on statusCode 404", () => {

    it("should throw NotFoundError with reason from body", async () => {
      const response = new Response(JSON.stringify({ reason: "HiItsMeErrorReason" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toEqual("HiItsMeErrorReason");
    });

    it("should throw NotFoundError with LocalizedMessage from body", async () => {
      const response = new Response(JSON.stringify({ LocalizedMessage: "HiItsMeErrorReason" }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toEqual("HiItsMeErrorReason");
    });

    it("should throw generic NotFoundError on missing body", async () => {
      const response = new Response(null, { status: 404 });
      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toEqual("DMS-App responded with Status 404 indicating a requested resource does not exist.");
    });
  });

  describe("on unknown statusCode", () => {

    it("should throw DmsError with reason from body", async () => {
      const response = new Response(JSON.stringify({ reason: "HiItsMeErrorReason" }), {
        status: 500,
        headers: { "Content-Type": "application/json" }
      });
      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(DmsError);
      expect(err.message).toEqual("HiItsMeErrorReason");
    });

    it("should throw generic DmsError on missing body", async () => {
      const response = new Response(null, { status: 500 });
      const err: any = await ensureSuccessResponse(response).catch((e: any) => e);
      expect(err).toBeInstanceOf(DmsError);
      expect(err.message).toEqual("DMS-App responded with status 500.");
    });
  });
});
