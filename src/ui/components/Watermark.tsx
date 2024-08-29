import React, { useEffect, useState } from 'react';
import { IInfo } from '../types';
import { withState } from '../withState';
import { WatermarkConfig, WatermarkPlacement } from '../../types';


const placements: WatermarkPlacement[] = ['bottomCenter', 'bottomLeft', 'bottomRight', 'center', 'leftCenter', 'rightCenter', 'topCenter', 'topLeft', 'topRight'];

interface WatermarkProps {
  config: WatermarkConfig;
  playRequested: boolean;
}
export const Watermark = withState(({ config, playRequested }: WatermarkProps) => {
  const [showWatermark, setShowWatermark] = useState<boolean>(false);
  const [currentPlacement, setCurrentPlacement] = useState<WatermarkPlacement>(
    config.mode == 'constant' ? config.constantPlacement : 'bottomRight'
  );

  const getRandomPlacement = (): WatermarkPlacement => {
    const randomIndex = Math.floor(Math.random() * placements.length);
    return placements[randomIndex];
  };

  useEffect(() => {
    if (!playRequested) return;
    let intervalId: NodeJS.Timeout;
    let timeoutId: NodeJS.Timeout;

    if (config.mode === 'frequency') {
      intervalId = setInterval(() => {
        setShowWatermark(true);
        setCurrentPlacement(getRandomPlacement());

        // Display watermark for 500 ms
        timeoutId = setTimeout(() => {
          setShowWatermark(false);
        }, 500);
      }, (config.frequencyDelayInSec ?? 30) * 1000);
    } else if (config.mode === 'constant') {
      setShowWatermark(true);
      setCurrentPlacement(config.constantPlacement || 'bottomRight');
    }

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
      setShowWatermark(false);
    };
  }, [config.mode, config.frequencyDelayInSec, playRequested]);

  return (
    showWatermark &&
    <div className={'igui_watermark'} data-placement={currentPlacement}>
      {config.data}
    </div>
  );
}, mapProps);

function mapProps(info: IInfo): WatermarkProps {
  return {
    config: info.data.watermark,
    playRequested: info.data.playRequested
  };
}
