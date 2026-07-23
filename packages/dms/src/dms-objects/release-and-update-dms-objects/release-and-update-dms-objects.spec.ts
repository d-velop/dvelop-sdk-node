import { DvelopContext } from "@dvelop-sdk/core";
import { DmsError } from "../../utils/dms-error";
import { releaseAndUpdateDmsObject } from "./release-and-update-dms-objects";
import { DmsObject, getDmsObject } from "../get-dms-object/get-dms-object";
import { updateDmsObject, UpdateDmsObjectParams } from "../update-dms-object/update-dms-object";
import { updateDmsObjectStatus } from "../update-dms-object-status/update-dms-object-status";

jest.mock("../get-dms-object/get-dms-object");
jest.mock("../update-dms-object/update-dms-object");
jest.mock("../update-dms-object-status/update-dms-object-status");

const mockGetDmsObject = getDmsObject as jest.MockedFunction<typeof getDmsObject>;
const mockUpdateDmsObject = updateDmsObject as jest.MockedFunction<typeof updateDmsObject>;
const mockUpdateDmsObjectStatus = updateDmsObjectStatus as jest.MockedFunction<typeof updateDmsObjectStatus>;

describe("releaseAndUpdateDmsObject", () => {

  let dmsObject: DmsObject;
  let context: DvelopContext;
  let params: UpdateDmsObjectParams;

  beforeEach(() => {
    jest.resetAllMocks();

    dmsObject = {
      repositoryId: "someRepoId",
      sourceId: "hiItsMeSourceId",
      dmsObjectId: "hiItsMeDmsObjectId",
      categories: ["hiItsMeCategoryId"],
      properties: [
        { key: "property_state", value: "HiItsMeStatus" },
        { key: "hiItsMeProperty", value: "hiItsMePropertyValue" }
      ]
    };

    context = { systemBaseUri: "HiItsMeSystemBaseUri" };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId",
      alterationText: "HiItsMeAlterationText",
    };
  });

  it("should call getDmsObject correctly", async () => {
    mockGetDmsObject.mockResolvedValue(dmsObject);

    await releaseAndUpdateDmsObject(context, params);

    expect(mockGetDmsObject).toHaveBeenCalledTimes(1);
    expect(mockGetDmsObject).toHaveBeenCalledWith(context, {
      repositoryId: params.repositoryId,
      dmsObjectId: params.dmsObjectId,
      sourceId: params.sourceId
    });
  });

  it("should call updateDmsObjectStatus correctly if state is not 'Released'", async () => {
    mockGetDmsObject.mockResolvedValue(dmsObject);

    await releaseAndUpdateDmsObject(context, params);

    expect(mockUpdateDmsObjectStatus).toHaveBeenCalledTimes(1);
    expect(mockUpdateDmsObjectStatus).toHaveBeenCalledWith(context, {
      repositoryId: params.repositoryId,
      dmsObjectId: params.dmsObjectId,
      status: "Release",
      alterationText: params.alterationText
    });
  });

  it("should not call updateDmsObjectStatus if state is 'Released'", async () => {
    mockGetDmsObject.mockResolvedValue({
      ...dmsObject,
      properties: [{ key: "property_state", value: "Released" }]
    });

    await releaseAndUpdateDmsObject(context, params);

    expect(mockUpdateDmsObjectStatus).not.toHaveBeenCalled();
  });

  it("should call updateDmsObject correctly", async () => {
    mockGetDmsObject.mockResolvedValue(dmsObject);

    await releaseAndUpdateDmsObject(context, params);

    expect(mockUpdateDmsObject).toHaveBeenCalledTimes(1);
    expect(mockUpdateDmsObject).toHaveBeenCalledWith(context, params);
  });

  describe("handle no state", () => {

    [
      {
        repositoryId: "someRepoId",
        sourceId: "hiItsMeSourceId",
        dmsObjectId: "hiItsMeDmsObjectId",
        categories: ["hiItsMeCategoryId"]
      },
      {
        repositoryId: "someRepoId",
        sourceId: "hiItsMeSourceId",
        dmsObjectId: "hiItsMeDmsObjectId",
        categories: ["hiItsMeCategoryId"],
        properties: [{ key: "hiItsMePropertyKey", value: "hiItsMePropertyKey" }]
      },
      {
        repositoryId: "someRepoId",
        sourceId: "hiItsMeSourceId",
        dmsObjectId: "hiItsMeDmsObjectId",
        categories: ["hiItsMeCategoryId"],
        properties: [{ key: "property_state" }]
      }
    ].forEach((testCase, i) => {
      it(`should throw DmsError on no state (case ${i})`, async () => {
        mockGetDmsObject.mockResolvedValue(testCase as DmsObject);

        let expectedError: any;
        try {
          await releaseAndUpdateDmsObject(context, params);
        } catch (error: any) {
          expectedError = error;
        }

        expect(expectedError).toBeInstanceOf(DmsError);
        expect(expectedError.message).toContain("State of DmsObject could not be determined.");
      });
    });
  });
});
