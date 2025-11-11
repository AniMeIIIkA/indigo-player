
import React, { RefObject } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { IInstance } from '../types/IInstance';
import { Main } from './components/Main';
import { StateStore } from './State';
import { IStateStore } from './types';

let root: Root | null = null;

export const render = (
  container: HTMLElement,
  state: any,
  instance: IInstance,
  ref: RefObject<IStateStore>
) => {
  if (!root) {
    root = createRoot(container);
  }
  root.render(
    <StateStore instance={instance} player={state.state} ref={ref as any}>
      <Main />
    </StateStore>
  );
};
