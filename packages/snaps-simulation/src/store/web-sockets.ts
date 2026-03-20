import type { GetWebSocketsResult } from '@metamask/snaps-sdk';
import type { PayloadAction } from '@reduxjs/toolkit';
import { createSelector, createSlice } from '@reduxjs/toolkit';

import type { ApplicationState } from './store';

/**
 * A WebSocket connection object stored in the simulation state.
 *
 * @property id - The unique identifier of the WebSocket connection.
 * @property url - The URL of the WebSocket connection.
 * @property protocols - An array of subprotocols used in the WebSocket
 * connection.
 */
export type WebSocketConnection = {
  id: string;
  url: string;
  protocols: string[];
};

/**
 * The WebSockets state.
 *
 * @property webSockets - A map of WebSocket IDs to connection objects.
 */
export type WebSocketsState = {
  webSockets: Record<string, WebSocketConnection>;
};

/**
 * The initial WebSockets state.
 */
const INITIAL_STATE: WebSocketsState = {
  webSockets: {},
};

export const webSocketsSlice = createSlice({
  name: 'webSockets',
  initialState: INITIAL_STATE,
  reducers: {
    addWebSocket: (state, action: PayloadAction<WebSocketConnection>) => {
      state.webSockets[action.payload.id] = action.payload;
    },
    removeWebSocket: (state, action: PayloadAction<string>) => {
      delete state.webSockets[action.payload];
    },
    clearWebSockets: (state) => {
      state.webSockets = {};
    },
  },
});

export const { addWebSocket, removeWebSocket, clearWebSockets } =
  webSocketsSlice.actions;

/**
 * Get all WebSocket connections from the state.
 *
 * @param state - The application state.
 * @returns An array of WebSocket connections.
 */
export const getWebSockets = createSelector(
  (state: ApplicationState) => state.webSockets,
  ({ webSockets }): GetWebSocketsResult => Object.values(webSockets),
);
