
import React, { RefObject } from 'react';
import * as ReactDOM from 'react-dom';
import { IInstance } from '../types';
import { Main } from './components/Main';
import { StateStore } from './State';
import { IStateStore } from './types';

export const render = (
  container: HTMLElement,
  state: any,
  instance: IInstance,
  ref: RefObject<IStateStore>
) => {
  ReactDOM.render(
    <StateStore instance={instance} player={state.state} ref={ref as any}>
      <Main />
    </StateStore>,
    container,
  );
};
