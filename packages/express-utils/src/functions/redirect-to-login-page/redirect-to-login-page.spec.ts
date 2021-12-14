import { Request, Response } from "express";
import { _redirectToLoginPageFactory } from "./redirect-to-login-page";

describe("_redirectToLoginPageFactory", () => {

  let mockGetLoginUriFunction: jest.Mock;
  let mockReq: Request;
  let mockRes: Response;

  beforeEach(() => {
    jest.resetAllMocks();
    mockGetLoginUriFunction = jest.fn();
    mockReq = {
      originalUrl: "HiItsMeOriginalUrl",
    } as Request;
    mockRes = {
      redirect: jest.fn()
    } as unknown as Response;
  });

  it("should redirect to loginUrl", () => {

    const loginUri: string = "HiItsMeLoginUri";
    mockGetLoginUriFunction.mockReturnValueOnce(loginUri);

    const redirectToLoginPage = _redirectToLoginPageFactory(mockGetLoginUriFunction);
    redirectToLoginPage(mockReq, mockRes);

    expect(mockGetLoginUriFunction).toHaveBeenCalledTimes(1);
    expect(mockGetLoginUriFunction).toHaveBeenCalledWith(mockReq.originalUrl);
    expect(mockRes.redirect).toHaveBeenCalledTimes(1);
    expect(mockRes.redirect).toHaveBeenCalledWith(loginUri);
  });

});