
import { isString } from 'lodash';
import * as React from 'react';
import { IPlayerError } from '../../types';
import { IInfo } from '../types';
import { withState } from '../withState';
interface ErrorViewProps {
  error: IPlayerError;
  getTranslation(text: string): string;
}

export const ErrorView = withState((props: ErrorViewProps) => {
  const title = props.getTranslation('Uh oh!');
  let message = props.getTranslation('Something went wrong');

  if (isString(props.error?.underlyingError)) {
    message = props.error.underlyingError;
  }
  if (props.error?.underlyingError == null && props.error?.code) {
    message += ` (${props.error.code})`;
  }

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
    getTranslation: info.data.getTranslation
  };
}
