
import * as React from 'react';
import { SettingsTabs, IData, IActions } from '../types';
import { withState } from '../withState';
import { Button } from './Button';

const tabs = {};

tabs[SettingsTabs.OPTIONS] = (props: SettingsProps) => {
  const items: {
    item: any;
    label: string;
    info?: string | undefined;
  }[] = [];

  if (props.data.visibleSettingsTabs.includes(SettingsTabs.TRACKS)) {
    items.push({
      item: SettingsTabs.TRACKS,
      label: props.data.getTranslation('Quality'),
      info: `${props.data.activeTrack ? props.data.activeTrack.height : ''}`,
    });
  }

  if (props.data.visibleSettingsTabs.includes(SettingsTabs.SUBTITLES)) {
    items.push({
      item: SettingsTabs.SUBTITLES,
      label: props.data.getTranslation('Subtitles'),
      info: `${props.data.activeSubtitle ? props.data.activeSubtitle.label : ''}`,
    });
  }

  if (props.data.visibleSettingsTabs.includes(SettingsTabs.SUBTITLE_STYLE)) {
    items.push({
      item: SettingsTabs.SUBTITLE_STYLE,
      label: props.data.getTranslation('Subtitle style'),
      info: props.data.subtitleStyle ? props.data.getTranslation(subtitleColorLabel(props.data.subtitleStyle.color)) : '',
    });
  }

  if (props.data.visibleSettingsTabs.includes(SettingsTabs.PLAYBACKRATES)) {
    items.push({
      item: SettingsTabs.PLAYBACKRATES,
      label: props.data.getTranslation('Speed'),
      info: `${props.data.playbackRate ? props.data.playbackRate : ''}`,
    });

  }

  return <>
    {!!props.data.visibleSettingsTabs.length ? (
      <SettingsSelect
        onClick={props.actions.setSettingsTab}
        items={items}
      />
    ) : (
        <div className="igui_settings_nooptions">No settings available</div>
      )}
  </>
}

const subtitleColorLabel = (color: string) => ({ white: 'White', yellow: 'Yellow', cyan: 'Cyan', green: 'Green' }[color] || 'White');

/** Colour, background and size of the subtitle text — each row applies at once and the menu stays open so several can be changed. */
tabs[SettingsTabs.SUBTITLE_STYLE] = (props: SettingsProps) => {
  const t = props.data.getTranslation;
  const style = props.data.subtitleStyle || { color: 'white', background: 'shadow', size: 'normal' };
  return (
    <>
      <SettingsHeader
        title={t('Subtitle style')}
        onBackClick={() => props.actions.setSettingsTab(SettingsTabs.OPTIONS)}
      />
      <div className="igui_settings_group">{t('Color')}</div>
      <SettingsSelect
        selected={style.color}
        onClick={color => props.actions.setSubtitleStyle({ color })}
        items={['white', 'yellow', 'cyan', 'green'].map(color => ({ item: color, label: t(subtitleColorLabel(color)) }))}
      />
      <div className="igui_settings_group">{t('Background')}</div>
      <SettingsSelect
        selected={style.background}
        onClick={background => props.actions.setSubtitleStyle({ background })}
        items={[
          { item: 'shadow', label: t('Shadow') },
          { item: 'box', label: t('Box') },
          { item: 'none', label: t('No background') },
        ]}
      />
      <div className="igui_settings_group">{t('Size')}</div>
      <SettingsSelect
        selected={style.size}
        onClick={size => props.actions.setSubtitleStyle({ size })}
        items={[
          { item: 'normal', label: t('Normal') },
          { item: 'large', label: t('Large') },
        ]}
      />
    </>
  );
};

tabs[SettingsTabs.TRACKS] = (props: SettingsProps) => (
  <>
    <SettingsHeader
      title={props.data.getTranslation('Quality')}
      onBackClick={() => props.actions.setSettingsTab(SettingsTabs.OPTIONS)}
    />
    <SettingsSelect
      selected={props.data.selectedTrack}
      onClick={track => {
        props.actions.selectTrack(track);
        props.actions.toggleSettings();
      }}
      items={[
        ...props.data.tracks.map(track => ({
          item: track,
          label: `${track.height}`,
        })),
        {
          item: 'auto',
          label: props.data.getTranslation('Automatic quality'),
        },
      ]}
    />
  </>
);

tabs[SettingsTabs.SUBTITLES] = (props: SettingsProps) => (
  <>
    <SettingsHeader
      title={props.data.getTranslation('Subtitles')}
      onBackClick={() => props.actions.setSettingsTab(SettingsTabs.OPTIONS)}
    />
    <SettingsSelect
      selected={props.data.activeSubtitle}
      onClick={subtitle => {
        props.actions.selectSubtitle(subtitle);
        props.actions.toggleSettings();
      }}
      items={[
        ...props.data.subtitles.map(subtitle => ({
          item: subtitle,
          label: subtitle.label,
        })),
        {
          item: null,
          label: props.data.getTranslation('No subtitles'),
        },
      ]}
    />
  </>
);

tabs[SettingsTabs.PLAYBACKRATES] = (props: SettingsProps) => (
  <>
    <SettingsHeader
      title={props.data.getTranslation('Speed')}
      onBackClick={() => props.actions.setSettingsTab(SettingsTabs.OPTIONS)}
    />
    <SettingsSelect
      selected={props.data.playbackRate}
      onClick={playbackRate => {
        props.actions.setPlaybackRate(playbackRate);
        props.actions.toggleSettings();
      }}
      items={[
        {
          item: 0.25,
          label: '0.25',
        },
        {
          item: 0.5,
          label: '0.5',
        },
        {
          item: 0.75,
          label: '0.75',
        },
        {
          item: 1,
          label: props.data.getTranslation('Normal speed'),
        },
        {
          item: 1.25,
          label: '1.25',
        },
        {
          item: 1.5,
          label: '1.5',
        },
        {
          item: 1.75,
          label: '1.75',
        },
        {
          item: 2,
          label: '2',
        },
      ]}
    />
  </>
);

interface SettingsHeaderProps {
  title: string;
  onBackClick?();
  onOptionsClick?();
}

const SettingsHeader = (props: SettingsHeaderProps) => (
  <div className="igui_settings_header">
    {!!props.onBackClick && (
      <Button onClick={props.onBackClick} name="settings-back" icon="back" />
    )}
    {props.title}
    {!!props.onOptionsClick && (
      <Button onClick={props.onOptionsClick} name="settings-options">
        Options
      </Button>
    )}
  </div>
);

interface SettingsSelectProps {
  selected?: any;
  items: Array<{
    item: any;
    label: string;
    info?: string;
  }>;
  onClick(item: any);
}

const SettingsSelect = (props: SettingsSelectProps) => (
  <div className="igui_settings_select">
    {props.items.map(item => (
      <Button
        key={item.label}
        name="select-option"
        onClick={() => props.onClick(item.item)}
        active={item.item === props.selected}
      >
        <>
          {item.label}
          {item.info && (
            <span className="igui_settings_select_option_info">
              {item.info}
            </span>
          )}
        </>
      </Button>
    ))}
  </div>
);

interface SettingsProps {
  data: IData;
  actions: IActions;
}

export const Settings = withState((props: SettingsProps) => {
  const renderTab = tabs[props.data.settingsTab];
  return renderTab ? (
    <div className="igui_settings">
      {props.data.isMobile && (
        <Button name="mobile-close" onClick={props.actions.toggleSettings}>
          &times;
        </Button>
      )}
      {renderTab(props)}
    </div>
  ) : null;
});
