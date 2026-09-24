import cx from 'classnames';
import * as React from 'react';
import { SettingsTabs, IData, IActions } from '../types';
import { withState } from '../withState';
import { Button } from './Button';
import { Icon } from './Icon';

/**
 * The settings menu, laid out the way YouTube's is: a main panel of rows «icon · name · current value ›», each opening a panel of
 * choices with a back header and a check mark at the selected one. Picking a value returns to the main panel (the new value is
 * visible there) instead of closing the menu; subtitle style is under «Options» in the subtitles panel.
 */
const tabs = {};

const subtitleColorLabel = (color: string) => ({ white: 'White', yellow: 'Yellow', cyan: 'Cyan', green: 'Green' }[color] || 'White');

const PLAYBACK_RATES = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

const speedLabel = (props: SettingsProps, rate: number) =>
  rate === 1 ? props.data.getTranslation('Normal speed') : `${rate}`;

const qualityLabel = (height?: number | string) => (height ? `${height}p` : '');

tabs[SettingsTabs.OPTIONS] = (props: SettingsProps) => {
  const t = props.data.getTranslation;
  const rows: SettingsRowProps[] = [];

  if (props.data.visibleSettingsTabs.includes(SettingsTabs.SUBTITLES)) {
    rows.push({
      icon: 'cc',
      label: t('Subtitles'),
      value: props.data.activeSubtitle ? props.data.activeSubtitle.label : t('Off'),
      onClick: () => props.actions.setSettingsTab(SettingsTabs.SUBTITLES),
    });
  }

  if (props.data.visibleSettingsTabs.includes(SettingsTabs.PLAYBACKRATES)) {
    rows.push({
      icon: 'speed',
      label: t('Playback speed'),
      value: speedLabel(props, props.data.playbackRate || 1),
      onClick: () => props.actions.setSettingsTab(SettingsTabs.PLAYBACKRATES),
    });
  }

  if (props.data.visibleSettingsTabs.includes(SettingsTabs.TRACKS)) {
    const active = props.data.activeTrack ? qualityLabel(props.data.activeTrack.height) : '';
    rows.push({
      icon: 'quality',
      label: t('Quality'),
      value: props.data.selectedTrack === 'auto'
        ? `${t('Automatic quality')}${active ? ` (${active})` : ''}`
        : active,
      onClick: () => props.actions.setSettingsTab(SettingsTabs.TRACKS),
    });
  }

  if (!rows.length) {
    return <div className="igui_settings_nooptions">{t('No settings available')}</div>;
  }

  return (
    <div className="igui_settings_panel">
      {rows.map(row => <SettingsRow key={row.label} {...row} />)}
    </div>
  );
};

/** Colour, background and size of the subtitle text — each choice applies at once and the panel stays open. */
tabs[SettingsTabs.SUBTITLE_STYLE] = (props: SettingsProps) => {
  const t = props.data.getTranslation;
  const style = props.data.subtitleStyle || { color: 'white', background: 'shadow', size: 'normal' };
  return (
    <div className="igui_settings_panel">
      <SettingsHeader
        title={t('Subtitle style')}
        backLabel={t('Back')}
        onBackClick={() => props.actions.setSettingsTab(SettingsTabs.SUBTITLES)}
      />
      <div className="igui_settings_scroll">
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
      </div>
    </div>
  );
};

tabs[SettingsTabs.TRACKS] = (props: SettingsProps) => {
  const t = props.data.getTranslation;
  const active = props.data.activeTrack ? qualityLabel(props.data.activeTrack.height) : '';
  return (
    <div className="igui_settings_panel">
      <SettingsHeader
        title={t('Quality')}
        backLabel={t('Back')}
        onBackClick={() => props.actions.setSettingsTab(SettingsTabs.OPTIONS)}
      />
      <div className="igui_settings_scroll">
        <SettingsSelect
          selected={props.data.selectedTrack}
          onClick={track => {
            props.actions.selectTrack(track);
            props.actions.setSettingsTab(SettingsTabs.OPTIONS);
          }}
          items={[
            ...props.data.tracks.map(track => ({
              item: track,
              label: qualityLabel(track.height),
              badge: Number(track.height) >= 720 ? 'HD' : undefined,
            })),
            {
              item: 'auto',
              label: `${t('Automatic quality')}${props.data.selectedTrack === 'auto' && active ? ` (${active})` : ''}`,
            },
          ]}
        />
      </div>
    </div>
  );
};

tabs[SettingsTabs.SUBTITLES] = (props: SettingsProps) => {
  const t = props.data.getTranslation;
  return (
    <div className="igui_settings_panel">
      <SettingsHeader
        title={t('Subtitles')}
        backLabel={t('Back')}
        onBackClick={() => props.actions.setSettingsTab(SettingsTabs.OPTIONS)}
        optionsLabel={props.data.visibleSettingsTabs.includes(SettingsTabs.SUBTITLE_STYLE) ? t('Options') : undefined}
        onOptionsClick={() => props.actions.setSettingsTab(SettingsTabs.SUBTITLE_STYLE)}
      />
      <div className="igui_settings_scroll">
        <SettingsSelect
          selected={props.data.activeSubtitle}
          onClick={subtitle => {
            props.actions.selectSubtitle(subtitle);
            props.actions.setSettingsTab(SettingsTabs.OPTIONS);
          }}
          items={[
            {
              item: null,
              label: t('Off'),
            },
            ...props.data.subtitles.map(subtitle => ({
              item: subtitle,
              label: subtitle.label,
            })),
          ]}
        />
      </div>
    </div>
  );
};

tabs[SettingsTabs.PLAYBACKRATES] = (props: SettingsProps) => (
  <div className="igui_settings_panel">
    <SettingsHeader
      title={props.data.getTranslation('Playback speed')}
      backLabel={props.data.getTranslation('Back')}
      onBackClick={() => props.actions.setSettingsTab(SettingsTabs.OPTIONS)}
    />
    <div className="igui_settings_scroll">
      <SettingsSelect
        selected={props.data.playbackRate || 1}
        onClick={playbackRate => {
          props.actions.setPlaybackRate(playbackRate);
          props.actions.setSettingsTab(SettingsTabs.OPTIONS);
        }}
        items={PLAYBACK_RATES.map(rate => ({ item: rate, label: speedLabel(props, rate) }))}
      />
    </div>
  </div>
);

interface SettingsRowProps {
  icon: string;
  label: string;
  value?: string;
  onClick();
}

const SettingsRow = (props: SettingsRowProps) => (
  <button type="button" className="igui_settings_row" onClick={props.onClick}>
    <span className="igui_settings_row_icon"><Icon icon={props.icon} /></span>
    <span className="igui_settings_row_label">{props.label}</span>
    <span className="igui_settings_row_value">{props.value}</span>
    <span className="igui_settings_row_chevron" aria-hidden="true">›</span>
  </button>
);

interface SettingsHeaderProps {
  title: string;
  backLabel: string;
  optionsLabel?: string;
  onBackClick();
  onOptionsClick?();
}

const SettingsHeader = (props: SettingsHeaderProps) => (
  <div className="igui_settings_header">
    <button type="button" className="igui_settings_header_back" onClick={props.onBackClick} aria-label={props.backLabel}>
      <span className="igui_settings_header_chevron" aria-hidden="true">‹</span>
      <span>{props.title}</span>
    </button>
    {!!props.optionsLabel && !!props.onOptionsClick && (
      <button type="button" className="igui_settings_header_options" onClick={props.onOptionsClick}>
        {props.optionsLabel}
      </button>
    )}
  </div>
);

interface SettingsSelectProps {
  selected?: any;
  items: Array<{
    item: any;
    label: string;
    badge?: string;
  }>;
  onClick(item: any);
}

const SettingsSelect = (props: SettingsSelectProps) => (
  <div className="igui_settings_select" role="menu">
    {props.items.map(item => {
      const selected = item.item === props.selected;
      return (
        <button
          type="button"
          role="menuitemradio"
          aria-checked={selected}
          key={item.label}
          className={cx('igui_settings_option', { 'igui_settings_option-selected': selected })}
          onClick={() => props.onClick(item.item)}
        >
          <span className="igui_settings_option_check">{selected && <Icon icon="check" />}</span>
          <span className="igui_settings_option_label">{item.label}</span>
          {!!item.badge && <span className="igui_settings_option_badge">{item.badge}</span>}
        </button>
      );
    })}
  </div>
);

interface SettingsProps {
  data: IData;
  actions: IActions;
}

export const Settings = withState((props: SettingsProps) => {
  const renderTab = tabs[props.data.settingsTab];
  return renderTab ? (
    <div className={cx('igui_settings', { 'igui_settings-mobile': props.data.isMobile })}>
      {props.data.isMobile && (
        <Button name="mobile-close" onClick={props.actions.toggleSettings}>
          &times;
        </Button>
      )}
      {renderTab(props)}
    </div>
  ) : null;
});
