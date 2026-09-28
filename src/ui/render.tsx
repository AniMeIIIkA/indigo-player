import React, { RefObject } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IInstance } from '../types/IInstance';
import { Main } from './components/Main';
import { StateStore } from './State';
import { IStateStore } from './types';

// One React root per UI container, i.e. per player. A single module-level root (as before 2026-09-27) belonged to the FIRST player
// of the page: every later one — a player re-created for a new source, the next video in a single-page app — rendered its controls
// into that first, already destroyed container, and was left a black box without a poster or a play button.
const roots = new WeakMap<HTMLElement, Root>();

export const render = (
  container: HTMLElement,
  state: any,
  instance: IInstance,
  ref: RefObject<IStateStore>
) => {
  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }
  root.render(
    <StateStore instance={instance} player={state.state} ref={ref as any}>
      <Main />
    </StateStore>
  );
};

/**
 * Tears the player's UI down. Deferred: a player is usually destroyed from a host framework's own cleanup (a React effect), and
 * unmounting another root synchronously in the middle of that commit is refused with a warning.
 */
export const unmount = (container: HTMLElement) => {
  const root = roots.get(container);
  if (!root) {
    return;
  }
  roots.delete(container);
  setTimeout(() => root.unmount(), 0);
};
