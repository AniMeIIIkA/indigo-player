
import React, { memo } from 'react';
import { StateContext } from './State';
import { IInfo } from './types';

export function withState(WrappedComponent, mapProps: any = null) {
  const MemoizedWrappedComponent = memo(WrappedComponent);

  return class extends React.PureComponent {
    public render() {
      //@ts-ignore
      return <StateContext.Consumer>
        {(info) => {
          if (mapProps) {
            info = mapProps(info, this.props);
          } // This is temporary, once all components are integrated with mapProps, remove.
          return <MemoizedWrappedComponent {...this.props} {...info} />;
        }}
      </StateContext.Consumer>
    }
  };
}
