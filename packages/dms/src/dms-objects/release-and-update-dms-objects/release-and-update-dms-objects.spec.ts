import { DvelopContext, UpdateDmsObjectParams, DmsObject } from "../../index";
import { _releaseAndUpdateDmsObjectFactory, ReleaseAndUpdateDmsObjectError } from "./release-and-update-dms-objects";

describe("updateDmsObject", () => {

  const mockGetDmsObject = jest.fn();
  const mockUpdateDmsObjectStatus = jest.fn();
  const mockUpdateDmsObject = jest.fn();

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
      properties: [{
        key: "property_state",
        value: "HiItsMeStatus"
      }, {
        key: "hiItsMeProperty",
        value: "hiItsMePropertyValue"
      }]
    };

    context = {
      systemBaseUri: "HiItsMeSystemBaseUri"
    };

    params = {
      repositoryId: "HiItsMeRepositoryId",
      sourceId: "HiItsMeSourceId",
      dmsObjectId: "HiItsMeDmsObjectId",
      alterationText: "HiItsMeAlterationText",
    };
  });

  it("should call getDmsObject correctly", async () => {

    mockGetDmsObject.mockResolvedValue(dmsObject);

    const releaseAndUpdateDmsObject = _releaseAndUpdateDmsObjectFactory(mockGetDmsObject, mockUpdateDmsObjectStatus, mockUpdateDmsObject);
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

    const releaseAndUpdateDmsObject = _releaseAndUpdateDmsObjectFactory(mockGetDmsObject, mockUpdateDmsObjectStatus, mockUpdateDmsObject);
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
      ...{
        properties: [
          {
            key: "property_state",
            value: "Released"
          }
        ]
      }
    });

    const releaseAndUpdateDmsObject = _releaseAndUpdateDmsObjectFactory(mockGetDmsObject, mockUpdateDmsObjectStatus, mockUpdateDmsObject);
    await releaseAndUpdateDmsObject(context, params);

    expect(mockUpdateDmsObjectStatus).toHaveBeenCalledTimes(0);
  });



  it("should call updateDmsObject correctly", async () => {

    mockGetDmsObject.mockResolvedValue(dmsObject);

    const releaseAndUpdateDmsObject = _releaseAndUpdateDmsObjectFactory(mockGetDmsObject, mockUpdateDmsObjectStatus, mockUpdateDmsObject);
    await releaseAndUpdateDmsObject(context, params);

    expect(mockUpdateDmsObject).toHaveBeenCalledTimes(1);
    expect(mockUpdateDmsObject).toHaveBeenCalledWith(context, params)
  });

  describe("handle no state", () => {

    [
      {
        repositoryId: "someRepoId",
        sourceId: "hiItsMeSourceId",
        dmsObjectId: "hiItsMeDmsObjectId",
        categories: ["hiItsMeCategoryId"]
      }, {
        repositoryId: "someRepoId",
        sourceId: "hiItsMeSourceId",
        dmsObjectId: "hiItsMeDmsObjectId",
        categories: ["hiItsMeCategoryId"],
        properties: [
          {
            key: "hiItsMePropertyKey",
            value: "hiItsMePropertyKey"
          }
        ]
      }, {
        repositoryId: "someRepoId",
        sourceId: "hiItsMeSourceId",
        dmsObjectId: "hiItsMeDmsObjectId",
        categories: ["hiItsMeCategoryId"],
        properties: [
          {
            key: "property_state"
          }
        ]
      }

    ].forEach(testCase => {
      it("should throw ReleaseAndUpdateDmsObjectError on no state", async () => {

        mockGetDmsObject.mockResolvedValue(testCase);

        const releaseAndUpdateDmsObject = _releaseAndUpdateDmsObjectFactory(mockGetDmsObject, mockUpdateDmsObjectStatus, mockUpdateDmsObject);

        let expectedError: any;
        try {
          await releaseAndUpdateDmsObject(context, params);
        } catch (error: any) {
          expectedError = error;
        }

        expect(expectedError instanceof ReleaseAndUpdateDmsObjectError).toBeTruthy();
        expect(expectedError.message).toContain("State of DmsObject could not be determined.");
      });
    });
  });
});