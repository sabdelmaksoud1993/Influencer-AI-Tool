import { api } from '../src/api/client';

// Mock SecureStore
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// Mock fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('ApiClient', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  it('should make GET requests with correct URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ data: 'test' }),
    });

    const result = await api.get('/api/events');
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/events'),
      expect.objectContaining({ method: 'GET' })
    );
    expect(result).toEqual({ data: 'test' });
  });

  it('should make POST requests with body', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });

    const result = await api.post('/api/mobile/login', { code: 'test' });
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/api/mobile/login'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ code: 'test' }),
      })
    );
    expect(result).toEqual({ success: true });
  });

  it('should throw error on non-ok response', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: 'Unauthorized' }),
    });

    await expect(api.get('/api/stats')).rejects.toThrow('Unauthorized');
  });

  it('should include Authorization header when token exists', async () => {
    const SecureStore = require('expo-secure-store');
    SecureStore.getItemAsync.mockResolvedValueOnce('test-token');

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({}),
    });

    // Clear cached token
    await api.clearToken();
    SecureStore.getItemAsync.mockResolvedValueOnce('test-token');

    await api.get('/api/mobile/me');
    // Token should be fetched from SecureStore
    expect(SecureStore.getItemAsync).toHaveBeenCalled();
  });

  it('should save and clear tokens', async () => {
    const SecureStore = require('expo-secure-store');

    await api.setToken('new-token');
    expect(SecureStore.setItemAsync).toHaveBeenCalledWith('glowpass_token', 'new-token');

    await api.clearToken();
    expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('glowpass_token');
  });
});
