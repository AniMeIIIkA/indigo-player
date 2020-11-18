import React from "react";
import { IInfo } from "../types";
import { withState } from "../withState";
import { Icon } from "./Icon";


interface StartViewProps {
  image: string;
  playOrPause();
}

export const StartView = withState((props: StartViewProps) => {
  return (
    <button
      type='button'
      className='igui_view_start'
      onClick={props.playOrPause}
    >
      {!!props.image && (
        <div
          className='igui_image'
          style={{ backgroundImage: `url(${props.image})` }}
        />
      )}
      <Icon icon='play' />
    </button>
  );
}, mapProps);

function mapProps(info: IInfo): StartViewProps {
  return {
    playOrPause: info.actions.playOrPause,
    image: info.data.image,
  };
}
