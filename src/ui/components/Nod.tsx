
import cx from 'classnames';
import React from 'react';
import { IInfo } from '../types';
import { withState } from '../withState';
import { Icon } from './Icon';

interface NodProps {
  icon: string;
}

export const Nod = withState((props: NodProps) => {
  return (
    <div
      className={cx('igui_nod', {
        'igui_nod-active': !!props.icon,
      })}
    >
      <Icon icon={props.icon} />
    </div>
  );
}, mapProps);

function mapProps(info: IInfo): NodProps {
  return {
    icon: info.data.nodIcon,
  };
}
