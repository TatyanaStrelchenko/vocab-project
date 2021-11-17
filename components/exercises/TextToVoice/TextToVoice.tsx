import React, { useEffect, useContext, useRef } from 'react';
import { Button, Input } from 'reactstrap';
import classnames from 'classnames';
import { FaTimes } from 'react-icons/fa';
import { Language, texts } from '@vocab/shared';
import SpeechRecognition from 'react-speech-recognition';
import { SettingsContext } from '../../../context/settings';
import { SpeechConverter } from '../../SpeechConverter';
import exercisesStyles from '../exercises.module.scss';

interface Props {
  wordText: string;
  placeholder?: string;
  learnLanguage: Language;
  userInput?: string | number | readonly string[];
  clearUserInput: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
  allowSkip: boolean;
  handleSkip: (event: React.MouseEvent<Element, MouseEvent>) => void;
}

export const TextToVoice: React.FC<Props> = (props) => {
  const {
    wordText,
    placeholder,
    userInput,
    clearUserInput,
    allowSkip,
    handleSkip,
    learnLanguage,
  } = props;
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  const inputEl = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputEl && inputEl.current) inputEl.current.focus();
  }, []);

  useEffect(() => {
    SpeechRecognition.startListening({
      continuous: true,
      language: learnLanguage,
    });

    return () => {
      SpeechRecognition.abortListening();
    };
  }, [learnLanguage]);

  return (
    <div className={exercisesStyles.flexColumnEnd}>
      <div className={exercisesStyles.centeringWrapper}>
        <h2 className="mb-4">{wordText}</h2>
      </div>

      <div className={exercisesStyles.speechInputWrapper}>
        <Input
          innerRef={inputEl}
          type="text"
          name="Word"
          id="word"
          className={classnames(exercisesStyles.speechInput, 'text-center')}
          value={userInput}
          readOnly={true}
          placeholder={placeholder}
        />
        {userInput && (
          <FaTimes
            className={exercisesStyles.clearBtn}
            onClick={(event) => {
              clearUserInput(event);
              if (inputEl && inputEl.current) inputEl.current.focus();
            }}
          />
        )}
      </div>
      <div className={exercisesStyles.speachBtnHolder}>
        <SpeechConverter language={learnLanguage} />
      </div>
      {allowSkip && (
        <Button color="warning" onClick={handleSkip}>
          {texts[interfaceLanguage].components.exercises.markAsLearned}
        </Button>
      )}
    </div>
  );
};
