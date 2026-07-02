import { api } from './api';

describe('api request error handling', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.resetAllMocks();
  });

  it('resolves with parsed JSON when the response is ok', async () => {
    const payload = { status: 'healthy', model_status: {} };
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue(payload),
    }) as unknown as typeof fetch;

    const result = await api.health();

    expect(result).toEqual(payload);
  });

  it('throws the detail message from a non-ok JSON error body', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 400,
      statusText: 'Bad Request',
      json: jest.fn().mockResolvedValue({ detail: 'Baseline model is still training.' }),
    }) as unknown as typeof fetch;

    await expect(api.health()).rejects.toThrow('Baseline model is still training.');
  });

  it('falls back to the status text when the non-ok body is not valid JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
      json: jest.fn().mockRejectedValue(new SyntaxError('Unexpected token')),
    }) as unknown as typeof fetch;

    await expect(api.health()).rejects.toThrow('Internal Server Error');
  });
});

describe('api.sampleNote query-string construction', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('appends a specialty query parameter when one is provided', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue({ note: 'sample note text', specialty: 'Cardiology' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await api.sampleNote('Cardiology');

    const requestedUrl = fetchMock.mock.calls[0][0] as string;
    expect(requestedUrl.endsWith('/sample-note?specialty=Cardiology')).toBe(true);
  });

  it('omits the query string when no specialty is provided', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: jest.fn().mockResolvedValue({ note: 'sample note text', specialty: 'Cardiology' }),
    });
    global.fetch = fetchMock as unknown as typeof fetch;

    await api.sampleNote();

    const requestedUrl = fetchMock.mock.calls[0][0] as string;
    expect(requestedUrl.endsWith('/sample-note')).toBe(true);
    expect(requestedUrl).not.toContain('?');
  });
});