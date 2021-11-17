import React, { useEffect, useRef, useContext } from 'react';
import classnames from 'classnames';
import { Button, Badge } from 'reactstrap';
import SpeechRecognition, {
  useSpeechRecognition,
} from 'react-speech-recognition';
import { texts } from '@vocab/shared';
import { SettingsContext } from '../../context/settings';
import styles from './styles.module.scss';

export interface Props {
  language: string;
}

export const SpeechConverter: React.FC<Props> = ({ language = 'en-US' }) => {
  const { listening } = useSpeechRecognition({
    clearTranscriptOnListen: true,
  });
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  useEffect(
    () => () => {
      SpeechRecognition.abortListening();
    },
    [],
  );

  const handleClick = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      SpeechRecognition.startListening({ language, continuous: true });
    }
  };

  const buttonEl = useRef<HTMLButtonElement>(null);

  const color = listening ? 'danger' : 'success';
  const listeningStyle = listening ? styles.listening : '';
  const text = listening
    ? texts[interfaceLanguage].components.speechConverter.listening
    : texts[interfaceLanguage].components.speechConverter.speak;

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return (
      <Badge color="danger">
        {texts[interfaceLanguage].components.speechConverter.noSupport}
      </Badge>
    );
  }

  return (
    <Button
      className={classnames(styles.controls, listeningStyle)}
      onClick={handleClick}
      color={color}
      innerRef={buttonEl}
    >
      {text}
    </Button>
  );
};
