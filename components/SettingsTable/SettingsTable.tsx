import React, { useState } from 'react';
import { Table, Button } from 'reactstrap';
import { AiOutlineSetting } from 'react-icons/ai';
import {
  SettingsForUpdate,
  Settings,
  Range,
  DEFAULT_SETTINGS,
  texts,
} from '@vocab/shared';
import {
  BootstrapSize,
  LANGUAGE_NAMES,
  SYNONYMS_MODE,
  SPEECH_RATE,
  SPEECH_VOLUME,
  SPEECH_PITCH,
  TIME_ALERT,
  TIME_EXERCISES,
  LEARN_BATCH_SIZE,
  DICTIONARY_WORDS_PER_PAGE,
  NUMBER_OF_ATTEMPTS_TO_SKIP,
} from '../../constants';
import { ModalWindow } from '../ModalWindow';
import { SpeechSynthesis } from '../../services/speech-synthesis-service';
import { SettingForm } from './settingForm';
import styles from './styles.module.scss';

const defaultSettings: Settings = {
  ...DEFAULT_SETTINGS,
};

export interface SettingsItem {
  isList: boolean;
  tag: string;
  name: string;
  value: string | number | undefined;
  options: Range | typeof LANGUAGE_NAMES | typeof SYNONYMS_MODE | string[];
  optionsType: string;
}

interface Props {
  settings: Settings;
  updateSettings: (settings: SettingsForUpdate) => Promise<void>;
}

export const SettingsTable = (props: Props) => {
  const { settings, updateSettings } = props;
  const {
    allSynonymsRequired,
    dictionaryWordsPerPage,
    helpLanguage,
    helpLanguageVoice,
    interfaceLanguage,
    learnBatchSize,
    learnLanguage,
    learnLanguageVoice,
    minTimeForExercises,
    numberOfAttemptsToSkip,
    speechPitch,
    speechRate,
    speechVolume,
    timeForTheAlertMessage,
  } = settings;

  const [itemSetting, setItemSetting] = useState<SettingsForUpdate>({});
  const [isEditShownModal, setIsEditShownModal] = useState(false);
  const [isShownConfirmModal, setIsShownConfirmModal] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [modalContent, setModalContent] = useState<React.ReactNode>('');
  const [modalSize, setModalSize] = useState<BootstrapSize>(BootstrapSize.SM);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(
    null,
  );
  const speechSynthesisService = new SpeechSynthesis(settings);

  const showModal = (
    item: SettingsItem,
    size: BootstrapSize = BootstrapSize.SM,
  ) => {
    setModalTitle(
      `${texts[interfaceLanguage].components.settingsTable.set} ${item.name}`,
    );
    setModalContent(<SettingForm info={item} setSetting={setItemSetting} />);
    setModalSize(size);
    setIsEditShownModal(true);
  };

  const handleCancel = () => {
    setIsEditShownModal(false);
    setIsShownConfirmModal(false);
    setModalErrorMessage(null);
  };

  const handleConfirm = async () => {
    try {
      if (Object.keys(itemSetting).length > 0 && isEditShownModal) {
        await updateSettings(itemSetting);
      } else {
        await updateSettings(defaultSettings);
      }
      setIsEditShownModal(false);
      setIsShownConfirmModal(false);
      setModalErrorMessage(null);
    } catch (error) {
      if (error.response && error.response.data) {
        setModalErrorMessage(error.response.data);
      } else {
        setModalErrorMessage(
          texts[interfaceLanguage].components.settingsTable.somethingWentWrong,
        );
      }
    }
  };

  const languageVoices = (language: string) => {
    const voices = speechSynthesisService
      .getVoices(language)
      .map((item) => item.voiceURI);
    return voices;
  };

  const toRoundValues = (object: Range) => {
    const { min, max, step, divider, normal } = object;
    const toRound = (value: number) => value / divider;
    return {
      divider,
      min: toRound(min),
      max: toRound(max),
      step: toRound(step),
      normal: toRound(normal),
    };
  };

  return (
    <>
      <Table className={styles.table} hover>
        <tbody>
          <tr>
            <th scope="row">
              {
                texts[interfaceLanguage].components.settingsTable
                  .interfaceLanguage
              }
            </th>
            <td>
              {
                texts[interfaceLanguage].constants.languageNames[
                  interfaceLanguage
                ]
              }
            </td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal({
                    isList: true,
                    tag: 'interfaceLanguage',
                    name:
                      texts[interfaceLanguage].components.settingsTable
                        .interfaceLanguage,
                    value: interfaceLanguage,
                    options: texts[interfaceLanguage].constants.languageNames,
                    optionsType: '',
                  })
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {texts[interfaceLanguage].components.settingsTable.helpLanguage}
            </th>
            <td>
              {texts[interfaceLanguage].constants.languageNames[helpLanguage]}
            </td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal({
                    isList: true,
                    tag: 'helpLanguage',
                    name:
                      texts[interfaceLanguage].components.settingsTable
                        .helpLanguage,
                    value: helpLanguage,
                    options: texts[interfaceLanguage].constants.languageNames,
                    optionsType: '',
                  })
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {texts[interfaceLanguage].components.settingsTable.learnLanguage}
            </th>
            <td>
              {texts[interfaceLanguage].constants.languageNames[learnLanguage]}
            </td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal({
                    isList: true,
                    tag: 'learnLanguage',
                    name:
                      texts[interfaceLanguage].components.settingsTable
                        .learnLanguage,
                    value: learnLanguage,
                    options: texts[interfaceLanguage].constants.languageNames,
                    optionsType: '',
                  })
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {
                texts[interfaceLanguage].components.settingsTable
                  .helpLanguageVoice
              }
            </th>
            <td>
              {helpLanguageVoice === 'Default'
                ? texts[interfaceLanguage].components.settingsTable.default
                : helpLanguageVoice}
            </td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal(
                    {
                      isList: true,
                      tag: 'helpLanguageVoice',
                      name:
                        texts[interfaceLanguage].components.settingsTable
                          .helpLanguageVoice,
                      value: helpLanguageVoice,
                      options: languageVoices(helpLanguage),
                      optionsType: '',
                    },
                    BootstrapSize.MD,
                  )
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {
                texts[interfaceLanguage].components.settingsTable
                  .learnLanguageVoice
              }
            </th>
            <td>
              {learnLanguageVoice === 'Default'
                ? texts[interfaceLanguage].components.settingsTable.default
                : learnLanguageVoice}
            </td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal(
                    {
                      isList: true,
                      tag: 'learnLanguageVoice',
                      name:
                        texts[interfaceLanguage].components.settingsTable
                          .learnLanguageVoice,
                      value: learnLanguageVoice,
                      options: languageVoices(learnLanguage),
                      optionsType: '',
                    },
                    BootstrapSize.MD,
                  )
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {texts[interfaceLanguage].components.settingsTable.speechVolume}
            </th>
            <td>{speechVolume / SPEECH_VOLUME.divider}%</td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal({
                    isList: false,
                    tag: 'speechVolume',
                    name:
                      texts[interfaceLanguage].components.settingsTable
                        .speechVolume,
                    value: speechVolume / SPEECH_VOLUME.divider,
                    options: toRoundValues(SPEECH_VOLUME),
                    optionsType: '%',
                  })
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {texts[interfaceLanguage].components.settingsTable.speechRate}
            </th>
            <td>{speechRate / SPEECH_RATE.divider}%</td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal({
                    isList: false,
                    tag: 'speechRate',
                    name:
                      texts[interfaceLanguage].components.settingsTable
                        .speechRate,
                    value: speechRate / SPEECH_RATE.divider,
                    options: toRoundValues(SPEECH_RATE),
                    optionsType: '%',
                  })
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {texts[interfaceLanguage].components.settingsTable.speechPitch}
            </th>
            <td>{speechPitch / SPEECH_PITCH.divider}%</td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal({
                    isList: false,
                    tag: 'speechPitch',
                    name:
                      texts[interfaceLanguage].components.settingsTable
                        .speechPitch,
                    value: speechPitch / SPEECH_PITCH.divider,
                    options: toRoundValues(SPEECH_PITCH),
                    optionsType: '%',
                  })
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {
                texts[interfaceLanguage].components.settingsTable
                  .timeForTheAlertMessage
              }
            </th>
            <td>
              {timeForTheAlertMessage / TIME_ALERT.divider}{' '}
              {texts[interfaceLanguage].components.settingsTable.sec}
            </td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal({
                    isList: false,
                    tag: 'timeForTheAlertMessage',
                    name:
                      texts[interfaceLanguage].components.settingsTable
                        .timeForTheAlertMessage,
                    value: timeForTheAlertMessage / TIME_ALERT.divider,
                    options: toRoundValues(TIME_ALERT),
                    optionsType:
                      texts[interfaceLanguage].components.settingsTable.sec,
                  })
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {
                texts[interfaceLanguage].components.settingsTable
                  .minTimeForExercises
              }
            </th>
            <td>
              {minTimeForExercises / TIME_EXERCISES.divider}{' '}
              {texts[interfaceLanguage].components.settingsTable.sec}
            </td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal({
                    isList: false,
                    tag: 'minTimeForExercises',
                    name:
                      texts[interfaceLanguage].components.settingsTable
                        .minTimeForExercises,
                    value: minTimeForExercises / TIME_EXERCISES.divider,
                    options: toRoundValues(TIME_EXERCISES),
                    optionsType:
                      texts[interfaceLanguage].components.settingsTable.sec,
                  })
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {
                texts[interfaceLanguage].components.settingsTable
                  .allSynonymsRequired
              }
            </th>
            <td>
              {
                texts[interfaceLanguage].components.settingsTable.synonyms[
                  String(allSynonymsRequired) as 'true' | 'false'
                ]
              }
            </td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal({
                    isList: true,
                    tag: 'allSynonymsRequired',
                    name:
                      texts[interfaceLanguage].components.settingsTable
                        .allSynonymsRequired,
                    value: String(allSynonymsRequired),
                    options:
                      texts[interfaceLanguage].components.settingsTable
                        .synonyms,
                    optionsType:
                      texts[interfaceLanguage].components.settingsTable.sec,
                  })
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {texts[interfaceLanguage].components.settingsTable.learnBatchSize}
            </th>
            <td>
              {learnBatchSize}{' '}
              {texts[interfaceLanguage].components.settingsTable.words}
            </td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal(
                    {
                      isList: false,
                      tag: 'learnBatchSize',
                      name:
                        texts[interfaceLanguage].components.settingsTable
                          .learnBatchSize,
                      value: learnBatchSize,
                      options: toRoundValues(LEARN_BATCH_SIZE),
                      optionsType:
                        texts[interfaceLanguage].components.settingsTable.words,
                    },
                    BootstrapSize.LG,
                  )
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {
                texts[interfaceLanguage].components.settingsTable
                  .dictionaryWordsPerPage
              }
            </th>
            <td>
              {dictionaryWordsPerPage}{' '}
              {texts[interfaceLanguage].components.settingsTable.words}
            </td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal(
                    {
                      isList: false,
                      tag: 'dictionaryWordsPerPage',
                      name:
                        texts[interfaceLanguage].components.settingsTable
                          .dictionaryWordsPerPage,
                      value: dictionaryWordsPerPage,
                      options: toRoundValues(DICTIONARY_WORDS_PER_PAGE),
                      optionsType:
                        texts[interfaceLanguage].components.settingsTable.words,
                    },
                    BootstrapSize.LG,
                  )
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
          <tr>
            <th scope="row">
              {
                texts[interfaceLanguage].components.settingsTable
                  .numberOfAttemptsToSkip
              }
            </th>
            <td>
              {numberOfAttemptsToSkip}{' '}
              {texts[interfaceLanguage].components.settingsTable.attempts}
            </td>
            <td>
              <Button
                color="info"
                className={styles.button}
                onClick={() =>
                  showModal(
                    {
                      isList: false,
                      tag: 'numberOfAttemptsToSkip',
                      name:
                        texts[interfaceLanguage].components.settingsTable
                          .numberOfAttemptsToSkip,
                      value: numberOfAttemptsToSkip,
                      options: toRoundValues(NUMBER_OF_ATTEMPTS_TO_SKIP),
                      optionsType:
                        texts[interfaceLanguage].components.settingsTable
                          .attempts,
                    },
                    BootstrapSize.MD,
                  )
                }
              >
                <AiOutlineSetting />
              </Button>
            </td>
          </tr>
        </tbody>
      </Table>
      <div className="text-center">
        <Button color="success" onClick={() => setIsShownConfirmModal(true)}>
          {texts[interfaceLanguage].components.settingsTable.reset}
        </Button>
      </div>
      <ModalWindow
        isShown={isEditShownModal}
        modalSize={modalSize}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title={
          <>
            {modalTitle}
            {modalErrorMessage && (
              <p className="text-danger mb-0 mt-1 font-weight-normal">
                {modalErrorMessage}
              </p>
            )}
          </>
        }
        confirmColor="info"
      >
        {modalContent}
      </ModalWindow>
      <ModalWindow
        isShown={isShownConfirmModal}
        modalSize={modalSize}
        onCancel={handleCancel}
        onConfirm={handleConfirm}
        title={
          texts[interfaceLanguage].components.settingsTable.resetModalTitle
        }
        confirmColor="info"
      >
        {texts[interfaceLanguage].components.settingsTable.resetConfirmation}
      </ModalWindow>
    </>
  );
};
