import type { GetWebSocketsResult } from '@metamask/snaps-sdk';
import { nanoid } from '@reduxjs/toolkit';
import type { SagaIterator } from 'redux-saga';
import { put, select } from 'redux-saga/effects';

import type { RunSagaFunction } from '../../store';
import { addWebSocket, getWebSockets, removeWebSocket } from '../../store';

/**
 * Open a mock WebSocket connection.
 *
 * @param url - The WebSocket URL.
 * @param protocols - Optional array of subprotocols.
 * @yields Adds the WebSocket connection to the store.
 * @returns The unique identifier of the WebSocket connection.
 */
function* openWebSocketImplementation(
  url: string,
  protocols?: string[],
): SagaIterator<string> {
  const id = nanoid();
  yield put(addWebSocket({ id, url, protocols: protocols ?? [] }));
  return id;
}

/**
 * Close a mock WebSocket connection.
 *
 * @param id - The unique identifier of the WebSocket connection.
 * @yields Removes the WebSocket connection from the store.
 */
function* closeWebSocketImplementation(id: string): SagaIterator<void> {
  yield put(removeWebSocket(id));
}

/**
 * Send a message to a mock WebSocket. In the simulation, this is a no-op as
 * there is no actual server to send the message to.
 *
 * @param _id - The unique identifier of the WebSocket connection.
 * @param _data - The message data to send.
 * @yields Nothing.
 */
function* sendWebSocketMessageImplementation(
  _id: string,
  _data: string | number[],
): SagaIterator<void> {
  // In the simulation, sending a WebSocket message is a no-op since there is
  // no actual server. Tests can call `onWebSocketEvent` to simulate incoming
  // messages.
}

/**
 * Get all connected WebSockets.
 *
 * @yields Selects the WebSocket connections from the store.
 * @returns An array of WebSocket connection objects.
 */
function* getWebSocketsImplementation(): SagaIterator<GetWebSocketsResult> {
  return (yield select(getWebSockets)) as GetWebSocketsResult;
}

/**
 * Get a method that can be used to open a mock WebSocket connection.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that opens a mock WebSocket connection and returns its ID.
 */
export function getOpenWebSocketImplementation(runSaga: RunSagaFunction) {
  return async (
    ...args: Parameters<typeof openWebSocketImplementation>
  ): Promise<string> => {
    return runSaga(openWebSocketImplementation, ...args).result() as string;
  };
}

/**
 * Get a method that can be used to close a mock WebSocket connection.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that closes a mock WebSocket connection.
 */
export function getCloseWebSocketImplementation(runSaga: RunSagaFunction) {
  return (...args: Parameters<typeof closeWebSocketImplementation>): void => {
    runSaga(closeWebSocketImplementation, ...args).result();
  };
}

/**
 * Get a method that can be used to send a message to a mock WebSocket. In the
 * simulation, this is a no-op.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that simulates sending a WebSocket message.
 */
export function getSendWebSocketMessageImplementation(
  runSaga: RunSagaFunction,
) {
  return async (
    ...args: Parameters<typeof sendWebSocketMessageImplementation>
  ): Promise<void> => {
    runSaga(sendWebSocketMessageImplementation, ...args).result();
  };
}

/**
 * Get a method that can be used to retrieve all connected WebSockets.
 *
 * @param runSaga - A function to run a saga outside the usual Redux flow.
 * @returns A method that returns all connected WebSocket connections.
 */
export function getGetWebSocketsImplementation(runSaga: RunSagaFunction) {
  return (): GetWebSocketsResult => {
    return runSaga(getWebSocketsImplementation).result() as GetWebSocketsResult;
  };
}
