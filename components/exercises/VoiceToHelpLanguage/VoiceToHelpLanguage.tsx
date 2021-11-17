import React, { useRef, useEffect, useContext } from 'react';
import { Button, FormGroup, Label, Input } from 'reactstrap';
import { AiFillSound } from 'react-icons/ai';
import { FaTimes } from 'react-icons/fa';
import { Language, texts } from '@vocab/shared';
import { SettingsContext } from '../../../context/settings';
import { SpeechConverter } from '../../SpeechConverter';
import { UmlautKeyboard } from '../../UmlautKeyboard';
import exercisesStyles from '../exercises.module.scss';

interface Props {
  placeholder?: string;
  helpLanguage: Language;
  userInput?: string | number | readonly string[];
  handleUserInput: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSynthesis: (language?: Language) => void;
  clearUserInput: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
}

export const VoiceToHelpLanguage: React.FC<Props> = (props) => {
  const {
    placeholder,
    helpLanguage,
    userInput,
    handleUserInput,
    handleSynthesis,
    clearUserInput,
  } = props;

  const inputEl = useRef<HTMLInputElement>(null);
  const { interfaceLanguage } = useContext(SettingsContext).settings;

  useEffect(() => {
    if (inputEl && inputEl.current) inputEl.current.focus();
  });

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
      <div className={exercisesStyles.speachBtnHolder}>
        <SpeechConverter language={helpLanguage} />
      </div>
      <FormGroup className={exercisesStyles.formBlock}>
        <Label for="word" hidden>
          {texts[interfaceLanguage].components.exercises.inputTheWord}
        </Label>
        <Input
          type="text"
          name="Word"
          id="word"
          className="text-center"
          innerRef={inputEl}
          placeholder={placeholder}
          value={userInput}
          onChange={handleUserInput}
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
      </FormGroup>

      {helpLanguage === 'de' && <UmlautKeyboard inputRef={inputEl} />}
    </div>
  );
};
