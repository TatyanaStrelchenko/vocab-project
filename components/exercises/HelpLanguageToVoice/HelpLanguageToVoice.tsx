import React, { useEffect, useRef, useContext } from 'react';
import { Button, Input } from 'reactstrap';
import classnames from 'classnames';
import { FaTimes } from 'react-icons/fa';
import { AiFillSound } from 'react-icons/ai';
import SpeechRecognition from 'react-speech-recognition';
import { Language, texts } from '@vocab/shared';
import { SettingsContext } from '../../../context/settings';
import { SpeechConverter } from '../../SpeechConverter';
import exercisesStyles from '../exercises.module.scss';

interface Props {
  translatedWordText: string;
  placeholder?: string;
  learnLanguage: Language;
  userInput?: string | number | readonly string[];
  handleSynthesis: (language?: Language) => void;
  clearUserInput?: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
  allowSkip: boolean;
  handleSkip?: (event: React.MouseEvent<Element, MouseEvent>) => void;
}

export const HelpLanguageToVoice: React.FC<Props> = ({
  translatedWordText,
  placeholder,
  learnLanguage,
  userInput,
  handleSynthesis,
  clearUserInput,
  allowSkip,
  handleSkip,
}) => {
  const inputEl = useRef<HTMLInputElement>(null);
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  useEffect(() => {
    if (inputEl && inputEl.current) inputEl.current.focus();
  });

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
        <Button
          color="primary"
          onClick={() => handleSynthesis()}
          className={exercisesStyles.soundButton}
        >
          <AiFillSound />
        </Button>
      </div>
      <h2 className="mb-4">{translatedWordText}</h2>
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
              clearUserInput && clearUserInput(event);
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
