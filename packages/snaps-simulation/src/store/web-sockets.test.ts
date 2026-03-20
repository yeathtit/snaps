import {
  addWebSocket,
  clearWebSockets,
  getWebSockets,
  removeWebSocket,
  webSocketsSlice,
} from './web-sockets';

describe('webSocketsSlice', () => {
  describe('addWebSocket', () => {
    it('adds a WebSocket connection to the state', () => {
      const state = webSocketsSlice.reducer(
        undefined,
        addWebSocket({
          id: 'foo',
          url: 'wss://example.com',
          protocols: [],
        }),
      );

      expect(state).toStrictEqual({
        webSockets: {
          foo: {
            id: 'foo',
            url: 'wss://example.com',
            protocols: [],
          },
        },
      });
    });

    it('adds a WebSocket connection with protocols to the state', () => {
      const state = webSocketsSlice.reducer(
        undefined,
        addWebSocket({
          id: 'bar',
          url: 'wss://example.com/socket',
          protocols: ['protocol1', 'protocol2'],
        }),
      );

      expect(state).toStrictEqual({
        webSockets: {
          bar: {
            id: 'bar',
            url: 'wss://example.com/socket',
            protocols: ['protocol1', 'protocol2'],
          },
        },
      });
    });
  });

  describe('removeWebSocket', () => {
    it('removes a WebSocket connection from the state', () => {
      const state = webSocketsSlice.reducer(
        {
          webSockets: {
            foo: {
              id: 'foo',
              url: 'wss://example.com',
              protocols: [],
            },
          },
        },
        removeWebSocket('foo'),
      );

      expect(state).toStrictEqual({
        webSockets: {},
      });
    });

    it('does not throw if the WebSocket does not exist', () => {
      const state = webSocketsSlice.reducer(
        {
          webSockets: {},
        },
        removeWebSocket('nonexistent'),
      );

      expect(state).toStrictEqual({
        webSockets: {},
      });
    });
  });

  describe('clearWebSockets', () => {
    it('clears all WebSocket connections from the state', () => {
      const state = webSocketsSlice.reducer(
        {
          webSockets: {
            foo: {
              id: 'foo',
              url: 'wss://example.com',
              protocols: [],
            },
            bar: {
              id: 'bar',
              url: 'wss://other.com',
              protocols: [],
            },
          },
        },
        clearWebSockets(),
      );

      expect(state).toStrictEqual({
        webSockets: {},
      });
    });
  });
});

describe('getWebSockets', () => {
  it('returns the WebSocket connections as an array', () => {
    const connection = {
      id: 'foo',
      url: 'wss://example.com',
      protocols: [],
    };

    const state = {
      webSockets: {
        webSockets: {
          foo: connection,
        },
      },
    };

    // @ts-expect-error - The `state` parameter is only partially defined.
    expect(getWebSockets(state)).toStrictEqual([connection]);
  });

  it('returns an empty array when there are no connections', () => {
    const state = {
      webSockets: {
        webSockets: {},
      },
    };

    // @ts-expect-error - The `state` parameter is only partially defined.
    expect(getWebSockets(state)).toStrictEqual([]);
  });
});
