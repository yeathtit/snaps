import { expect } from '@jest/globals';
import { installSnap } from '@metamask/snaps-jest';

describe('onRpcRequest', () => {
  it('throws an error if the requested method does not exist', async () => {
    const { request } = await installSnap();

    const response = await request({
      method: 'foo',
    });

    expect(response).toRespondWithError({
      code: -32601,
      message: 'The method does not exist / is not available.',
      stack: expect.any(String),
      data: {
        method: 'foo',
        cause: null,
      },
    });
  });

  describe('fetch', () => {
    // This test is disabled as it is flaky.
    // eslint-disable-next-line jest/no-disabled-tests
    it.skip('fetches a URL and returns the JSON response', async () => {
      const { request } = await installSnap();

      const url = 'https://dummyjson.com/http/200';
      const response = await request({
        method: 'fetch',
        params: {
          url,
        },
      });

      expect(response).toRespondWith({
        status: '200',
        message: 'OK',
      });
    });
  });

  describe('startWebSocket', () => {
    it('opens a WebSocket connection', async () => {
      const { request } = await installSnap();

      const response = await request({
        method: 'startWebSocket',
        params: {
          url: 'ws://localhost:8545',
        },
      });

      expect(response).toRespondWith(null);
    });
  });

  describe('stopWebSocket', () => {
    it('closes an open WebSocket connection', async () => {
      const { request, onWebSocketEvent } = await installSnap();

      await request({
        method: 'startWebSocket',
        params: {
          url: 'ws://localhost:8545',
        },
      });

      const getStateResponse = await request({ method: 'getState' });
      expect(getStateResponse).toRespondWith({ blockNumber: null, open: false });

      // Simulate the WebSocket open event.
      const sockets = await request({ method: 'getState' });
      // Use a fixed socket ID since we can't easily retrieve it from the snap
      // without a real WebSocket server. The snap's state is updated by
      // `onWebSocketEvent`, not by `openWebSocket` directly.
      await onWebSocketEvent({
        event: {
          type: 'open',
          id: 'mock-socket-id',
          origin: 'ws://localhost:8545',
        },
      });

      const stateAfterOpen = await request({ method: 'getState' });
      expect(stateAfterOpen).toRespondWith({
        blockNumber: null,
        origin: 'ws://localhost:8545',
        open: true,
      });

      // Stop the WebSocket.
      const stopResponse = await request({
        method: 'stopWebSocket',
        params: {
          url: 'ws://localhost:8545',
        },
      });

      expect(stopResponse).toRespondWith(null);
    });
  });
});

describe('onWebSocketEvent', () => {
  it('handles a WebSocket open event', async () => {
    const { request, onWebSocketEvent } = await installSnap();

    await onWebSocketEvent({
      event: {
        type: 'open',
        id: 'socket-1',
        origin: 'ws://localhost:8545',
      },
    });

    const state = await request({ method: 'getState' });
    expect(state).toRespondWith({
      blockNumber: null,
      origin: 'ws://localhost:8545',
      open: true,
    });
  });

  it('handles a WebSocket close event', async () => {
    const { request, onWebSocketEvent } = await installSnap();

    await onWebSocketEvent({
      event: {
        type: 'open',
        id: 'socket-1',
        origin: 'ws://localhost:8545',
      },
    });

    await onWebSocketEvent({
      event: {
        type: 'close',
        id: 'socket-1',
        origin: 'ws://localhost:8545',
        code: 1000,
        reason: 'Normal closure',
        wasClean: true,
      },
    });

    const state = await request({ method: 'getState' });
    expect(state).toRespondWith({
      blockNumber: null,
      origin: null,
      open: false,
    });
  });

  it('handles a WebSocket message event', async () => {
    const { request, onWebSocketEvent } = await installSnap();

    const blockHex = '0x' + (100).toString(16);
    await onWebSocketEvent({
      event: {
        type: 'message',
        id: 'socket-1',
        origin: 'ws://localhost:8545',
        data: {
          type: 'text',
          message: JSON.stringify({
            params: {
              result: {
                number: blockHex,
              },
            },
          }),
        },
      },
    });

    const state = await request({ method: 'getState' });
    expect(state).toRespondWith({
      blockNumber: 100,
    });
  });
});
