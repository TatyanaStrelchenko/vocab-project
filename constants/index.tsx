import {
  WordType,
  Wordlist,
  UserData,
  Range,
  DEFAULT_SETTINGS,
  Language,
  texts,
} from '@vocab/shared';

export const WORDS_SEARCH_FIELDS = ['en', 'de', 'ru', 'hint', 'state'];
export const PUBLIC_WORDLISTS_SEARCH_FIELDS = [
  'name',
  'userName',
  'lastPublishedDate',
];
export const PRIVATE_WORDLISTS_SEARCH_FIELDS = [
  'name',
  'privacyType',
  'lastPublishedDate',
];
export const USERS_SEARCH_FIELDS = ['_id', 'email', 'name', 'role'];

export const ASSETS_URL = `${window.location.origin}/assets/`;
export const IMAGE_HOLDER = `${ASSETS_URL}imageholder.jpg`;

export const STATES = {
  'to distribute': 'secondary',
  'to learn': 'warning',
  'to repeat': 'info',
  learned: 'success',
};

export const LANGUAGE_NAMES = {
  ru: 'Russian',
  en: 'English',
  de: 'German',
};

export const INTERFACE_LANGUAGE_NAMES = {
  ru: 'Русский',
  en: 'English',
  de: 'Deutsch',
};

export const GERMAN_LANGUAGE_SHORT_CODE = 'de';

export const INTERFACE_LANGUAGE_HINTS = {
  ru: 'Пожалуйста, выберите нужный язык интерфейса.',
  en: 'Please select the desired interface language.',
  de: 'Bitte wählen Sie die gewünschte Schnittstellensprache.',
};

export const VOICES = {
  en: 'Google US English',
  ru: 'Google русский',
  de: 'Google Deutsch',
};

export const SYNONYMS_MODE = {
  true: 'enabled',
  false: 'disabled',
};

export const SPEECH_RATE: Range = {
  min: 0.1,
  max: 2,
  normal: DEFAULT_SETTINGS.speechRate,
  step: 0.1,
  divider: 0.01,
};

export const SPEECH_VOLUME: Range = {
  min: 0,
  max: 1,
  normal: DEFAULT_SETTINGS.speechVolume,
  step: 0.2,
  divider: 0.01,
};

export const SPEECH_PITCH: Range = {
  min: 0.2,
  max: 2,
  normal: DEFAULT_SETTINGS.speechPitch,
  step: 0.2,
  divider: 0.01,
};

export const TIME_ALERT: Range = {
  min: 2000,
  max: 20000,
  normal: DEFAULT_SETTINGS.timeForTheAlertMessage,
  step: 1000,
  divider: 1000,
};

export const TIME_EXERCISES: Range = {
  min: 2000,
  max: 20000,
  normal: DEFAULT_SETTINGS.minTimeForExercises,
  step: 1000,
  divider: 1000,
};

export const LEARN_BATCH_SIZE: Range = {
  min: 2,
  max: 500,
  normal: DEFAULT_SETTINGS.learnBatchSize,
  step: 1,
  divider: 1,
};

export const DICTIONARY_WORDS_PER_PAGE: Range = {
  min: 5,
  max: 500,
  normal: DEFAULT_SETTINGS.dictionaryWordsPerPage,
  step: 5,
  divider: 1,
};

export const NUMBER_OF_ATTEMPTS_TO_SKIP: Range = {
  min: 1,
  max: 9,
  normal: DEFAULT_SETTINGS.numberOfAttemptsToSkip,
  step: 1,
  divider: 1,
};

export interface ExercisesObject {
  name: string;
  path: string;
}

export const getExercisesList = (
  helpLanguage: Language,
  learnLanguage: Language,
  interfaceLanguage: Language,
): Array<ExercisesObject> => {
  const learnLang =
    texts[interfaceLanguage].constants.languageNames[learnLanguage];
  const helpLang =
    texts[interfaceLanguage].constants.languageNames[helpLanguage];
  return [
    {
      name: `${texts[interfaceLanguage].constants.exercises.voice_txt} (${learnLang})`,
      path: '/voice_txt',
    },
    {
      name: `${texts[interfaceLanguage].constants.exercises.txt_voice} (${learnLang})`,
      path: '/txt_voice',
    },
    {
      name: `${learnLang} ${texts[interfaceLanguage].constants.exercises.txt_help} → ${helpLang}`,
      path: '/txt_help',
    },
    {
      name: `${learnLang} ${texts[interfaceLanguage].constants.exercises.voice_help} → ${helpLang}`,
      path: '/voice_help',
    },
    {
      name: `${helpLang} → ${learnLang} ${texts[interfaceLanguage].constants.exercises.help_txt}`,
      path: '/help_txt',
    },
    {
      name: `${helpLang} → ${learnLang} ${texts[interfaceLanguage].constants.exercises.help_voice}`,
      path: '/help_voice',
    },
    {
      name: `${learnLang} → ${texts[interfaceLanguage].constants.exercises.learn_img}`,
      path: '/learn_img',
    },
    {
      name: `${texts[interfaceLanguage].constants.exercises.img_learn} → ${learnLang}`,
      path: '/img_learn',
    },
  ];
};

export type WordField = keyof WordType;

export interface ColumnNames {
  name: WordField;
  label: string;
}

export const WORDS_COLUMNS: ColumnNames[] = [
  {
    name: 'en',
    label: 'English',
  },
  {
    name: 'ru',
    label: 'Russian',
  },
  {
    name: 'de',
    label: 'Deutsch',
  },
  {
    name: 'hint',
    label: 'Hint',
  },
  {
    name: 'img',
    label: 'Images',
  },
  {
    name: 'state',
    label: 'State',
  },
];

export type WordlistField = keyof Wordlist;

export type ExerciseType =
  | 'txt_help'
  | 'voice_help'
  | 'learn_img'
  | 'img_learn'
  | 'help_voice'
  | 'help_txt'
  | 'voice_txt'
  | 'txt_voice';

export const EXERCISES: ExerciseType[] = [
  'txt_help',
  'voice_help',
  'learn_img',
  'img_learn',
  'help_voice',
  'help_txt',
  'voice_txt',
  'txt_voice',
];

export const VOICE_INPUT_EXERCISES: ExerciseType[] = [
  'help_voice',
  'voice_help',
  'txt_voice',
  'txt_help',
];

export type ExerciseMode = 'to learn' | 'to repeat';

export const SOCIALS_ERROR_MESSAGE = `Social account wasn't found, or email is already in use`;

export const ADD_EDIT_ERROR_MESSAGES = {
  atLeastTwoOutOfThreeWordsRequired:
    'The word should be presented at least in two languages.',
  emptyImage: 'Image can`t be empty.',
  fileSize: 'The size of the file is too big. It should be less than 10Mb.',
  load: 'Load error. Please try again.',
  onlyCertainCharacters:
    'Please use specific characters for a certain language.',
};

export const WORDLISTS_MESSAGES = {
  invalidName: 'Name should have at least 1 character (max 20).',
};

export enum BootstrapSize {
  SM = 'sm',
  MD = 'md',
  LG = 'lg',
  XL = 'xl',
}

export const AVATAR_REDIRECT_URL_LINK = 'https://avatar-redirect.appspot.com';

export const SCROLL_OFFSET = 100;
export const SCROLL_DEBOUNCE_TIME = 300;

export const RANDOM_WORDS_NUMBER = 3;

export const blankUser: UserData = {
  _id: '',
  name: '',
  email: '',
  password: '',
  role: 'student',
  isConfirmed: false,
  settings: DEFAULT_SETTINGS,
  oauth: {
    googleId: '',
    facebookId: '',
  },
};

export const ENGLISH_ARTICLES = ['to', 'an', 'a', 'the'];

export const GERMAN_ARTICLES = ['die', 'der', 'das'];
