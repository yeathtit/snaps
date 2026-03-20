import {
  getCloseWebSocketImplementation,
  getGetWebSocketsImplementation,
  getOpenWebSocketImplementation,
  getSendWebSocketMessageImplementation,
} from './web-sockets';
import { createStore } from '../../store';
import { getMockOptions } from '../../test-utils';

describe('getOpenWebSocketImplementation', () => {
  it('opens a WebSocket connection and returns its ID', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getOpenWebSocketImplementation(runSaga);

    const id = await fn('wss://example.com');

    expect(id).toStrictEqual(expect.any(String));
    expect(
      Object.values(store.getState().webSockets.webSockets),
    ).toStrictEqual([
      {
        id,
        url: 'wss://example.com',
        protocols: [],
      },
    ]);
  });

  it('opens a WebSocket connection with protocols', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getOpenWebSocketImplementation(runSaga);

    const id = await fn('wss://example.com', ['protocol1', 'protocol2']);

    expect(id).toStrictEqual(expect.any(String));
    expect(
      Object.values(store.getState().webSockets.webSockets),
    ).toStrictEqual([
      {
        id,
        url: 'wss://example.com',
        protocols: ['protocol1', 'protocol2'],
      },
    ]);
  });

  it('can open multiple WebSocket connections', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const fn = getOpenWebSocketImplementation(runSaga);

    const id1 = await fn('wss://example.com');
    const id2 = await fn('wss://other.com');

    expect(id1).not.toStrictEqual(id2);
    expect(
      Object.values(store.getState().webSockets.webSockets),
    ).toHaveLength(2);
  });
});

describe('getCloseWebSocketImplementation', () => {
  it('closes a WebSocket connection', async () => {
    const { store, runSaga } = createStore(getMockOptions());
    const open = getOpenWebSocketImplementation(runSaga);
    const close = getCloseWebSocketImplementation(runSaga);

    const id = await open('wss://example.com');
    close(id);

    expect(store.getState().webSockets.webSockets).toStrictEqual({});
  });

  it('does not throw if the WebSocket does not exist', () => {
    const { runSaga } = createStore(getMockOptions());
    const close = getCloseWebSocketImplementation(runSaga);

    expect(() => close('nonexistent')).not.toThrow();
  });
});

describe('getSendWebSocketMessageImplementation', () => {
  it('sends a WebSocket message (no-op in simulation)', async () => {
    const { runSaga } = createStore(getMockOptions());
    const fn = getSendWebSocketMessageImplementation(runSaga);

    await expect(fn('id', 'message')).resolves.toBeUndefined();
  });

  it('accepts binary data (no-op in simulation)', async () => {
    const { runSaga } = createStore(getMockOptions());
    const fn = getSendWebSocketMessageImplementation(runSaga);

    await expect(fn('id', [1, 2, 3])).resolves.toBeUndefined();
  });
});

describe('getGetWebSocketsImplementation', () => {
  it('returns all connected WebSockets', async () => {
    const { runSaga } = createStore(getMockOptions());
    const open = getOpenWebSocketImplementation(runSaga);
    const getAll = getGetWebSocketsImplementation(runSaga);

    const id = await open('wss://example.com');

    expect(getAll()).toStrictEqual([
      {
        id,
        url: 'wss://example.com',
        protocols: [],
      },
    ]);
  });

  it('returns an empty array when no WebSockets are connected', () => {
    const { runSaga } = createStore(getMockOptions());
    const getAll = getGetWebSocketsImplementation(runSaga);

    expect(getAll()).toStrictEqual([]);
  });
});
