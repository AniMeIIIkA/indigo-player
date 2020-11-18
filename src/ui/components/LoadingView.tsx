import React from "react";
import { IInfo } from "../types";
import { withState } from "../withState";
import { Spinner } from "./Spinner";

interface LoadingViewProps {
  image: string;
}

export const LoadingView = withState((props: LoadingViewProps) => {
  return (
    <div className='igui_view_loading'>
      {!!props.image && (
        <div
          className='igui_image'
          style={{ backgroundImage: `url(${props.image})` }}
        />
      )}
      <Spinner />
    </div>
  );
}, mapProps);

function mapProps(info: IInfo): LoadingViewProps {
  return {
    image: info.data.image,
  };
}
