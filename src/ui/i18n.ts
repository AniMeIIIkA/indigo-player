// List of language codes: http://www.lingoes.net/en/translator/langcode.htm

export type Locale = 'en-US' | 'ru-RU' | 'nl-BE' | 'de-DE' | 'hi-IN' | 'mr-IN' | 'pt-BR';

export const translations = {
  'en-US': {
    Play: 'Play',
    Pause: 'Pause',
    Mute: 'Mute',
    Unmute: 'Unmute',
    Miniplayer: 'Miniplayer',
    'Seek to backward': 'Seek to backward',
    'Seek to forward': 'Seek to forward',
    Settings: 'Settings',
    'Full screen': 'Full screen',
    'Exit full screen': 'Exit full screen',
    Speed: 'Speed',
    'Normal speed': 'Normal',
    Subtitles: 'Subtitles',
    'No subtitles': 'None',
    Quality: 'Quality',
    'Automatic quality': 'Auto',
    'Enable subtitles': 'Enable subtitles',
    'Disable subtitles': 'Disable subtitles',
    'Uh oh!': 'Uh oh!',
    'Something went wrong': 'Something went wrong',
    'Processing': 'Video processing is still ongoing',
  },
  'ru-RU': {
    Play: 'Смотреть',
    Pause: 'Пауза',
    Mute: 'Отключить звук',
    Unmute: 'Включить звук',
    Miniplayer: 'Мини-проигрыватель',
    'Seek to backward': 'Перейти назад',
    'Seek to forward': 'Перейти вперед',
    Settings: 'Настройки',
    'Full screen': 'На полный экран',
    'Exit full screen': 'Выход из полноэкранного режима',
    Speed: 'Скорость',
    'Normal speed': 'Обычная',
    Subtitles: 'Субтитры',
    'No subtitles': 'Без субтитров',
    Quality: 'Качество',
    'Automatic quality': 'Автонастройка',
    'Enable subtitles': 'Включить субтитры',
    'Disable subtitles': 'Выключить субтитры',
    'Uh oh!': 'Упс!',
    'Something went wrong': 'Что-то пошло не так',
    'Processing': 'Обработка видео еще продолжается',
  },
  'nl-BE': {
    Play: 'Afspelen',
    Pause: 'Pauzeren',
    Mute: 'Dempen',
    Unmute: 'Unmute',
    Miniplayer: 'Mini speler',
    'Seek to backward': 'Zoek achteruit',
    'Seek to forward': 'Probeer vooruit te spoelen',
    Settings: 'Instellingen',
    'Full screen': 'Volledig scherm',
    'Exit full screen': 'Volledig scherm afsluiten',
    Speed: 'Snelheid',
    'Normal speed': 'Normale snelheid',
    Subtitles: 'Ondertitels',
    'No subtitles': 'Geen',
    Quality: 'Kwaliteit',
    'Automatic quality': 'Automatisch',
    'Enable subtitles': 'Ondertitels aan',
    'Disable subtitles': 'Ondertitels uit',
    'Uh oh!': 'Oh Oh!',
    'Something went wrong': 'Er is iets fout gegaan',
    'Processing': 'Verwerken',
  },
  'de-DE': {
    Play: 'Wiedergabe',
    Pause: 'Pause',
    Mute: 'Stummschalten',
    Unmute: 'Stummschaltung aufheben',
    Miniplayer: 'Miniplayer',
    'Seek to backward': 'Suche nach rückwärts',
    'Seek to forward': 'Versuchen Sie weiterzuleiten',
    Settings: 'Einstellungen',
    'Full screen': 'Vollbild',
    'Exit full screen': 'Vollbildmodus verlassen',
    Speed: 'Geschwindigkeit',
    'Normal speed': 'Normal',
    Subtitles: 'Untertitel',
    'No subtitles': 'Aus',
    Quality: 'Qualität',
    'Automatic quality': 'Automatisch',
    'Enable subtitles': 'Untertitel an',
    'Disable subtitles': 'Untertitel aus',
    'Uh oh!': 'Oh oh!',
    'Something went wrong': 'Etwas ist schief gelaufen',
    'Processing': 'Wird bearbeitet',
  },
  'hi-IN': {
    Play: 'चलाएँ',
    Pause: 'रोकें',
    Mute: 'ध्वनि बंद करें',
    Unmute: 'ध्वनि शुरू करें',
    Miniplayer: 'लघु संस्करण',
    'Seek to backward': 'पिछड़ों की तलाश करो',
    'Seek to forward': 'आगे की तलाश करो',
    Settings: 'नियंत्रण',
    'Full screen': 'पूर्ण संस्करण',
    'Exit full screen': 'पूर्ण संस्करण से बाहर निकलें',
    Speed: 'गति',
    'Normal speed': 'सामान्य',
    Subtitles: 'उपशीर्षक',
    'No subtitles': 'उपशीर्षक उपलब्ध नहीं है',
    Quality: 'गुणवत्ता',
    'Automatic quality': 'स्वचालित',
    'Enable subtitles': 'उपशीर्षक जारी रखें',
    'Disable subtitles': 'उपशीर्षक बंद करें',
    'Uh oh!': 'उह ओह!',
    'Something went wrong': 'कुछ गलत हो गया',
    'Processing': 'प्रसंस्करण',
  },
  'mr-IN': {
    Play: 'चालू करा',
    Pause: 'थांबवा',
    Mute: 'आवाज बंद करा ',
    Unmute: 'आवाज सुरू करा',
    Miniplayer: 'लघु आवृत्ती',
    'Seek to backward': 'मागासकडे जा',
    'Seek to forward': 'अग्रेषित करा',
    Settings: 'नियंत्रणे',
    'Full screen': 'पूर्ण आवृत्ती',
    'Exit full screen': 'पूर्ण आवृत्तीतून बाहेर पडा',
    Speed: 'गति',
    'Normal speed': 'सामान्य',
    Subtitles: 'उपशीर्षके',
    'No subtitles': 'उपशीर्षके उपलब्ध नाहीत',
    Quality: 'गुणवत्ता',
    'Automatic quality': 'स्वयंचलित',
    'Enable subtitles': 'उपशीर्षके सूरू करा',
    'Disable subtitles': 'उपशीर्षके बंद करा',
    'Uh oh!': 'ओहो!',
    'Something went wrong': 'काहीतरी चूक झाली',
    'Processing': 'प्रक्रिया करीत आहे',
  },
  'pt-BR': {
    Play: 'Reproduzir',
    Pause: 'Pausa',
    Mute: 'Mudo',
    Unmute: 'Ativar som',
    Miniplayer: 'Miniatura',
    'Seek to backward': 'Procure para trás',
    'Seek to forward': 'Procure encaminhar',
    Settings: 'Configurações',
    'Full screen': 'Tela cheia',
    'Exit full screen': 'Sair da tela cheia',
    Speed: 'Velocidade',
    'Normal speed': 'Normal',
    Subtitles: 'Legenda',
    'No subtitles': 'Sem legenda',
    Quality: 'Qualidade',
    'Automatic quality': 'Automática',
    'Enable subtitles': 'Habilitar legenda',
    'Disable subtitles': 'Desabilitar legenda',
    'Uh oh!': 'Uh oh!',
    'Something went wrong': 'Algo deu errado',
    'Processing': 'Em processamento',
  },
};

export const getTranslation = (languageCode: Locale) => text => {
  if (translations[languageCode] && translations[languageCode][text]) {
    return translations[languageCode][text];
  }
  return text;
};
