
import * as React from 'react';
import { IPlayerError } from '../../types';
import { IInfo } from '../types';
import { withState } from '../withState';

interface ErrorViewProps {
  error: IPlayerError;
}

export const ErrorView = withState((props: ErrorViewProps) => {
  const title = 'Uh oh!';
  const message = `Something went wrong (${props.error.code})`;
  return (
    <div className='igui_view_error'>
      <div>
        <div data-text={title} className='igui_view_error-title'>
          {title}
        </div>
        <div>{message}</div>
      </div>
    </div>
  );
}, mapProps);

function mapProps(info: IInfo): ErrorViewProps {
  return {
    error: info.data.error as IPlayerError,
  };
}
