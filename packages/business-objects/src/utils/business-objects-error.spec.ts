import { BadInputError, ForbiddenError, NotFoundError, UnauthorizedError } from "@dvelop-sdk/core";
import { BusinessObjectsError, BusinessObjectsErrorDto, NotImplementedError, ensureSuccessResponse, getErrorString } from "./business-objects-error";

function jsonResponse(dto: any, status: number): Response {
  return new Response(JSON.stringify(dto), { status, headers: { "Content-Type": "application/json" } });
}

const errorDto: BusinessObjectsErrorDto = {
  error: {
    code: "HiItsMeErrorCode",
    message: "HiItsMeErrorMessage",
    details: [
      { code: "HiItsMeDetail1Code", message: "HiItsMeDetail1Message" },
      { code: "HiItsMeDetail2Code", message: "HiItsMeDetail2Message" }
    ]
  }
};

describe("getErrorString", () => {

  it("should build a message including code, message and details", () => {
    const result = getErrorString(errorDto)!;
    expect(result).toContain(errorDto.error.code);
    expect(result).toContain(errorDto.error.message);
    expect(result).toContain(errorDto.error.details![0].code);
    expect(result).toContain(errorDto.error.details![0].message);
    expect(result).toContain(errorDto.error.details![1].code);
    expect(result).toContain(errorDto.error.details![1].message);
  });

  it("should return null when no error is present", () => {
    expect(getErrorString({} as BusinessObjectsErrorDto)).toBeNull();
  });
});

describe("ensureSuccessResponse", () => {

  it("should not throw on 200", async () => {
    await expect(ensureSuccessResponse(new Response("anything", { status: 200 }))).resolves.toBeUndefined();
  });

  it("should not throw on 204", async () => {
    await expect(ensureSuccessResponse(new Response(null, { status: 204 }))).resolves.toBeUndefined();
  });

  describe("on bad-input status codes", () => {

    [400, 409, 413, 414, 429, 431].forEach(status => {

      it(`should throw BadInputError with dto message on status ${status}`, async () => {
        const err: any = await ensureSuccessResponse(jsonResponse(errorDto, status)).catch((e: any) => e);
        expect(err).toBeInstanceOf(BadInputError);
        expect(err.message).toContain(errorDto.error.code);
        expect(err.message).toContain(errorDto.error.message);
      });

      it(`should throw generic BadInputError on missing dto on status ${status}`, async () => {
        const err: any = await ensureSuccessResponse(new Response(null, { status })).catch((e: any) => e);
        expect(err).toBeInstanceOf(BadInputError);
        expect(err.message).toEqual("BusinessObjects-App responded with Status 400 indicating bad Request-Parameters.");
      });
    });
  });

  describe("on statusCode 401", () => {

    it("should throw UnauthorizedError with dto message", async () => {
      const err: any = await ensureSuccessResponse(jsonResponse(errorDto, 401)).catch((e: any) => e);
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toContain(errorDto.error.code);
      expect(err.message).toContain(errorDto.error.message);
    });

    it("should throw UnauthorizedError with string body", async () => {
      const err: any = await ensureSuccessResponse(new Response("HiItsMeErrorReason", { status: 401 })).catch((e: any) => e);
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toEqual("HiItsMeErrorReason");
    });

    it("should throw generic UnauthorizedError on missing body", async () => {
      const err: any = await ensureSuccessResponse(new Response(null, { status: 401 })).catch((e: any) => e);
      expect(err).toBeInstanceOf(UnauthorizedError);
      expect(err.message).toEqual("BusinessObjects-App responded with Status 401 indicating bad authSessionId.");
    });
  });

  describe("on statusCode 403", () => {

    it("should throw ForbiddenError with dto message", async () => {
      const err: any = await ensureSuccessResponse(jsonResponse(errorDto, 403)).catch((e: any) => e);
      expect(err).toBeInstanceOf(ForbiddenError);
      expect(err.message).toContain(errorDto.error.code);
    });

    it("should throw generic ForbiddenError on missing dto", async () => {
      const err: any = await ensureSuccessResponse(new Response(null, { status: 403 })).catch((e: any) => e);
      expect(err).toBeInstanceOf(ForbiddenError);
      expect(err.message).toEqual("BusinessObjects-App responded with Status 403 indicating a forbidden action.");
    });
  });

  describe("on statusCode 404", () => {

    it("should throw NotFoundError with dto message", async () => {
      const err: any = await ensureSuccessResponse(jsonResponse(errorDto, 404)).catch((e: any) => e);
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toContain(errorDto.error.code);
    });

    it("should throw generic NotFoundError on missing dto", async () => {
      const err: any = await ensureSuccessResponse(new Response(null, { status: 404 })).catch((e: any) => e);
      expect(err).toBeInstanceOf(NotFoundError);
      expect(err.message).toEqual("BusinessObjects-App responded with Status 404 indicating a requested resource does not exist.");
    });
  });

  describe("on statusCode 501", () => {

    it("should throw NotImplementedError with dto message", async () => {
      const err: any = await ensureSuccessResponse(jsonResponse(errorDto, 501)).catch((e: any) => e);
      expect(err).toBeInstanceOf(NotImplementedError);
      expect(err.message).toContain(errorDto.error.code);
    });

    it("should throw generic NotImplementedError on missing dto", async () => {
      const err: any = await ensureSuccessResponse(new Response(null, { status: 501 })).catch((e: any) => e);
      expect(err).toBeInstanceOf(NotImplementedError);
      expect(err.message).toEqual("BusinessObjects-App responded with Status 501 indicating a requested feature is not implemented.");
    });
  });

  describe("on unknown statusCode", () => {

    it("should throw BusinessObjectsError with dto message", async () => {
      const err: any = await ensureSuccessResponse(jsonResponse(errorDto, 500)).catch((e: any) => e);
      expect(err).toBeInstanceOf(BusinessObjectsError);
      expect(err.message).toContain(errorDto.error.code);
    });

    it("should throw generic BusinessObjectsError on missing dto", async () => {
      const err: any = await ensureSuccessResponse(new Response(null, { status: 500 })).catch((e: any) => e);
      expect(err).toBeInstanceOf(BusinessObjectsError);
      expect(err.message).toEqual("BusinessObjects-App responded with status 500.");
    });
  });
});
