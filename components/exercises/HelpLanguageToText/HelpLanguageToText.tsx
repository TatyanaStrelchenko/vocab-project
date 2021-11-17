import React, { useRef, useEffect, useContext } from 'react';
import { Button, FormGroup, Label, Input } from 'reactstrap';
import { AiFillSound } from 'react-icons/ai';
import { Language, texts } from '@vocab/shared';
import { FaTimes } from 'react-icons/fa';
import { SettingsContext } from '../../../context/settings';
import { UmlautKeyboard } from '../../UmlautKeyboard';
import exercisesStyles from '../exercises.module.scss';

interface Props {
  translatedWordText: string;
  placeholder?: string;
  learnLanguage: Language;
  userInput?: string | number | readonly string[];
  handleUserInput?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleSynthesis: (language?: Language) => void;
  clearUserInput: (event: React.MouseEvent<SVGElement, MouseEvent>) => void;
}

export const HelpLanguageToText: React.FC<Props> = ({
  translatedWordText,
  placeholder,
  learnLanguage,
  userInput,
  handleUserInput,
  clearUserInput,
  handleSynthesis,
}) => {
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
        <h2>{translatedWordText}</h2>
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
      {learnLanguage === 'de' && <UmlautKeyboard inputRef={inputEl} />}
    </div>
  );
};
