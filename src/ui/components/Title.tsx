import React from 'react';
import { IInfo } from '../types';
import { withState } from '../withState';

interface TitleProps {
  title: string;
}

export const Title = withState((props: TitleProps) => {
  if (props.title)
    return (
      <div
        className={'igui_title'}
      >
        {props.title}
      </div>
    );
  return null;
}, mapProps);

function mapProps(info: IInfo): TitleProps {
  return {
    title: info.data.title,
  };
}
