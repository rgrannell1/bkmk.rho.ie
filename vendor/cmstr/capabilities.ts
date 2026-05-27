// Stripped subset of cmstr storage capability types — only what the browser-side node and IDB backend need.

export type EventEntry = {
  id: number;
  createdAt: number;
  updatedAt: number;
  payload: unknown;
};

export type ReadEventOptions = {
  start?: number;
  size?: number;
  ids?: number[];
};

export type ObjectEntry = {
  id: string;
  seq: number;
  createdAt: number;
  updatedAt: number;
  payload: unknown;
};
