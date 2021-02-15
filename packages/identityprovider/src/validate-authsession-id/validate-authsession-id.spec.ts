import axios from 'axios';
import { validateAuthsessionId } from './validate-authsession-id';

jest.mock('axios');

describe('validateAuthsessionId', () => {

  const mockedAxios = axios as jest.Mocked<typeof axios>;

  beforeEach(() => {
    mockedAxios.get.mockReset();
  })

  it('should make GET with correct URI', async () => {

    const systemBaseUri = 'HiItsMeSystemBaseUri';
    mockedAxios.get.mockResolvedValue({});

    await validateAuthsessionId(systemBaseUri, 'HiItsMeAuthSessionId');

    expect(mockedAxios.get).toBeCalledWith(`${systemBaseUri}/identityprovider/validate`, expect.any(Object));
  });

  it('should make GET with correct headers', async () => {

    const authessionId = 'HiItsMeAuthsessionId';
    mockedAxios.get.mockResolvedValue({});

    await validateAuthsessionId('HiItsMeSystemBaseUri', authessionId);

    expect(mockedAxios.get).toBeCalledWith(expect.any(String), { headers: { 'Authorization': `Bearer ${authessionId}` } });
  });

  it('should return response.data object', async () => {

    const data = { hi: 'ItsMeDataObject' }
    mockedAxios.get.mockResolvedValue({ data });

    const user = await validateAuthsessionId('HiItsMeSystemBaseUri', 'HiItsMeAuthSessionId');

    expect(user).toEqual(data);
  });
})
